export { createProjectCard }

import { createCustomCheckbox } from "./custom-checkbox.js";
import { createTodoCard } from "./display-todo.js";
import { Log } from "./logger.js";
import { Project } from "./project";
import { Todo } from "./todo-item.js";
import "./styles/project.css";


function createProjectCard(project) {
    const container = document.createElement("div");
    const details = document.createElement("details");

    if (!project instanceof Project) {
        Log.e("'project' must be of type Project.  Nothing displayed.");
        return;
    }

    const title = document.createElement("summary");
    title.innerText = project.name;
    details.appendChild(title);

    const todos = project.todos;
    for (const todo of todos.values()) {
        const todoTitle = document.createElement("h2");
        todoTitle.innerText = todo.title;
        details.appendChild(displayTodo(todo));
    }

    container.classList.add("project-container");
    container.appendChild(details);

    return container;
}

function displayTodo(todo) {
        if (!todo instanceof Todo) {
        Log.e("'todo' must be of type Todo. Item not displayed.");
        return;
    }

    return createTodoCard(todo);
}
