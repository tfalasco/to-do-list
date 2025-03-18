
import { Todo } from "./todo-item.js";
import { Log } from "./logger.js";
import { Project } from "./project.js";

export {
    saveTodo,
    restoreTodo,
    saveProject,
    restoreProject,
    saveProjectArray,
    restoreProjectArray,
 };

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

/**
 * stringifyTodo
 *
 * Convert a Todo into a storable JSON string
 *
 * @param {Todo} todo
 * @returns JSON String representation of the Todo
 */
function stringifyTodo(todo) {
    // The protected properties don't get stringified, so we have
    // to modify the JSON to add the protected properties.
    const todoJsonStr = JSON.stringify(todo);
    const todoJsonObj = JSON.parse(todoJsonStr);
    todoJsonObj.priority = todo.priority;
    return JSON.stringify(todoJsonObj);
}

/**
 * parseTodoString
 *
 * Convert a JSON string representation of a Todo into a Todo object
 *
 * @param {String} todoString
 * @returns a Todo object created from the JSON string
 */
function parseTodoString(todoString) {
    // Parse the JSON string to an intermediate object
    const todoJson = JSON.parse(todoString);

    // Create and return a new Todo made from the restored data
    return new Todo(
        todoJson.title,
        todoJson.description,
        new Date(todoJson.dueDate),
        todoJson.priority,
    )
}

/**
 * saveTodo
 *
 * Save the Todo to localStorage
 *
 * @param {String} key
 * @param {Todo} todo
 * @returns
 */
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
    localStorage.setItem(key, stringifyTodo(todo));
    Log.v(`Saved Todo ${todo.title}.`);
}

/**
 * restoreTodo
 *
 * Recreate a Todo from the stored JSON string in localStorage
 *
 * @param {String} key
 * @returns Todo object recreated from the key in localStorage
 */
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
    const todoString = localStorage.getItem(key);
    if (!todoString) {
        Log.e(`Could not restore ${key}.`);
        return;
    }

    return parseTodoString(todoString);
}

/**
 * stringifyProject
 *
 * Convert Project into storable JSON string
 *
 * @param {Project} project
 * @returns JSON string representation of the Project
 */
function stringifyProject(project) {
    // Stringify the project object
    const projectJsonStr = JSON.stringify(project);

    // The array of Todos does not automatically get stringified.
    // Stringify the Todos array and add it to the JSON.
    const projectJsonObj = JSON.parse(projectJsonStr);
    let todosArray = new Array();
    for (const todo of project.todos) {
        todosArray.push(stringifyTodo(todo));
    }
    projectJsonObj.todos = todosArray;

    return JSON.stringify(projectJsonObj);
}

/**
 * parseProjectString
 *
 * Convert a JSON string representation of a Project into a Project object
 *
 * @param {String} projectString
 * @returns A Project object created from the JSON string
 */
function parseProjectString(projectString){
    // Parse the JSON string to an intermediate object
    const projectJson = JSON.parse(projectString);

    // Create and return a new Project made from the restored data
    const project = new Project(projectJson.name);
    for (const todoStr of projectJson.todos) {
        const todoJson = parseTodoString(todoStr);
        Log.d(`todoJson: ${todoJson}`);
        Log.d(`todoJson.title: ${todoJson.title}`);
        const todo = new Todo (
            todoJson.title,
            todoJson.description,
            new Date(todoJson.dueDate),
            todoJson.priority,
        )
        project.addTodo(todo);
    }

    return project;
}

/**
 * saveProject
 *
 * Save the project to local storage
 *
 * @param {String} key
 * @param {Project} project
 * @returns
 */
function saveProject(key, project) {
    Log.v(`Saving Project ${project.name}`);

    // Validate we can save this Project
    if (!storageAvailable()) {
        Log.e("localStorage is not available.  Cannot save Project.");
        return;
    }
    if (!(typeof key === 'string')) {
        Log.e("'key' param must be a String.  Project not saved.");
        Log.e(`'key' is instance of ${key.constructor.name}`)
        return;
    }
    if (!(project instanceof Project)) {
        Log.e("'project' param must be a Project.  Nothing saved.");
        return;
    }

    // Save the project
    localStorage.setItem(key, stringifyProject(project));
    Log.v(`Saved Project ${project.name}`);
}

