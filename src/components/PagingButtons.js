import clickPagingButtonsEventHandler from "../features/clickPagingButtonsEventHandler";
import { addEvent } from "../utils/eventUtil";

const PagingButtons = (filterTodoData, itemsPerPage, currentPage) => {
  addEvent("click", ".page_btn", clickPagingButtonsEventHandler);

  const totalPages = Math.ceil(filterTodoData.length / itemsPerPage);
  let buttons = "";
  for (let i = 1; i <= totalPages; i++) {
    buttons += `<button class="page_btn px-2 mx-1 ${
      i === currentPage ? "font-semibold text-blue-700" : "font-lighter"
    }" data-page="${i}" data-items-per-page="${itemsPerPage}" >${i}</button>`;
  }
  return buttons;
};
export default PagingButtons;
