import { Todo, Priority } from "./todo-item.js";
import { Project } from "./project.js";
import * as storage from "./storage-wrapper.js";
import { createProjectCard, createProjectDialog } from "./display-project.js";
import { createHero } from "./display-hero.js";
import "./styles/main.css";

// createTestData();

// Display the hero
document.body.appendChild(createHero());

// Display projects
const projects = fetchAllProjects();
for (const project of projects) {
    document.body.appendChild(createProjectCard(project));
}

function fetchAllProjects() {
    const projects = new Array();
    const projectIds = storage.fetchProjectIds();
    for (const projectId of projectIds) {
        projects.push(storage.restoreProject(projectId));
    }

    return projects;
}

// Create the new project modal dialog
const newProjectDialog = createProjectDialog();
document.body.appendChild(newProjectDialog);

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

