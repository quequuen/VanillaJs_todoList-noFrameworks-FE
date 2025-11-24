import { globalStore } from "../stores/globalStore";
import { isAuthenticated } from "../utils/auth";
import { updateTodo } from "../../api/todos";
import closeModalEventHandler from "./closeModalEventHandler";
import { handleTodoError } from "../utils/errorHandler";

const setInputValuesForUpdateTodoItem = () => {
  const $updatedTodoItemContent = document.getElementById(
    "editTodoItemContent"
  );
  const $updatedTodoItemDate = document.getElementById("editTodoItemDeadLine");
  const isDoneValue = document.querySelector(
    "input[name='isDone']:checked"
  )?.value;
  return {
    deadLine: $updatedTodoItemDate.value,
    content: $updatedTodoItemContent.value,
    isDone: isDoneValue,
  };
};

const updateTodos = ({ id, deadLine, isDone, content }) => {
  const todos = globalStore.getState().posts;
  const updatedTodos = todos.map((todo) => {
    if (todo.id === id) {
      return {
        ...todo,
        deadLine,
        isDone,
        content,
      };
    }
    return todo;
  });
  return updatedTodos;
};

const setTodoStoreByUpdatedTodoItem = (updatedTodos) => {
  globalStore.setState({ posts: updatedTodos });
};

//유효성 검사
const isValidFormForUpdate = (deadLine, content) => {
  if (!deadLine) {
    alert("⚠️날짜를 선택하세요.");
    return false;
  } else if (!content) {
    alert("⚠️Todo를 작성하세요.");
    return false;
  }
  return true;
};

const updateTodoItemEventHandler = async (e) => {
  const updateCheck = confirm("수정하시겠습니까?");
  const id = Number(e.target.dataset.todoId);
  if (!id) return;

  //수정 모달의 입력된 각 값을 가져옴
  const { deadLine, content, isDone } = setInputValuesForUpdateTodoItem();

  if (!isValidFormForUpdate(deadLine, content)) return;

  if (!updateCheck) {
    closeModalEventHandler();
    return;
  }

  // 로그인 상태에 따라 분기
  if (isAuthenticated()) {
    // 로그인 상태 → DB에 저장 (API 호출)
    try {
      const response = await updateTodo(id, {
        deadLine,
        content,
        isDone,
      });

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
          "Todo 수정은 성공했지만 데이터를 불러오는데 실패했습니다. 페이지를 새로고침해주세요."
        );
        closeModalEventHandler();
        return;
      }

      // 백엔드 응답 필드를 프론트엔드 형식에 맞게 매핑
      const mappedTodo = {
        id: updatedTodo.id,
        deadLine: updatedTodo.deadLine || updatedTodo.deadline || deadLine,
        content: updatedTodo.content || updatedTodo.title || content,
        creation: updatedTodo.creation || updatedTodo.createdAt,
        isDone: updatedTodo.isDone || updatedTodo.is_done || isDone,
      };

      const todos = globalStore.getState().posts;
      const updatedTodos = todos.map((todo) =>
        todo.id === id ? mappedTodo : todo
      );
      setTodoStoreByUpdatedTodoItem(updatedTodos);
    } catch (error) {
      handleTodoError(error);
      return;
    }
  } else {
    // 비로그인 상태 → 로컬에만 저장 (기존 방식)
    const updatedTodos = updateTodos({
      id,
      deadLine,
      isDone,
      content,
    });
    setTodoStoreByUpdatedTodoItem(updatedTodos);
  }

  //모달 닫음
  closeModalEventHandler();
};
export default updateTodoItemEventHandler;
