import { globalStore } from "../stores/globalStore";

//해당 id인 todoList를 모든 리스트에서 제거한 리스트 반환

const deleteTodoList = (todos, id) => {
  const deletedTodo = todos.filter((todo) => todo.id !== Number(id));
  globalStore.setState({ posts: deletedTodo });
};

const deleteTodoListEventHandler = (e) => {
  const deleteCheck = confirm("정말 삭제하시겠습니까?");
  const todos = globalStore.getState().posts;
  const id = e.target
    .closest(".todo")
    .querySelector('input[type="hidden"]').value;
  if (deleteCheck) {
    deleteTodoList(todos, id);
  }
};

export default deleteTodoListEventHandler;
