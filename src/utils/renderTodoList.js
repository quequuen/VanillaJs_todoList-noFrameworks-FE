import TodoItem from "../components/TodoItem";

const renderTodoList = ($el, todos) => {
  $el.innerHTML = todos.map((todo) => TodoItem(todo)).join("");
};
export default renderTodoList;
