import { globalStore } from "../stores/globalStore";
import { isAuthenticated } from "../utils/auth";
import { toggleTodo } from "../../api/todos";
import sortTodosToPath from "../utils/sortTodosToPath";
import { handleTodoError } from "../utils/errorHandler";

//수정하기 전에 id를 이용해 해당 객체의 isDone 값을 가져오고 그 값이 Y면 N을, N이면 Y을 저장하는 객체 생성
const getUpdatedTodoForCheckBoxById = (todos, id) => {
  const target = todos.find((el) => el.id === Number(id));

  const newIsDone = target.isDone === "Y" ? "N" : "Y";
  return { ...target, isDone: newIsDone }; //객체 병합
};

//수정
const updateCheckBoxStatus = (todos, updatedTodo) => {
  const updatedTodos = todos.map((todo) =>
    todo.id === updatedTodo.id ? updatedTodo : todo
  );
  const sortedTodos = sortTodosToPath(updatedTodos);
  globalStore.setState({ posts: sortedTodos });
};

const changeCheckBoxEventHandler = async (e) => {
  const todos = globalStore.getState().posts;
  const id = e.target
    .closest(".todo")
    .querySelector('input[type="hidden"]').value;

  // 로그인 상태에 따라 분기
  if (isAuthenticated()) {
    // 로그인 상태 → DB에 토글 저장 (API 호출)
    try {
      const response = await toggleTodo(id);

      // DB에서 반환된 Todo로 업데이트
      const updatedTodo = response.data.data;
      const updatedTodos = todos.map((todo) =>
        todo.id === id ? updatedTodo : todo
      );
      const sortedTodos = sortTodosToPath(updatedTodos);
      globalStore.setState({ posts: sortedTodos });
    } catch (error) {
      handleTodoError(error);
      return;
    }
  } else {
    // 비로그인 상태 → 로컬에만 저장 (기존 방식)
    const updatedTodo = getUpdatedTodoForCheckBoxById(todos, id);
    updateCheckBoxStatus(todos, updatedTodo);
  }
};
export default changeCheckBoxEventHandler;
