import addTodoItemEventHandler from "../features/addTodoItemEventHandler";
import { addEvent } from "../utils/eventUtil";
import getDate from "../utils/getDate";

const AddTodoItem = () => {
  const today = getDate();

  addEvent("submit", "#addTodoForm", addTodoItemEventHandler);

  return `
    <div class="add">
    <form id="addTodoForm" class="flex gap-3 mt-10">
      <input type="date" id="todoDate" class="w-40 outline outline-1 outline-gray-600 
      rounded px-2 py-2" value="${today}" min="${today}"></input>
      <input type="text" id="todoContent" class="min-w-[25rem] outline outline-1 outline-gray-600 rounded px-4 py-2"></input> 
      <button id="todoAdd" type="submit" class="w-20 text-white bg-black rounded hover:bg-gray-400 font-medium">추가</button>
    </form>
  </div>
    `;
};

export default AddTodoItem;
