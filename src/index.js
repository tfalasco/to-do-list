import {
  getAppHandlerInstance,
  createTestData,
  deleteAllData,
} from "./app-handler";

const CREATE_TEST_DATA = false;
const DELETE_ALL_DATA = false;

if (CREATE_TEST_DATA) {
  createTestData();
}

if (DELETE_ALL_DATA) {
  deleteAllData();
}

const appHandler = getAppHandlerInstance();
appHandler.displayAll();
