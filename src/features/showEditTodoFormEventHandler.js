import EditTodoItem from "../components/EditTodoItem";
import { globalStore } from "../stores/globalStore";
import getDetailTodoItemById from "../utils/getDetailTodoItemById";

const changeModalToShowEditTodoForm = (todo) => {
  const $modalBody = document.getElementById("modalBody");
  $modalBody.innerHTML = EditTodoItem(todo);
};

const showEditTodoFormEventHandler = (e) => {
  const todos = globalStore.getState().posts;
  const id = e.target.dataset.todoId;
  if (!id) return;
  const todo = getDetailTodoItemById(todos, id);
  //모달의 내용을 디테일에서 수정으로 변경
  changeModalToShowEditTodoForm(todo);
};
export default showEditTodoFormEventHandler;
