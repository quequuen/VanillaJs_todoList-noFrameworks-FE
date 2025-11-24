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
      // 백엔드 응답 형식에 맞게 처리 (response.data.data 또는 response.data)
      const updatedTodo = response?.data?.data || response?.data;

      // 응답 데이터가 유효한지 확인
      if (!updatedTodo || typeof updatedTodo !== "object") {
        console.error(
          "❌ 백엔드 응답 형식이 올바르지 않습니다:",
          response?.data
        );
        alert(
          "Todo 상태 변경은 성공했지만 데이터를 불러오는데 실패했습니다. 페이지를 새로고침해주세요."
        );
        return;
      }

      // 백엔드 응답 필드를 프론트엔드 형식에 맞게 매핑
      const mappedTodo = {
        id: updatedTodo.id,
        deadLine: updatedTodo.deadLine || updatedTodo.deadline,
        content: updatedTodo.content || updatedTodo.title,
        creation: updatedTodo.creation || updatedTodo.createdAt,
        isDone: updatedTodo.isDone || updatedTodo.is_done,
      };

      const updatedTodos = todos.map((todo) =>
        todo.id === id ? mappedTodo : todo
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
