
import { Todo } from "./todo-item.js";
import { Log } from "./logger.js";
import { Project } from "./project.js";

export {
    saveTodo,
    restoreTodo,
    saveProject,
    restoreProject,
    fetchProjectIds,
 };

// Storage type
// "sessionStorage" saves data for a single session
// "localStorage" saves data across sessions
const type = "localStorage";
const storage = window[type];

// Project IDs Array
// Projects are stored by their ids.  This array tracks all
// stored projectid s so they can be easily restored.
const projectIds = new Array();

/**
 * storageAvailable
 *
 * Checks if storage is available before saving values to localstorage
 *
 * @returns
 */
function storageAvailable() {
    try {
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
 * storeProjectId
 *
 * Stores the project ID in the projectIds array and saves to
 * local storage.
 *
 * If the ID already exists in the array, nothing is done.
 * @param {String} projectId
 */
function storeProjectId(projectId) {
    if (!projectIds.includes(projectId)) {
        projectIds.push(projectId);
        if (!storageAvailable()) {
            Log.e("localStorage is not available.  Cannot save projectIds.");
            return;
        }
        else {
            storage.setItem("projectIds", JSON.stringify(projectIds));
        }
    }
}

/**
 * fetchProjectIds
 *
 * Reads the saved array of saved project IDs and returns it.
 *
 * @returns Array of project IDs saved in localstorage
 */
function fetchProjectIds() {
    if (!storageAvailable()) {
        Log.e("localStorage is not available.  Cannot restore projectIds.");
        return null;
    }
    else {
        return JSON.parse(storage.getItem("projectIds"));
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
    todoJsonObj.id = todo.id;
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
        todoJson._title,
        todoJson._description,
        new Date(todoJson.dueDate),
        todoJson._priority,
        todoJson.id,
        todoJson._done,
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
    storage.setItem(key, stringifyTodo(todo));
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
    const todoString = storage.getItem(key);
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

    // The protected properties don't get stringified, so we have
    // to modify the JSON to add the protected properties.
    const projectJsonObj = JSON.parse(projectJsonStr);
    projectJsonObj.id = project.id;

    // We are only saving the IDs of this project's Todos because
    // each Todo is saved separately, using its ID as the key.
    const todoKeyArray = Array.from(project.todos.keys());
    projectJsonObj._todos = todoKeyArray;

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
    const project = new Project(projectJson._name, projectJson.id);
    // We only store the ID of each todo, so we need to fetch the
    // Todo object from memory and add it to the project
    for (const todoId of projectJson._todos) {
        const todo = restoreTodo(todoId);
        if (todo) {
            project.addTodo(todo);
        }
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
    Log.v(`Saving Project ${project._name}`);

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
    storage.setItem(key, stringifyProject(project));
    Log.v(`Saved Project ${project._name}`);

    // Save the project ID
    storeProjectId(project.id);
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
    const projectString = storage.getItem(key);
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
    storage.setItem(key, stringifyProjectArray(projectArray));
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
    const projectArrayString = storage.getItem(key);
    if (!projectArrayString) {
        Log.e(`Could not restore ${key}.`);
        return;
    }

    return parseProjectArrayString(projectArrayString);
}