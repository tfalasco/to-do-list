import { Todo } from "./todo-item.js";
import { Log } from "./logger.js";
import { autoSaveProject, saveProject, AutosavedMap } from "./storage-wrapper.js";

export { Project };

class Project {
    /**
     * @param {String} name
     * @param {String} id
     */
    constructor (name, id) {
        this._name = name;
        this._todos = new AutosavedMap(this);
        if (id === undefined) {
            this._id = Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
        }
        else {
            this._id = id;
        }

        saveProject(this.id, this);
        return autoSaveProject(this);
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
        }
        else {
            Log.e("Could not add todo item.  Parameter was of wrong type.");
            Log.e(`Expected Todo, got ${typeof newTodo}.`);
        }
    }

    /**
     * deleteTodo
     *
     * Delete the entry from the _todos map with the key that
     * matches the todoId parameter.
     *
     * @param {String} todoId
     */
    deleteTodo(todoId) {
        this._todos.delete(todoId);
    }

    get todos() {
        return this._todos;
    }

    get id() {
        return this._id;
    }

    /**
     * @param {String} newName
     */
    set name(newName) {
        this._name = newName;
    }

    get name() {
        return this._name;
    }
}