
import { Todo } from "./todo-item";
import { Log } from "./logger";

export { saveTodo, restoreTodo };

// Storage type
// "sessionStorage" saves data for a single session
// "localStorage" saves data across sessions
const type = "localStorage";

function storageAvailable() {
    let storage;
    try {
        storage = window[type];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return (
            e instanceof DOMException &&
            e.name === "QuotaExceededError" &&
            storage &&
            storage.length !== 0
        );
    }
}

function saveTodo(key, todo) {
    Log.v(`Saving Todo ${todo.title}`);

    // Validate we can save this Todo
    if (!storageAvailable()) {
        Log.e("localStorage is not available.  Cannot save Todo.");
        return;
    }
    if (!(typeof key === 'string')) {
        Log.e("'key' param must be a String.  Todo not saved.");
        Log.e(`'key' is instance of ${key.constructor.name}`)
        return;
    }
    if (!(todo instanceof Todo)) {
        Log.e("'todo' param must be a Todo.  Nothing saved.");
        return;
    }

    // Save the Todo
    // First stringify the Todo.  But the protected properties don't
    // get strigified, so we have to modify the JSON to add the
    // protected properties.
    let todoJsonStr = JSON.stringify(todo);
    let todoJsonObj = JSON.parse(todoJsonStr);
    todoJsonObj.priority = todo.priority;
    todoJsonStr = JSON.stringify(todoJsonObj);
    localStorage.setItem(key, todoJsonStr);
    Log.v(`Saved Todo ${todo.title}.`);
}

function restoreTodo (key) {
    Log.v(`Restoring Todo from key ${key}`);

    // Validate we can restore this Todo
    if (!storageAvailable()) {
        Log.e("localStorage is not available.  Cannot restore Todo.");
        return;
    }
    if (!(typeof key === 'string')) {
        Log.e("'key' param must be a String.  Todo not restored.");
        return;
    }

    // Get the raw stored data as a JSON string
    const todoRaw = localStorage.getItem(key);
    if (!todoRaw) {
        Log.e(`Could not restore ${key}.`);
        return;
    }

    // Parse the JSON to an intermediate object
    const todoJson = JSON.parse(todoRaw);

    // Create and return a new Todo made from the restored data
    return new Todo(
        todoJson.title,
        todoJson.description,
        new Date(todoJson.dueDate),
        todoJson.priority,
    )
}