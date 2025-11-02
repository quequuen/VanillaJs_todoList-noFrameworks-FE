const getCurrentPageInfo = (path, currentPage) => {
  const itemsPerPage = path === "/" ? 5 : 6;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const $list = document.getElementById("todoList");
  const $paging = document.getElementById("paging");
  return { itemsPerPage, startIdx, endIdx, $list, $paging };
};
export default getCurrentPageInfo;
