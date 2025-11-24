import getDate from "../utils/getDate";
import sortTodosToPath from "../utils/sortTodosToPath";
import getPath from "./getPath";
import { globalStore } from "../stores/globalStore";

const getFilterData = (todos) => {
  const path = getPath();
  const today = getDate();
  return path === "/" ? todos.filter((todo) => todo.deadLine === today) : todos;
};

// 동기 함수로 변경: globalStore에서 posts를 가져옴
const getTodoList = () => {
  const posts = globalStore.getState().posts;
  // posts가 배열이 아닌 경우 빈 배열로 처리
  const todos = Array.isArray(posts) ? posts : [];
  const filtered = getFilterData(todos);
  const sorted = sortTodosToPath(filtered);
  // 최종 결과도 배열인지 확인
  return Array.isArray(sorted) ? sorted : [];
};

export default getTodoList;
