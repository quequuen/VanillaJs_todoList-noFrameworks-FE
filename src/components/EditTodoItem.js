import updateTodoItemEventHandler from "../features/updateTodoItemEventHandler";
import { addEvent } from "../utils/eventUtil";

addEvent("click", "#updateTodoItem", updateTodoItemEventHandler);

const EditTodoItem = (todo) => {
  return `<div class="flex justify-center items-center w-[100%] h-[15%]">
        <p class="italic text-blue-700 text-4xl font-extrabold">EDIT</p>
        </div>
        <div class="mt-8 flex justify-center w-[100%] h-[50%]">
          <table class="w-[80%] table-fixed">
            <colgroup>
              <col class="w-[40%]" />
              <col class="w-[60%]" />
            </colgroup>
            <tr>
              <td><p class="font-bold">📌 내용</p></td>
              <td><input id="editTodoItemContent" type="text" class="outline outline-1 outline-gray-600 rounded px-2 w-[100%]" value="${
                todo.content
              }"></input></td>
            </tr>
            <tr>
              <td><p class="font-bold">📌 생성일</p></td>
              <td>${todo.creation}</td>
            </tr>
            <tr>
              <td><p class="font-bold">📌 마감일</p></td>
              <td><input id="editTodoItemDeadLine" type="date" class="w-40 outline outline-1 outline-gray-600 
      rounded px-2" value="${todo.deadLine}"></input></td>
            </tr>
            <tr>
              <td><p class="font-bold">📌 check</p></td>
              <td id="editTodoItemIsDone">${
                todo.isDone === "Y"
                  ? "<input type='radio' name='isDone' checked value='Y'>완료 <input class='ml-[5%]' type='radio' name='isDone' value='N'>미완료"
                  : "<input type='radio' name='isDone' value='Y'>완료 <input class='ml-[5%]' type='radio' name='isDone' checked value='N'>미완료"
              }</td>
            </tr>
          </table>
        </div>
        <div class="mt-10 flex justify-center items-center gap-[20%]">
          <button id="updateTodoItem" class="px-3 py-1 bg-black text-white rounded hover:bg-gray-500" data-todo-id="${
            todo.id
          }">완료</button>
          <button id="closeModal" class="px-3 py-1 bg-black text-white rounded hover:bg-gray-500">취소</button>
        </div>
      `;
};
export default EditTodoItem;
