import { globalStore } from "../stores/globalStore";
import { createTodo } from "../../api/todos";
import getDate from "../utils/getDate";
import { handleTodoError } from "../utils/errorHandler";

const setInputValuesForAddTodoItem = () => {
  const $date = document.getElementById("todoDate");
  const $content = document.getElementById("todoContent");
  return {
    date: $date.value,
    content: $content.value,
    $date,
    $content,
  };
};

const createTodoItem = (id, deadLine, content) => ({
  id,
  creation: getDate(),
  deadLine,
  isDone: "N",
  content,
});

const setTodoStoreByAddTodoItem = (newTodo) => {
  const todos = globalStore.getState().posts;
  globalStore.setState({ posts: [...todos, newTodo] });
};

const resetTodoForm = ($date, $content) => {
  $date.value = getDate;
  $content.value = "";
};

//유효성 검사
const isValidFormForAdd = (date, content) => {
  if (!date) {
    alert("⚠️날짜를 선택하세요.");
    return false;
  } else if (!content) {
    alert("⚠️Todo를 작성하세요.");
    return false;
  }
  return true;
};

// const addTodoItemEventHandler = (e) => {
//   e.preventDefault();
//   const todos = globalStore.getState().posts;
//   //setInputValuesForAddTodoItem() 호출로 DOM 요소의 값과 그 자체를 각각 변수에 할당 후 리턴(구조 분해 할당 사용)
//   const { date, content, $date, $content } = setInputValuesForAddTodoItem();

//   if (!isValidFormForAdd(date, content)) return;

//   // 구조 분해 할당으로 가져온 date와 content를 createTodoItem의 인수로 주고 객체를 생성한 후 newTodo에 할당
//   const newTodo = createTodoItem(todos.length + 1, date, content);

//   // newTodo 데이터 저장
//   setTodoStoreByAddTodoItem(newTodo);

//   // 입력 초기화
//   resetTodoForm($date, $content);
// };

const addTodoItemEventHandler = async (e) => {
  e.preventDefault();
  const todos = globalStore.getState().posts;
  const { date, content, $date, $content } = setInputValuesForAddTodoItem();

  if (!isValidFormForAdd(date, content)) return;

  // 항상 DB에 저장 (API 호출)
  try {
    const response = await createTodo({
      deadLine: date,
      content: content,
    });

    const savedTodo = response?.data;

    // 응답 데이터가 유효한지 확인
    if (!savedTodo || typeof savedTodo !== "object") {
      console.error("❌ 백엔드 응답 형식이 올바르지 않습니다:", response?.data);
      alert(
        "Todo 추가는 성공했지만 데이터를 불러오는데 실패했습니다. 페이지를 새로고침해주세요."
      );
      // 에러 발생 시에도 폼은 초기화
      resetTodoForm($date, $content);
      return;
    }

    // 백엔드 응답 필드를 프론트엔드 형식에 맞게 매핑
    // 명세서: 응답은 id, content, deadLine, isDone, creation을 포함
    const mappedTodo = {
      id: savedTodo.id,
      deadLine: savedTodo.deadLine, // ISO 8601 형식 (2025-11-25T00:00:00.000Z)
      content: savedTodo.content,
      creation: savedTodo.creation,
      isDone: savedTodo.isDone, // 기본값 'N'
    };

    setTodoStoreByAddTodoItem(mappedTodo);
  } catch (error) {
    handleTodoError(error);
    return;
  }

  resetTodoForm($date, $content);
};

export default addTodoItemEventHandler;
