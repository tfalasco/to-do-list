
import { Todo } from "./todo-item.js";
import { Log } from "./logger.js";
import { Project } from "./project.js";

export {
    saveTodo,
    autoSaveTodo,
    restoreTodo,
    deleteItem,
    saveProject,
    autoSaveProject,
    restoreProject,
    fetchProjectIds,
    AutosavedMap,
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
 * @returns {Boolean}
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
 * @returns {String[]} Array of project IDs saved in localstorage
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
 * @returns {Todo} a Todo object created from the JSON string
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
 * autoSaveTodo
 *
 * Create a Proxy of the given Todo that saves to
 * local storage whenever the Todo is changed.
 *
 * @param {Todo} todo
 * @returns {Proxy} A Proxy of the given Todo
 */
function autoSaveTodo(todo) {
    const handler = {
        set(target, prop, newValue) {
            const result = Reflect.set(...arguments);
            Log.v("Autosaving Todo...");
            saveTodo(target.id, target);
            return result;
        },
        deleteProperty(target, prop) {
            const result = Reflect.deleteProperty(...arguments);
            Log.v("Autosaving Todo...");
            saveTodo(target.id, target);
            return result;
        }
      };

      const autoSavedTodo = new Proxy(todo, handler);
      return autoSavedTodo;
}

/**
 * restoreTodo
 *
 * Recreate a Todo from the stored JSON string in localStorage
 *
 * @param {String} key
 * @returns {Todo} Todo object recreated from the key in localStorage
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
 * deleteItem
 *
 * Delete the item from storage with the given key
 *
 * @param {String} key
 */
function deleteItem(key) {
    storage.removeItem(key);
}

/**
 * stringifyProject
 *
 * Convert Project into storable JSON string
 *
 * @param {Project} project
 * @returns {String} JSON string representation of the Project
 */
function stringifyProject(project) {
    // We can't stringify the project because the AutosavedMap
    // contains a reference to its parent Project, which would
    // create a circular reference.  Instead, we will stringify
    // the project manually.
    const projectJsonObj = JSON.parse("{}");
    projectJsonObj._name = project.name;
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
 * @returns {Project} A Project object created from the JSON string
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
            project.addTodo(autoSaveTodo(todo));
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
 * autoSaveProject
 *
 * Create a Proxy of the given Project that saves to
 * local storage whenever the Project is changed.
 *
 * @param {Project} project
 * @returns A Proxy of the given Project
 */
function autoSaveProject(project) {
    const handler = {
        set(target, prop, newValue) {
                const result = Reflect.set(...arguments);
                Log.v("Autosaving Project...");
                saveProject(target.id, target);
                return result;
        },
        deleteProperty(target, prop) {
                const result = Reflect.deleteProperty(...arguments);
                Log.v("Autosaving Project...");
                saveProject(target.id, target);
                return result;
        },
      };

      const autoSavedProject = new Proxy(project, handler);
      return autoSavedProject;
}

/**
 * restoreProject
 *
 * Recreate a Project from the stored JSON string in localStorage
 *
 * @param {String} key
 * @returns {Project} Project object recreated from the key in localStorage
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
 * @returns {String} JSON string representation of the array of Projects
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
 * @returns {Project[]} A Project array created from the JSON string
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
 * AutosavedMap
 *
 * An extension of the built-in Map that saves its parent
 * Project whenever an entry is added or removed.
 */
class AutosavedMap extends Map {
    constructor(parentProject) {
        super();
        this.parentProject = parentProject;
        Log.d(this.parentProject);
    }
    set(...args) {
        super.set(...args);
        Log.v("Autosaving Map.set");
        saveProject(this.parentProject.id, this.parentProject);
    }
    deleteProperty(...args) {
        super.deleteProperty(...args);
        Log.v("Autosaving Map.deleteProperty");
        saveProject(this.parentProject.id, this.parentProject);
    }
}