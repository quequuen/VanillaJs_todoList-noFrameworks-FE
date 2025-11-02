const getDetailTodoItemById = (todos, id) => {
  return todos.filter((todo) => todo.id === Number(id))[0];
};
export default getDetailTodoItemById;
