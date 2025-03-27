import { Todo } from "./todo-item";
import { differenceInCalendarDays, differenceInDays, formatDistanceToNow } from "date-fns";
import { Log } from "./logger";
import { createCustomCheckbox } from "./custom-checkbox";
import "./styles/todo-card.css";

export { createTodoCard };

function createTodoCard(todo) {
    if (!todo instanceof Todo) {
        Log.e("'todo' must be of type Todo. Item not displayed.");
        return;
    }

    Log.d(todo);

    const todoCard = document.createElement("div");
    const todoTitle = document.createElement("h2");
    const todoDescription = document.createElement("p");
    const todoDueDate = document.createElement("p");
    // const todoId = document.createElement("p");
    const todoDone = createCustomCheckbox("Done", todo.id, (e) => {
        todo.done = e.target.checked;
        const todoCardElement = e.target.parentNode.parentNode;
        addOrRemoveDoneStyle(todoCardElement, todo.done);
    }, todo.done, false);

    todoTitle.innerText = todo.title;
    todoDescription.innerText = todo.description;
    todoDueDate.innerText = "Due " + formatDueDate(todo.dueDate);
    // todoId.innerText = `ID: ${todo.id}`;
    todoDone.type = "checkbox";
    todoDone.checked = todo.done;

    todoCard.appendChild(todoTitle);
    todoCard.appendChild(todoDescription);
    // todoCard.appendChild(todoId);
    todoCard.appendChild(todoDueDate);
    todoCard.appendChild(todoDone);

    addOrRemoveDoneStyle(todoCard, todo.done);
    todoCard.classList.add("todo-card");

    return todoCard;
}

function formatDueDate(dueDate) {
    const dayDifference = differenceInCalendarDays(dueDate, new Date());
    const pluralize = (Math.abs(dayDifference) === 1) ? "" : "s";

    if (0 === dayDifference) {
        return "today";
    }
    else if (dayDifference > 0) {
        return `in ${dayDifference} day${pluralize}`;
    }
    else {
        return `${Math.abs(dayDifference)} day${pluralize} ago`;
    }
}

function addOrRemoveDoneStyle(todoCard, add) {
    if (add) {
        todoCard.classList.add("todo-done");
    }
    else {
        todoCard.classList.remove("todo-done");
    }
}