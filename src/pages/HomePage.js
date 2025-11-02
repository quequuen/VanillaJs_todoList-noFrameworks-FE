import AddTodoItem from "../components/AddTodoItem";
import TodoList from "../components/TodoList";

const HomePage = () => {
  return `
  ${AddTodoItem()}
  ${TodoList()}
  `;
};

export default HomePage;
