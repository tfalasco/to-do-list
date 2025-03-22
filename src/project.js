import { Todo } from "./todo-item.js";
import { Log } from "./logger.js";
import { saveProject } from "./storage-wrapper.js";

export { Project };

class Project {
    #id

    /**
     * @param {String} name
     * @param {String} id
     */
    constructor (name, id) {
        this._name = name;
        this._todos = new Map();
        if (id === undefined) {
            this.#id = Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
        }
        else {
            this.#id = id;
        }

        // If an ID was not provided, then this is a new Project.
        // If an ID was provided, then this is Project is getting recreated
        // from stored data.
        // In the latter case, we do not need to save this Project.
        if (id === undefined) {
            save(this);
        }
    }

    /**
     * addTodo
     *
     * Add a new Todo object to the private #todos array
     *
     * @param {Todo} newTodo
     */
    addTodo(newTodo) {
        if (newTodo instanceof Todo) {
            this._todos.set(newTodo.id, newTodo);
            Log.v(`Added new todo ${newTodo.title}`);
            save(this);
        }
        else {
            Log.e("Could not add todo item.  Parameter was of wrong type.");
            Log.e(`Expected Todo, got ${typeof newTodo}.`);
        }
    }

    get todos() {
        return this._todos;
    }

    get id() {
        return this.#id;
    }

    /**
     * @param {String} newName
     */
    set name(newName) {
        this.name = newName;
        save(this);
    }

    get name() {
        return this._name;
    }
}

function save(project) {
    saveProject(project.id, project);
}