import { Todo } from "./todo-item.js";
import { Log } from "./logger.js";

export { Project };

class Project {
    #todos;

    constructor (name) {
        this.name = name;
        this.#todos = new Array();
    }

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