import getTodoList from "../utils/getTodoList";
import renderTodoList from "../utils/renderTodoList";
import getCurrentPageInfo from "../utils/getCurrentPageInfo";
import getPath from "../utils/getPath";
import paginate from "../utils/paginate";

const activePagingButton = (target) => {
  let $pagingButtons = document.querySelectorAll(".page_btn");
  $pagingButtons.forEach((btn) => {
    btn.classList = "page_btn px-2 mx-1 font-lighter";
  });
  target.classList.add("font-semibold", "text-blue-700");
};

const clickPagingButtonsEventHandler = (e) => {
  const path = getPath();
  const currentPage = Number(e.target.dataset.page);
  const { startIdx, endIdx, $list, $paging } = getCurrentPageInfo(
    path,
    currentPage
  );
  const json = $paging?.dataset?.todos;
  const todos = json ? JSON.parse(json) : getTodoList();
  const paginatedTodos = paginate(todos, startIdx, endIdx);
  if ($list) {
    renderTodoList($list, paginatedTodos);
    activePagingButton(e.target);
  }
};
export default clickPagingButtonsEventHandler;
