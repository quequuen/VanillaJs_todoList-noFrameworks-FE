import { globalStore } from "../stores/globalStore";
import { isAuthenticated } from "../utils/auth";
import { deleteTodo } from "../../api/todos";
import { handleTodoError } from "../utils/errorHandler";

//해당 id인 todoList를 모든 리스트에서 제거한 리스트 반환
const deleteTodoList = (todos, id) => {
  const deletedTodo = todos.filter((todo) => todo.id !== Number(id));
  globalStore.setState({ posts: deletedTodo });
};

const deleteTodoListEventHandler = async (e) => {
  const deleteCheck = confirm("정말 삭제하시겠습니까?");
  if (!deleteCheck) return;

  const todos = globalStore.getState().posts;
  const id = e.target
    .closest(".todo")
    .querySelector('input[type="hidden"]').value;

  // 로그인 상태에 따라 분기
  if (isAuthenticated()) {
    // 로그인 상태 → DB에서 삭제 (API 호출)
    try {
      await deleteTodo(id);

      // 로컬 store에서도 삭제
      deleteTodoList(todos, id);
    } catch (error) {
      handleTodoError(error);
      return;
    }
  } else {
    // 비로그인 상태 → 로컬에만 삭제 (기존 방식)
    deleteTodoList(todos, id);
  }
};

export default deleteTodoListEventHandler;
