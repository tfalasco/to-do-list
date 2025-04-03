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
    const todoDueDonecontainer = document.createElement("div");
    const todoDueDate = document.createElement("p");
    const todoDone = createCustomCheckbox("Done", todo.id, (e) => {
        todo.done = e.target.checked;
        const todoCardElement = e.target.parentNode.parentNode.parentNode;
        addOrRemoveDoneStyle(todoCardElement, todo.done);
    }, todo.done, false);

    todoTitle.innerText = todo.title;
    todoDescription.innerText = todo.description;
    todoDueDate.innerText = "Due " + formatDueDate(todo.dueDate);
    todoDone.type = "checkbox";
    todoDone.checked = todo.done;
    todoDueDonecontainer.classList.add("due-done-container");

    todoDueDonecontainer.appendChild(todoDueDate);
    todoDueDonecontainer.appendChild(todoDone);
    todoCard.appendChild(todoTitle);
    todoCard.appendChild(todoDescription);
    todoCard.appendChild(todoDueDonecontainer);

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
    else if (dayDifference === 1) {
        return "tomorrow";
    }
    else if (dayDifference === -1) {
        return "yesterday";
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