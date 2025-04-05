export { createProjectCard, createProjectDialog, refreshProjectCardTodos }

import { createCustomCheckbox } from "./custom-checkbox.js";
import { createTodoCard } from "./display-todo.js";
import { Log } from "./logger.js";
import { Project } from "./project";
import { Todo } from "./todo-item.js";
import "./styles/project.css";
import "./styles/modal.css";


function createProjectCard(project) {
    const container = document.createElement("div");
    const details = document.createElement("details");
    const todoContainer = document.createElement("div");
    const addTodoButton = document.createElement("button");

    if (!project instanceof Project) {
        Log.e("'project' must be of type Project.  Nothing displayed.");
        return;
    }

    const title = document.createElement("summary");
    title.innerText = project.name;
    details.appendChild(title);

    const todos = project.todos;
    for (const todo of todos.values()) {
        todoContainer.appendChild(displayTodo(todo));
    }
    todoContainer.id = `${project.id}-todos`;
    details.appendChild(todoContainer);

    addTodoButton.classList.add("add-todo-button");
    addTodoButton.innerText = "+";
    addTodoButton.addEventListener("click", () => {
        const dialog = document.querySelector("#add-todo-dialog");
        dialog.setAttribute("data-project-ref", project.id);
        dialog.showModal();
    })
    details.appendChild(addTodoButton);

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

function refreshProjectCardTodos(project) {
    const todoContainer = document.querySelector(`#${project.id}-todos`);
    todoContainer.innerHTML = "";

    const todos = project.todos;
    for (const todo of todos.values()) {
        todoContainer.appendChild(displayTodo(todo));
    }
}

function createProjectDialog() {
    // Create DOM elements and set their attributes
    // Create the outer dialog
    const dialog = document.createElement("dialog");
    dialog.id = "add-project-dialog";
    dialog.classList.add("modal-dialog");

    // Create the form for the dialog
    const entryForm = document.createElement("form");
    entryForm.method = "dialog";

    // Create the title input section
    const titleContainer = document.createElement("p");

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.name = "title-input";
    titleInput.classList.add("input");
    titleInput.autofocus = true;

    const titleLabel = document.createElement("label");
    titleLabel.innerHTML = "New List";
    titleLabel.htmlFor = "title-input";

    // Create the add and cancel buttons
    const buttonContainer = document.createElement("p");
    buttonContainer.classList.add("button-container");

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.classList.add("cancel-button");
    cancelButton.value = "cancel";
    cancelButton.formMethod = "dialog";
    cancelButton.innerText = "Cancel";

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.classList.add("add-button");
    addButton.value = "add";
    addButton.innerText = "Add";

    // Register event listeners
    // When the dialog closes, add the new project or cancel,
    // depending on the close return value.
    // In either case, clear the title input field so it is ready
    // for the next time.
    dialog.addEventListener("close", () => {
        if (dialog.returnValue === "add") {
            // If the dialog is closed with the "add" value,
            // we need to create the project and display it
            // in the project list.

            if (titleInput.value !== "") {
                // Create the project
                const newProject = new Project(titleInput.value);

                // Display the project
                document.body.appendChild(createProjectCard(newProject));
            }
        }
        // Clear the dialog entries
        titleInput.value = "";
    });

    // Check for the Enter and Esc keys and add the project or
    // cancel the input
    dialog.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            dialog.close("add");
        }
        if (event.key === "Escape") {
            dialog.close("cancel");
        }
    });

    // Cancel the new project input
    cancelButton.addEventListener("click", () => {
        dialog.close("cancel");
    });

    // Add the new project
    addButton.addEventListener("click", (event) => {
        event.preventDefault();
        dialog.close("add");
    });

    // Assemble the elements into a dialog form
    titleContainer.appendChild(titleLabel);
    titleContainer.appendChild(titleInput);

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(addButton);

    entryForm.appendChild(titleContainer);
    entryForm.appendChild(buttonContainer);

    dialog.appendChild(entryForm);

    return dialog;
}
