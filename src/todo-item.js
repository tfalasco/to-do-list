import { Log } from "./logger.js";

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
    #priority

    /**
     * @param {String} title
     * @param {String} description
     * @param {Date} dueDate
     * @param {Priority} priority
     */
    constructor (title, description, dueDate, priority) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.#priority = priority;
        this.done = false;
    }

    /**
     * @param {Priority} newPriority
     */
    set priority(newPriority) {
        if ((newPriority >= Priority.NONE) &&
            (newPriority <= Priority.HIGH)) {
                this.#priority = newPriority;
                Log.v(`Set new priority ${newPriority}`);
        }
        else {
            this.#priority = Priority.NONE;
            Log.e("Could not set invalid priority.");
        }
    }

    get priority() {
        return this.#priority;
    }
}