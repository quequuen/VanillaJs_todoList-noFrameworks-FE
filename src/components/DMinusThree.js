import getDate from "../utils/getDate";
import TodoItemForDMinusThree from "./TodoItemForDMinusThree";
import getTodoList from "../utils/getTodoList";

const DMinusThree = () => {
  const todos = getTodoList();
  //getTodoList()로 서버에서 전달받은 데이터 사용
  const today = getDate();

  const getFilterData = () => {
    // 오늘 날짜 (시간 제거, 00:00:00으로 설정)
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);

    // 3일 후 날짜 (23:59:59로 설정하여 하루 종일 포함)
    const threeDaysLater = new Date(todayDate);
    threeDaysLater.setDate(todayDate.getDate() + 3);
    threeDaysLater.setHours(23, 59, 59, 999);

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

        // 오늘부터 3일 후까지의 범위에 있는지 확인
        // 오늘은 포함하지 않고, 오늘 이후부터 3일 후까지
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        const todayDateOnly = new Date(todayDate);
        todayDateOnly.setHours(0, 0, 0, 0);

        // 오늘보다 크고 3일 후보다 작거나 같은 것만
        return deadlineDate > todayDateOnly && deadlineDate <= threeDaysLater;
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
