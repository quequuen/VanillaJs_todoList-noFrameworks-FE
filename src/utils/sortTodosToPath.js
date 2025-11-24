import getPath from "./getPath";

const sortTodosToPath = (todos) => {
  // todo가 없을 경우 빈 배열 반환
  if (!Array.isArray(todos)) {
    console.warn("sortTodosToPath: todos is not an array", todos);
    return [];
  }

  const path = getPath();
  // sort는 원본 배열을 변경하므로 복사본을 만들어서 정렬
  const sortedTodos = [...todos];

  if (path === "/") {
    return sortedTodos.sort((a, b) => a.isDone.localeCompare(b.isDone));
    //localeCompare로 체크된 애가 밑으로 가게 출력(isDone을 기준으로 사전순 출력 "N"->"Y")
  } else if (path === "/all") {
    return sortedTodos.sort(
      (a, b) =>
        new Date(a.deadLine) - new Date(b.deadLine) ||
        a.isDone.localeCompare(b.isDone)
    );
  }

  return sortedTodos;
};
export default sortTodosToPath;
