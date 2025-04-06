import { getAppHandlerInstance, createTestData, deleteAllData } from "./app-handler";

// createTestData();
// deleteAllData();

const appHandler = getAppHandlerInstance();
appHandler.displayAll();