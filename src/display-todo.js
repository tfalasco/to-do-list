import { Todo } from "./todo-item";
import { differenceInCalendarDays } from "date-fns";
import { Log } from "./logger";
import { createCustomCheckbox } from "./custom-checkbox";
import { getAppHandlerInstance } from "./app-handler";
import "./styles/todo-card.css";
import "./styles/modal.css";

export { createTodoCard, createTodoDialog };

function createTodoCard(todo) {
  if (!(todo instanceof Todo)) {
    Log.e("'todo' must be of type Todo. Item not displayed.");
    return;
  }

  Log.d(todo);

  const todoCard = document.createElement("div");
  const todoTitleBar = document.createElement("div");
  const todoTitle = document.createElement("h2");
  const todoDescription = document.createElement("p");
  const todoDueDonecontainer = document.createElement("div");
  const todoDueDate = document.createElement("p");
  const todoDone = createCustomCheckbox(
    "Done",
    todo.id,
    (e) => {
      todo.done = e.target.checked;
      const todoCardElement = e.target.parentNode.parentNode.parentNode;
      addOrRemoveDoneStyle(todoCardElement, todo.done);
    },
    todo.done,
    false,
  );
  const deleteTodoButton = document.createElement("button");

  todoTitleBar.classList.add("todo-title-bar");
  todoTitle.innerText = todo.title;
  todoDescription.innerText = todo.description;
  formatDueDate(todoDueDate, todo.dueDate);
  todoDone.type = "checkbox";
  todoDone.checked = todo.done;
  todoDueDonecontainer.classList.add("due-done-container");

  deleteTodoButton.classList.add("delete-todo-button");
  deleteTodoButton.innerText = "X";
  deleteTodoButton.addEventListener("click", () => {
    // TODO: get a reference to the parent project
    // The list of Todos has an ID in the format:
    // <project id>-todos.  We can use that
    const todoList = todoCard.parentNode;
    const projectId = todoList.id.substring(0, todoList.id.indexOf("-"));

    // Delete Todo from Project
    const appHandler = getAppHandlerInstance();
    appHandler.deleteTodoFromProject(projectId, todo.id);

    // Update the display
    appHandler.refreshProjectTodos(projectId);
  });

  todoDueDonecontainer.appendChild(todoDueDate);
  todoDueDonecontainer.appendChild(todoDone);
  todoTitleBar.appendChild(todoTitle);
  todoTitleBar.appendChild(deleteTodoButton);
  todoCard.appendChild(todoTitleBar);
  todoCard.appendChild(todoDescription);
  todoCard.appendChild(todoDueDonecontainer);

  addOrRemoveDoneStyle(todoCard, todo.done);
  todoCard.classList.add("todo-card");

  return todoCard;
}

function formatDueDate(dueDateDiv, dueDate) {
  const dayDifference = differenceInCalendarDays(dueDate, new Date());
  const pluralize = Math.abs(dayDifference) === 1 ? "" : "s";
  let when = "";

  if (0 === dayDifference) {
    when = "today";
  } else if (dayDifference === 1) {
    when = "tomorrow";
  } else if (dayDifference === -1) {
    when = "yesterday";
  } else if (dayDifference > 0) {
    when = `in ${dayDifference} day${pluralize}`;
  } else {
    when = `${Math.abs(dayDifference)} day${pluralize} ago`;
  }

  dueDateDiv.innerText = "Due " + when;
  if (dayDifference < 0) {
    dueDateDiv.classList.add("overdue");
  }
}

function addOrRemoveDoneStyle(todoCard, add) {
  if (add) {
    todoCard.classList.add("todo-done");
  } else {
    todoCard.classList.remove("todo-done");
  }
}

function createTodoDialog() {
  // Create DOM elements and set their attributes
  // Create the outer dialog
  const dialog = document.createElement("dialog");
  dialog.id = "add-todo-dialog";
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
  titleLabel.innerHTML = "New Todo";
  titleLabel.htmlFor = "title-input";

  // Create the detail section
  const detailContainer = document.createElement("p");

  const detailInput = document.createElement("input");
  detailInput.type = "text";
  detailInput.name = "detail-input";
  detailInput.classList.add("input");

  const detailLabel = document.createElement("label");
  detailLabel.innerHTML = "Details";
  detailLabel.htmlFor = "detail-input";

  // Create the due date input
  const dueContainer = document.createElement("p");

  const dueInput = document.createElement("input");
  dueInput.type = "date";
  dueInput.name = "due-input";
  dueInput.classList.add("input");

  const dueLabel = document.createElement("label");
  dueLabel.innerHTML = "Due";
  dueLabel.htmlFor = "due-input";

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
  // When the dialog closes, add the new todo or cancel,
  // depending on the close return value.
  // In either case, clear the input fields so it is ready
  // for the next time.
  dialog.addEventListener("close", () => {
    if (dialog.returnValue === "add") {
      // If the dialog is closed with the "add" value,
      // we need to create the todo and display it
      // in the project's todo list.

      if (titleInput.value !== "") {
        let newDate = new Date();
        if (dueInput.value !== "") {
          const dateParts = dueInput.value.split("-");
          newDate = new Date(
            +dateParts[0],
            dateParts[1] - 1,
            +dateParts[2],
            12,
          );
        }

        // Create the todo
        const newTodo = new Todo(titleInput.value, detailInput.value, newDate);

        // Display the todo
        // Add the todo to the project
        const appHandler = getAppHandlerInstance();
        appHandler.addTodoToProject(dialog.dataset.projectRef, newTodo);

        // TODO: update the project display
        appHandler.refreshProjectTodos(dialog.dataset.projectRef);
      }
    }
    // Clear the dialog entries
    titleInput.value = "";
    detailInput.value = "";
    dueInput.value = "";
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

  detailContainer.appendChild(detailLabel);
  detailContainer.appendChild(detailInput);

  dueContainer.appendChild(dueLabel);
  dueContainer.appendChild(dueInput);

  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(addButton);

  entryForm.appendChild(titleContainer);
  entryForm.appendChild(detailContainer);
  entryForm.appendChild(dueContainer);
  entryForm.appendChild(buttonContainer);

  dialog.appendChild(entryForm);

  return dialog;
}
