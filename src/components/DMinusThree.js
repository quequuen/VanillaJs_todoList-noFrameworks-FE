import getDate from "../utils/getDate";
import TodoItemForDMinusThree from "./TodoItemForDMinusThree";
import getTodoList from "../utils/getTodoList";

const DMinusThree = () => {
  const todos = getTodoList();
  //getTodoList()로 서버에서 전달받은 데이터 사용
  const today = getDate();

  const getFilterData = () => {
    const todayDate = new Date(today);
    const threeDaysLater = new Date(todayDate);
    threeDaysLater.setDate(todayDate.getDate() + 3); // 3일 뒤로 설정

    return todos.filter((todo) => {
      // todo가 유효한지 확인
      if (!todo || typeof todo !== "object" || !todo.deadLine) {
        return false;
      }

      try {
        const deadline = new Date(todo.deadLine);
        // 유효한 날짜인지 확인
        if (isNaN(deadline.getTime())) {
          return false;
        }
        return deadline >= todayDate && deadline <= threeDaysLater;
      } catch (error) {
        console.warn("DMinusThree: 날짜 파싱 에러:", todo, error);
        return false;
      }
    });
  };

  const filterTodoData = getFilterData().sort((a, b) => {
    // 안전하게 정렬
    if (!a || !b || !a.deadLine || !b.deadLine) {
      return 0;
    }
    try {
      const dateDiff = new Date(a.deadLine) - new Date(b.deadLine);
      if (dateDiff !== 0) {
        return dateDiff;
      }
      return (a.isDone || "N").localeCompare(b.isDone || "N");
    } catch (error) {
      console.warn("DMinusThree: 정렬 에러:", a, b, error);
      return 0;
    }
  });
  return `
  <div class="DMinusThree fixed top-[30%] right-[2%] border rounded-lg border-solid border-gray-300 w-[20%] h-[50%] overflow-auto">
    <p class="sticky top-0 bg-white py-4 flex justify-center italic text-red-600 text-4xl font-extrabold z-10">
        D-3
      </p>
      <div id="todoListForDMinusThree" class="lists block h-screen w-[80%] ml-[10%] h-[50%]">
        ${filterTodoData
          .filter((todo) => todo && typeof todo === "object" && todo.id)
          .map((todo) => TodoItemForDMinusThree(todo))
          .join("")}
        </div>
  </div>`;
};
export default DMinusThree;
