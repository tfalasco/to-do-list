export { createProjectCard }

import { createCustomCheckbox } from "./custom-checkbox.js";
import { createTodoCard } from "./display-todo.js";
import { Log } from "./logger.js";
import { Project } from "./project";
import { Todo } from "./todo-item.js";

const container = document.createElement("div");

function createProjectCard(project) {
    if (!project instanceof Project) {
        Log.e("'project' must be of type Project.  Nothing displayed.");
        return;
    }

    const title = document.createElement("h1");
    title.innerText = project.name;
    container.appendChild(title);

    const todos = project.todos;
    for (const todo of todos.values()) {
        const todoTitle = document.createElement("h2");
        todoTitle.innerText = todo.title;
        container.appendChild(displayTodo(todo));
    }

    return container;
}

function displayTodo(todo) {
        if (!todo instanceof Todo) {
        Log.e("'todo' must be of type Todo. Item not displayed.");
        return;
    }

    return createTodoCard(todo);
}
