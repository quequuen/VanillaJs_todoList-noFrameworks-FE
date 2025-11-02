import getDate from "../utils/getDate";
import { globalStore } from "../stores/globalStore";
import TodoItemForDMinusThree from "./TodoItemForDMinusThree";

const DMinusThree = () => {
  const todos = globalStore.getState().posts;
  //globalStore에 저장된 더미데이터 불러옴
  const today = getDate();

  const getFilterData = () => {
    const todayDate = new Date(today);
    const threeDaysLater = new Date(todayDate);
    threeDaysLater.setDate(todayDate.getDate() + 3); // 3일 뒤로 설정

    return todos.filter((todo) => {
      const deadline = new Date(todo.deadLine);
      return deadline >= todayDate && deadline <= threeDaysLater;
    });
  };

  const filterTodoData = getFilterData().sort(
    (a, b) =>
      new Date(a.deadLine) - new Date(b.deadLine) ||
      a.isDone.localeCompare(b.isDone)
  );
  return `
  <div class="DMinusThree fixed top-[30%] right-[2%] border rounded-lg border-solid border-gray-300 w-[20%] h-[50%] overflow-auto">
    <p class="sticky top-0 bg-white py-4 flex justify-center italic text-red-600 text-4xl font-extrabold z-10">
        D-3
      </p>
      <div id="todoListForDMinusThree" class="lists block h-screen w-[80%] ml-[10%] h-[50%]">
        ${filterTodoData.map((todo) => TodoItemForDMinusThree(todo)).join("")}
        </div>
  </div>`;
};
export default DMinusThree;
