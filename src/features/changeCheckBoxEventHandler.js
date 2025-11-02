import { globalStore } from "../stores/globalStore";
import sortTodosToPath from "../utils/sortTodosToPath";

//수정하기 전에 id를 이용해 해당 객체의 isDone 값을 가져오고 그 값이 Y면 N을, N이면 Y을 저장하는 객체 생성
const getUpdatedTodoForCheckBoxById = (todos, id) => {
  const target = todos.find((el) => el.id === Number(id));

  const newIsDone = target.isDone === "Y" ? "N" : "Y";
  return { ...target, isDone: newIsDone }; //객체 병합
};

//수정
const updateCheckBoxStatus = (todos, updatedTodo) => {
  const updatedTodos = todos.map((todo) =>
    todo.id === updatedTodo.id ? updatedTodo : todo
  );
  const sortedTodos = sortTodosToPath(updatedTodos);
  globalStore.setState({ posts: sortedTodos });
};

const changeCheckBoxEventHandler = (e) => {
  const todos = globalStore.getState().posts;
  const id = e.target
    .closest(".todo")
    .querySelector('input[type="hidden"]').value;

  const updatedTodo = getUpdatedTodoForCheckBoxById(todos, id);
  updateCheckBoxStatus(todos, updatedTodo);
};
export default changeCheckBoxEventHandler;
