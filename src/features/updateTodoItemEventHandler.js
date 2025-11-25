import { globalStore } from "../stores/globalStore";
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

  // 항상 DB에 저장 (API 호출)
  // 명세서: PUT /api/todo/:id는 content, deadLine, isDone을 모두 받을 수 있음
  try {
    // 날짜 형식 확인: input type="date"는 YYYY-MM-DD 형식으로 반환됨
    const requestBody = {
      content,
      deadLine, // YYYY-MM-DD 형식
    };

    // isDone이 있으면 포함 (선택적 필드)
    if (isDone) {
      requestBody.isDone = isDone;
    }

    const response = await updateTodo(id, requestBody);

    const updatedTodo = response?.data;

    // 응답 데이터가 유효한지 확인
    if (!updatedTodo || typeof updatedTodo !== "object") {
      console.error("❌ 백엔드 응답 형식이 올바르지 않습니다:", response?.data);
      alert(
        "Todo 수정은 성공했지만 데이터를 불러오는데 실패했습니다. 페이지를 새로고침해주세요."
      );
      closeModalEventHandler();
      return;
    }

    // 백엔드 응답 필드를 프론트엔드 형식에 맞게 매핑
    // 명세서: 응답은 id, content, deadLine, isDone, creation을 포함
    const mappedTodo = {
      id: updatedTodo.id,
      deadLine: updatedTodo.deadLine, // ISO 8601 형식 (2025-11-25T00:00:00.000Z)
      content: updatedTodo.content,
      creation: updatedTodo.creation,
      isDone: updatedTodo.isDone, // 'Y' 또는 'N'
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

  //모달 닫음
  closeModalEventHandler();
};
export default updateTodoItemEventHandler;
