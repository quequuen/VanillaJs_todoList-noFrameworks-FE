import getPath from "./getPath";

const sortTodosToPath = (todos) => {
  const path = getPath();
  if (path === "/") {
    return todos.sort((a, b) => a.isDone.localeCompare(b.isDone));
    //localeCompare로 체크된 애가 밑으로 가게 출력(isDone을 기준으로 사전순 출력 "N"->"Y")
  } else if (path === "/all") {
    return todos.sort(
      (a, b) =>
        new Date(a.deadLine) - new Date(b.deadLine) ||
        a.isDone.localeCompare(b.isDone)
    );
  }

  return todos;
};
export default sortTodosToPath;
