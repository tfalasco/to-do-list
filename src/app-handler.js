import { Todo, Priority } from "./todo-item.js";
import { Project } from "./project.js";
import * as storage from "./storage-wrapper.js";
import { createProjectCard, createProjectDialog, refreshProjectCardTodos } from "./display-project.js";
import { createHero } from "./display-hero.js";
import { createTodoDialog } from "./display-todo.js";
import { Log } from "./logger.js";
import "./styles/main.css";

export { getAppHandlerInstance, createTestData };

let  instance = null;

/**
 * getAppHandlerInstance()
 *
 * @returns A singleton instance of the AppHandler class
 */
function getAppHandlerInstance() {
    if (instance === null) {
        instance = new AppHandler();
        instance.constructor = null;
    }
    return instance;
}

/**
 * AppHandler
 */
class AppHandler {
    #projects;

    constructor() {
        this.#projects = this.#fetchAllProjects();

        // Clear the document body
        document.body.innerHTML = "";

        // Display the hero
        document.body.appendChild(createHero());

        // Create a container to hold the content
        const content = document.createElement("div");
        content.id = "content";
        document.body.appendChild(content);

        // Create the new project modal dialog
        const newProjectDialog = createProjectDialog();
        document.body.appendChild(newProjectDialog);

        // create the new todo modal dialog
        const newTodoDialog = createTodoDialog();
        document.body.appendChild(newTodoDialog);
    }

    /**
     * displayAll()
     *
     * Sets up the display with a hero and displays all the projects
     */
    displayAll() {
        const content = document.querySelector("#content");

        // Clear the display
        content.innerHTML = "";

        // Display projects
        for (const project of this.#projects) {
            content.appendChild(createProjectCard(project));
        }
    }

    /**
     * fetchAllProjects()
     *
     * Retrieves all the projects from storage and returns an array
     * of projects.
     *
     * @returns Array of Projects
     */
    #fetchAllProjects() {
        const projects = new Array();
        const projectIds = storage.fetchProjectIds();
        for (const projectId of projectIds) {
            projects.push(storage.restoreProject(projectId));
        }

        return projects;
    }

    /**
     * addTodoToProject(projectId, todo)
     *
     * Adds a Todo to the project with the given projectId
     *
     * @param {String} projectId
     * @param {Todo} todo
     */
    addTodoToProject(projectId, todo) {
        for (const project of this.#projects) {
            if (projectId === project.id) {
                project.addTodo(todo);
            }
        }
    }

    /**
     * refreshProjectTodos(projectId)
     *
     * Refresh the displayed list of Todos for the project card
     * with the given projectId
     *
     * @param {String} projectId
     */
    refreshProjectTodos(projectId) {
        for (const project of this.#projects) {
            if (projectId === project.id) {
                refreshProjectCardTodos(project);
            }
        }
    }
}

function createTestData() {
    const date = new Date();
    localStorage.clear();
    const todoTest1 = new Todo("Test1", "Order this", date, Priority.LOW);
    todoTest1.title = ("Thinger-ma-jobbie");
    date.setDate(date.getDate() + 1);
    const todoTest2 = new Todo("Doohickey", "Order that", date, Priority.HIGH);
    date.setDate(date.getDate() + 1);
    const todoTest3 = new Todo("Mow the lawn", "Trim the edges, blow off the sidewalk", date, Priority.MEDIUM);
    const projectTest1 = new Project("Test PJ1");
    projectTest1.name = "Amazon";
    const projectTest2 = new Project("Honey-do");
    projectTest1.addTodo(todoTest1);
    projectTest1.addTodo(todoTest2);
    projectTest2.addTodo(todoTest3);
}

