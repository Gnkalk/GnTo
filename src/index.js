const Submitbtn = document.getElementById("submit");
const Content = document.getElementsByClassName("content");
const loader = document.querySelector("#loading");

let db = null;

CreateDB();

Submitbtn.addEventListener("click", addTodo);

function complateTodo(id){
    const request = db.transaction("todo_list", "readwrite")
    request.onerror = e => {
        console.error(`error: ${e.target.error} was found `);
    }

    const todoStore = request.objectStore("todo_list");
    todoStore.get(id).onsuccess = e => {
        const todo = e.target.result;
        if (todo){
            todo.complate = !todo.complate;
            todoStore.put(todo);
        } else {
        todo.complate = true;
        console.log(todo.complate)
        todoStore.put(todo);
        }
    }

    Content[0].innerHTML = "";
    viewTodo();
}

function complateTodoToggle(id){
    const element = document.getElementById(id);
    element.classList.add("complate");
}

function deleteTodo(id){
    const request = db.transaction("todo_list", "readwrite")
    request.onerror = e => {
        console.error(`error: ${e.target.error} was found `);
    }

    const todoStore = request.objectStore("todo_list");
    todoStore.delete(id);

    Content[0].innerHTML = "";
    viewTodo();
}

function viewTodo(){
    loading();

    const todolist = db.transaction("todo_list", "readonly").objectStore("todo_list");
    
    const request = todolist.openCursor();
    request.onsuccess = e => {
        const cursor = e.target.result;
        if(cursor){
            Content[0].innerHTML += `
            <div class="card" id="${cursor.value.id}">
            <h4>${cursor.value.title}</h4>
            <p>${cursor.value.description}</p>
            <br>
            <div class="footer" d-flex>
                <button theme="inline" onclick="complateTodo('${cursor.value.id}');">تمام!</button>
                <button theme="outline" onclick="deleteTodo('${cursor.value.id}');">حذف</button>
            </div>
            </div>`;
            if(cursor.value.complate){
                complateTodoToggle(cursor.value.id);
            }
            cursor.continue();
        }
    }

    request.onerror = e => {
        console.error(`Error! | code: ${e.target.errorCode}`);
    }
}

function addTodo(){
    const todo = {
        id: "note" + Math.random(),
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        complate: false
    }

    const request = db.transaction("todo_list", "readwrite")
    request.onerror = e => {
        console.error(`error: ${e.target.error} was found `);
    }

    const todoStore = request.objectStore("todo_list");
    if (todo.title || todo.description){
        todoStore.add(todo);
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
    
        Content[0].innerHTML = "";
        viewTodo();
    } else {
        alerterror();
    }

}

function CreateDB(){
    const request = indexedDB.open("todo_db", 3);

    request.onupgradeneeded = e => {
        db = e.target.result;

        const todoStore = db.createObjectStore("todo_list", {keyPath: "id"});
    }

    request.onsuccess = e => {
        db = e.target.result;

        viewTodo();
    }

    request.onerror = e => {
        console.error(`error: ${e.target.error} was found `);
    }

}

function loading(){
    loader.classList.add("active");
    setTimeout(() => {
        loader.classList.remove("active");
    }, 1500);
}

function alerterror(){
    document.querySelector("#error").toggleAttribute("active");
}