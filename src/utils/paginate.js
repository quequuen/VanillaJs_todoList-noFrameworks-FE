const paginate = (todos, startIdx, endIdx) => {
  // 배열이 아닌 경우 빈 배열 반환
  if (!Array.isArray(todos)) {
    console.warn("paginate: todos is not an array", todos);
    return [];
  }
  return todos.slice(startIdx, endIdx);
};
export default paginate;
