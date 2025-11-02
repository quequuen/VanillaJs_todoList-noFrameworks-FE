import { globalStore } from "../stores/globalStore";
import getDate from "../utils/getDate";
import sortTodosToPath from "../utils/sortTodosToPath";
import getPath from "./getPath";

const getFilterData = () => {
  const path = getPath();
  const todos = globalStore.getState().posts;
  const today = getDate();
  return path === "/" ? todos.filter((todo) => todo.deadLine === today) : todos;
};

const getTodoList = () => {
  return sortTodosToPath(getFilterData());
};
export default getTodoList;
