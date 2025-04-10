import { Log } from "./logger.js";
import { autoSaveTodo, saveTodo } from "./storage-wrapper.js";

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
            this._id = Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
        }
        else {
            this._id = id;
        }
        if (done === undefined) {
            this._done = false;
        }
        else {
            this._done = done;
        }

        saveTodo(this.id, this);
        return autoSaveTodo(this);
    }

    /**
     * @param {String} newTitle
     */
    set title(newTitle) {
        this._title = newTitle;
    }

    get title() {
        return this._title;
    }

    /**
     * @param {String} newDescription
     */
    set description(newDescription) {
        this._description = newDescription;
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
    }

    get priority() {
        return this._priority;
    }

    get id() {
        return this._id;
    }

    /**
     * @param {boolean} isDone
     */
    set done(isDone) {
        this._done = isDone;
    }

    get done() {
        return this._done;
    }
}