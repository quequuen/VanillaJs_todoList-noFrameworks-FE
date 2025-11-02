import { addEvent } from "../utils/eventUtil";
import closeModalEventHandler from "../features/closeModalEventHandler";
import showEditTodoFormEventHandler from "../features/showEditTodoFormEventHandler";

addEvent("click", "#goEditTodoItem", showEditTodoFormEventHandler);
addEvent("click", "#closeModal", closeModalEventHandler);

const DetailTodoItem = (todo) => {
  return `<div id="modal" class="w-[100%] h-[100%] bg-black/30 absolute inset-0 flex justify-center items-center z-50">
      <div id="modalBody" class="bg-white p-6 rounded shadow-xl w-[35%] h-[45%]">
        <div class="flex justify-center items-center w-[100%] h-[15%]">
        <p class="italic text-blue-700 text-4xl font-extrabold">DETAIL</p>
        </div>
        <div class="mt-8 flex justify-center w-[100%] h-[50%]">
          <table class="w-[80%] table-fixed">
            <colgroup>
              <col class="w-[40%]" />
              <col class="w-[60%]" />
            </colgroup>
            <tr>
              <td><p class="font-bold">📌 내용</p></td>
              <td>${todo.content}</td>
            </tr>
            <tr>
              <td><p class="font-bold">📌 생성일</p></td>
              <td>${todo.creation}</td>
            </tr>
            <tr>
              <td><p class="font-bold">📌 마감일</p></td>
              <td>${todo.deadLine}</td>
            </tr>
            <tr>
              <td><p class="font-bold">📌 check</p></td>
              <td>${
                todo.isDone === "Y"
                  ? "<input type='radio' name='isDone' checked disabled value='Y'>완료 <input class='ml-[5%]' type='radio' name='isDone' disabled value='N'>미완료"
                  : "<input type='radio' name='isDone' disabled value='Y'>완료 <input class='ml-[5%]' type='radio' name='isDone' checked disabled value='N'>미완료"
              }</td>
            </tr>
          </table>
        </div>
        <div class="mt-10 flex justify-center items-center gap-[20%]">
          <button id="goEditTodoItem" class="px-3 py-1 bg-black text-white rounded hover:bg-gray-500" 
          data-todo-id="${todo.id}">수정</button>
          <button id="closeModal" class="px-3 py-1 bg-black text-white rounded hover:bg-gray-500">닫기</button>
        </div>
      </div>
    </div>`;
};

export default DetailTodoItem;
