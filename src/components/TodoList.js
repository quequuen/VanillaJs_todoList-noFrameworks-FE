import TodoItem from "./TodoItem";
import { addEvent } from "../utils/eventUtil";
import searchTodoListEventHandler from "../features/searchTodoListEventHandler";
import getTodoList from "../utils/getTodoList";
import PagingButtons from "./PagingButtons";
import paginate from "../utils/paginate";
import getCurrentPageInfo from "../utils/getCurrentPageInfo";
import getPath from "../utils/getPath";

const TodoList = () => {
  addEvent("keyup", "#searchInput", searchTodoListEventHandler);

  //페이징 처리를 하기 위한 변수들
  const path = getPath();
  const selectedBtn = document.querySelector(".page_btn.font-semibold");
  const currentPage = selectedBtn ? Number(selectedBtn.dataset.page) : 1;
  const { itemsPerPage, startIdx, endIdx } = getCurrentPageInfo(
    path,
    currentPage
  );

  const paginatedTodos = paginate(getTodoList(), startIdx, endIdx);

  // undefined나 유효하지 않은 todo 필터링
  const validTodos = paginatedTodos.filter(
    (todo) => todo && typeof todo === "object" && todo.id
  );

  return `
  <p class="mt-16 flex justify-center italic text-blue-700 text-4xl font-extrabold">TO DO LIST</p>
    <div class="List h-[60%]">
        <div class="search mt-5 flex justify-center ">
            <input type="text" id="searchInput" class="w-[98%] border-b border-solid border-gray-600 px-2 py-2" placeholder="검색어를 입력하세요"></input>
        </div>
        <div class="lists block h-[100%]">
          <div id="todoList" class="h-[80%]">
            ${validTodos.map((todo) => TodoItem(todo)).join("")}
          </div>
          <div id="paging" class="flex justify-center">
             ${PagingButtons(getTodoList(), itemsPerPage, currentPage)}
        </div>
    </div>
    `;
};

export default TodoList;
