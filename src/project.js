import { Todo } from "./todo-item.js";
import { Log } from "./logger.js";

export { Project };

class Project {
    #todos;

    /**
     * @param {String} name
     */
    constructor (name) {
        this.name = name;
        this.#todos = new Array();
    }

    /**
     * @param {Todo} newTodo
     */
    addTodo(newTodo) {
        if (newTodo instanceof Todo) {
            this.#todos.push(newTodo);
            Log.v(`Added new todo ${newTodo.title}`);
        }
        else {
            Log.e("Could not add todo item.  Parameter was of wrong type.");
            Log.e(`Expected Todo, got ${typeof newTodo}.`);
        }
    }
}