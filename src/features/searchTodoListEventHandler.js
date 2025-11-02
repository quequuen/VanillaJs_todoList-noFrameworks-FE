import getDate from "../utils/getDate";
import getPath from "../utils/getPath";
import getTodoList from "../utils/getTodoList";
import sortTodosToPath from "../utils/sortTodosToPath";
import PagingButtons from "../components/PagingButtons";
import getCurrentPageInfo from "../utils/getCurrentPageInfo";
import paginate from "../utils/paginate";
import renderTodoList from "../utils/renderTodoList";

const getFilteredTodos = (path, search) => {
  const todos = getTodoList().filter((todo) =>
    path === "/"
      ? todo.content.toLowerCase().includes(search.toLowerCase()) &&
        todo.deadLine === getDate()
      : todo.content.toLowerCase().includes(search.toLowerCase())
  );
  return sortTodosToPath(todos);
};

const renderPaging = ($paging, filteredTodos, itemsPerPage, currentPage) => {
  $paging.dataset.todos = JSON.stringify(filteredTodos);
  $paging.innerHTML = PagingButtons(filteredTodos, itemsPerPage, currentPage);
};

const searchTodoListEventHandler = (e) => {
  const path = getPath();
  const currentPage = 1;
  const { itemsPerPage, startIdx, endIdx, $list, $paging } = getCurrentPageInfo(
    path,
    currentPage
  );
  const search = e.target.value;

  if (!$list || !$paging) return;

  const filteredTodos = getFilteredTodos(path, search);
  const paginatedTodos = paginate(filteredTodos, startIdx, endIdx);

  renderPaging($paging, filteredTodos, itemsPerPage, currentPage);
  renderTodoList($list, paginatedTodos);
};

export default searchTodoListEventHandler;