/**
 * restoreProject
 *
 * Recreate a Project from the stored JSON string in localStorage
 *
 * @param {String} key
 * @returns Project object recreated from the key in localStorage
 */
function restoreProject(key) {
    Log.v(`Restoring Project from key ${key}`);

    // Validate we can restore this Project
    if (!storageAvailable()) {
        Log.e("localStorage is not available.  Cannot restore Project.");
        return;
    }
    if (!(typeof key === 'string')) {
        Log.e("'key' param must be a String.  Project not restored.");
        return;
    }

    // Get the raw stored data as a JSON string
    const projectString = localStorage.getItem(key);
    if (!projectString) {
        Log.e(`Could not restore ${key}.`);
        return;
    }

    return parseProjectString(projectString);
}

/**
 * stringifyProjectArray
 *
 * Convert and array of Projects into storable JSON string
 * @param {Project[]} projectArray
 * @returns JSON string representation of the array of Projects
 */
function stringifyProjectArray(projectArray) {
    // Stringify the array of Project objects
    let stringifiedProjectArray = new Array();
    for (const project of projectArray) {
        stringifiedProjectArray.push(stringifyProject(project));
    }

    return JSON.stringify(stringifiedProjectArray);
    // return stringifiedProjectArray;
}

/**
 * parseProjectArrayString
 *
 * Convert a JSON string representation of an array of Projects into a Project array
 *
 * @param {String} projectArrayString
 * @returns A Project array created from the JSON string
 */
function parseProjectArrayString(projectArrayString){
    // Parse the JSON string to an intermediate object
    const projectJsonArray = JSON.parse(projectArrayString);

    // Create and return a new array of Projects made from the restored data
    let projectArray = new Array();
    for (const projectJson of projectJsonArray) {
        projectArray.push(parseProjectString(projectJson));
    }

    return projectArray;
}

/**
 * saveProjectArray
 *
 * Save the array of Projects to local storage
 *
 * @param {String} key
 * @param {Project[]} projectArray
 * @returns
 */
function saveProjectArray(key, projectArray) {
    Log.v(`Saving Project array (${projectArray.length} Projects)`);

    // Validate we can save this array of Projects
    if (!storageAvailable()) {
        Log.e("localStorage is not available.  Cannot save Project array.");
        return;
    }
    if (!(typeof key === 'string')) {
        Log.e("'key' param must be a String.  Project array not saved.");
        Log.e(`'key' is instance of ${key.constructor.name}`)
        return;
    }
    if (projectArray.length === 0) {
        Log.e("No Projects in 'projectArray'.  Nothing to save.");
        return;
    }
    for (let i = 0; i < projectArray.length; i++) {
        if (!(projectArray[i] instanceof Project)) {
            Log.e("'projectArray' param must be an array of Projects.  Nothing saved.");
            return;
        }
    }

    // Save the Project array
    localStorage.setItem(key, stringifyProjectArray(projectArray));
    Log.v(`Saved Project array (${projectArray.length} Projects)`);
}

/**
 * restoreProjectArray
 *
 * Recreate an array of Projects from the stored JSON string in localStorage
 *
 * @param {String} key
 * @returns The array of Projects recreated from the key in localStorage
 */
function restoreProjectArray(key) {
    Log.v(`Restoring Project array from key ${key}`);

    // Validate we can restore this Project array
    if (!storageAvailable()) {
        Log.e("localStorage is not available.  Cannot restore Project.");
        return;
    }
    if (!(typeof key === 'string')) {
        Log.e("'key' param must be a String.  Project not restored.");
        return;
    }

    // Get the raw stored data as a JSON string
    const projectArrayString = localStorage.getItem(key);
    if (!projectArrayString) {
        Log.e(`Could not restore ${key}.`);
        return;
    }

    return parseProjectArrayString(projectArrayString);
}