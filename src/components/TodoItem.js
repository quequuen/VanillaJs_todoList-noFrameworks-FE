import changeCheckBoxEventHandler from "../features/changeCheckBoxEventHandler";
import deleteTodoListEventHandler from "../features/deleteTodoListEventHandler.js";
import showDetailTodoItemEventHandler from "../features/showDetailTodoItemEventHandler.js";
import { addEvent } from "../utils/eventUtil.js";
import getPath from "../utils/getPath.js";

addEvent("change", "#checkBox", changeCheckBoxEventHandler);
addEvent("click", "#deleteTodo", deleteTodoListEventHandler);
addEvent("click", "#showDetailTodoItem", showDetailTodoItemEventHandler);

const TodoItem = (todo) => {
  const path = getPath();

  return `
    <div class="todo ml-[1%] flex gap-6 justify-center items-center border-b border-gray-400 w-[98%] h-[${
      path === "/" ? "19%" : "15%"
    }]">
      <input type="hidden" value="${todo.id}" />
      <input id="checkBox" type="checkbox" class="checkbox" ${
        todo.isDone === "Y" ? "checked" : ""
      } />
      <a id="showDetailTodoItem" class="content w-[60%] ${
        todo.isDone === "Y" ? "line-through text-gray-400" : ""
      } hover:underline cursor-pointer" >${todo.content}</a>
      <div class="date">${todo.deadLine}</div>
      <button id="deleteTodo" class="delete w-10 text-white bg-black rounded hover:bg-gray-400 font-medium text-xs px-2 py-1">삭제</button>
    </div>
  `;
};

export default TodoItem;
