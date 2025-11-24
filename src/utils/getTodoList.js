import getDate from "../utils/getDate";
import sortTodosToPath from "../utils/sortTodosToPath";
import getPath from "./getPath";
import { getTodos } from "../../api/todos";
import devLogger from "./logger";

const getFilterData = (todos) => {
  const path = getPath();
  const today = getDate();
  return path === "/" ? todos.filter((todo) => todo.deadLine === today) : todos;
};

const getTodoList = async (e) => {
  const todos = [];
  try {
    const response = await getTodos();
    devLogger.log(response);
    todos = response.data;
  } catch (error) {
    // 에러 처리
    const status = error.response?.status;
    const message =
      error.response?.message ||
      "데이터를 불러오지 못했습니다. 재시도 해주세요.";

    if (status === 400) {
    } else if (status === 401) {
    } else if (status === 500) {
    }

    devLogger.log(todos);
    alert(message);
  }
  return sortTodosToPath(getFilterData(todos));
};
export default getTodoList;
