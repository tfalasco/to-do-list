import { Todo, Priority } from "./todo-item.js";
import { Project } from "./project.js";
import * as storage from "./storage-wrapper.js";
import { createProjectCard } from "./display-project.js";
import "./styles/main.css";

// createTestData();

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

function createTestData() {
    localStorage.clear();
    const todoTest1 = new Todo("Test1", "Do this", new Date(), Priority.LOW);
    todoTest1.title = ("Changed Title");
    const todoTest2 = new Todo("Test2", "Do that", new Date(), Priority.HIGH);
    const todoTest3 = new Todo("Test3", "Do the other", new Date(), Priority.MEDIUM);
    const projectTest1 = new Project("Test PJ1");
    projectTest1.name = "Changed Test PJ1 name";
    const projectTest2 = new Project("Test PJ2");
    projectTest1.addTodo(todoTest1);
    projectTest1.addTodo(todoTest2);
    projectTest2.addTodo(todoTest3);
}

