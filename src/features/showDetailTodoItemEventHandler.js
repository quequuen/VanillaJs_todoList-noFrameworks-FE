import DetailTodoItem from "../components/DetailTodoItem";
import { globalStore } from "../stores/globalStore";
import getDetailTodoItemById from "../utils/getDetailTodoItemById";

const createModalToShowDetailTodoItem = (todo) => {
  //body의 내용에 DetailTodoItem 컴포넌트를 통해 상세 정보 모달 추가
  const $body = document.querySelector("body");
  $body.innerHTML += DetailTodoItem(todo);
};

const showDetailTodoItemEventHandler = (e) => {
  const todos = globalStore.getState().posts;
  const id = e.target
    .closest(".todo")
    .querySelector('input[type="hidden"]').value;
  //상세 정보를 띄울 todoItem 가져오기
  const todo = getDetailTodoItemById(todos, id);
  //모달 화면 띄우는 함수 동작
  createModalToShowDetailTodoItem(todo);
};
export default showDetailTodoItemEventHandler;
