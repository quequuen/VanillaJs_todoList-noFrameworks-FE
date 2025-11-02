import { globalStore } from "../stores/globalStore";
import closeModalEventHandler from "./closeModalEventHandler";

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

const updateTodoItemEventHandler = (e) => {
  const updateCheck = confirm("수정하시겠습니까?");
  const id = Number(e.target.dataset.todoId);
  if (!id) return;
  //수정 모달의 입력된 각 값을 가져옴
  const { deadLine, content, isDone } = setInputValuesForUpdateTodoItem();
  //가져온 값으로 해당 id의 todo를 업데이트한 todos를 가져옴

  const updatedTodos = updateTodos({
    id,
    deadLine,
    isDone,
    content,
  });

  if (!isValidFormForUpdate(deadLine, content)) return;

  if (updateCheck) {
    //업데이트된 todos로 globalStore를 수정
    setTodoStoreByUpdatedTodoItem(updatedTodos);
  }

  //모달 닫음
  closeModalEventHandler();
};
export default updateTodoItemEventHandler;
