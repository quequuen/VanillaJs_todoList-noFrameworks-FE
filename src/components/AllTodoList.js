import TodoItem from "../components/TodoItem";
import searchTodoListEventHandler from "../features/searchTodoListEventHandler";
import { addEvent } from "../utils/eventUtil";
import getCurrentPageInfo from "../utils/getCurrentPageInfo";
import getPath from "../utils/getPath";
import getTodoList from "../utils/getTodoList";
import paginate from "../utils/paginate";
import PagingButtons from "./PagingButtons";

const AllTodoList = () => {
  addEvent("keyup", "#searchInputOfAll", searchTodoListEventHandler);

  const path = getPath();
  const selectedBtn = document.querySelector(".page_btn.font-semibold");
  const currentPage = selectedBtn ? Number(selectedBtn.dataset.page) : 1;
  const { itemsPerPage, startIdx, endIdx } = getCurrentPageInfo(
    path,
    currentPage
  );

  const paginatedTodos = paginate(getTodoList(), startIdx, endIdx);

  return `
      <p class="mt-10 flex justify-center italic text-blue-700 text-4xl font-extrabold">ALL TO DO LIST</p>
      <div class="List h-[80%]">
          <div class="search mt-5 flex justify-center">
              <input type="text" id="searchInputOfAll" class="w-[98%] border-b border-solid border-gray-600 px-2 py-2" placeholder="검색어를 입력하세요"></input>
          </div>
          <div class="lists block h-[90%]">
            <div id="todoList" class="h-[85%]">
              ${paginatedTodos.map((todo) => TodoItem(todo)).join("")}
            </div>
            <div id="paging" class="flex justify-center">
                ${PagingButtons(getTodoList(), itemsPerPage, currentPage)}
            </div>
      </div>
    `;
};
export default AllTodoList;
