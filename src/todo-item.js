import { Log } from "./logger.js";
import { saveTodo } from "./storage-wrapper.js";

export { Todo, Priority };

/**
 * Priority
 *
 * An enum to define valid Todo priorities
 */
const Priority = Object.freeze ({
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
});

class Todo {
    #id

    /**
     * @param {String} title
     * @param {String} description
     * @param {Date} dueDate
     * @param {Priority} priority
     * @param {String} id
     */
    constructor (title, description, dueDate, priority, id, done) {
        this._title = title;
        this._description = description;
        this.dueDate = dueDate;
        this._priority = priority;
        if (id === undefined) {
            this.#id = Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
        }
        else {
            this.#id = id;
        }
        if (done === undefined) {
            this._done = false;
        }
        else {
            this._done = done;
        }

        // If an ID was not provided, then this is a new Todo.
        // If an ID was provided, then this is Todo is getting recreated
        // from stored data.
        // In the latter case, we do not need to save this Todo.
        if (id === undefined) {
            save(this);
        }
    }

    /**
     * @param {String} newTitle
     */
    set title(newTitle) {
        this._title = newTitle;
        save(this);
    }

    get title() {
        return this._title;
    }

    /**
     * @param {String} newDescription
     */
    set description(newDescription) {
        this._description = newDescription;
        save(this);
    }

    get description() {
        return this._description;
    }

    /**
     * @param {Priority} newPriority
     */
    set priority(newPriority) {
        if ((newPriority >= Priority.NONE) &&
            (newPriority <= Priority.HIGH)) {
                this._priority = newPriority;
                Log.v(`Set new priority ${newPriority}`);
        }
        else {
            this._priority = Priority.NONE;
            Log.e("Could not set invalid priority.");
        }
        save(this);
    }

    get priority() {
        return this._priority;
    }

    get id() {
        return this.#id;
    }

    /**
     * @param {boolean} isDone
     */
    set done(isDone) {
        this._done = isDone;
        save(this);
    }

    get done() {
        return this._done;
    }
}

function save(todo) {
    saveTodo(todo.id, todo);
}