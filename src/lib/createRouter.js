import { createObserver } from "./createObserver";

export const createRouter = (routes) => {
  //여기서 routes는 "/": HomePage처럼 경로와 컴포넌트를 매핑한 객체
  const { subscribe, notify } = createObserver();
  //createObserver 가져와서 구조분해할당
  const getPath = () => window.location.pathname;
  //현재 주소의 path를 얻어옴
  const getTarget = () => routes[getPath()];
  //현재 경로에 맞는 타겟 컴포넌트?를 가져오는 함수
  const push = (path) => {
    // 이 부분은 주소 바를 바꾸면서 새로고침 없이 화면만 전환하게 해주는 핵심 로직이야.
    window.history.pushState(null, null, path);
    //-> window.history.pushState(state, title, url)
    // state: history에 저장할 상태
    //title: 문서의 제목(현재 부라우저는 대부분 무시함)
    //변경하고자 하는 주소
    //현재 윈도우의 주소 및 상태를 이렇게 변경하겠다
    //주소만 /...로 바꾸고 페이지는 리로드를 하지 않음
    //그 후 notify를 통해 라우터 변경을 구독하고 있는 함수들에게 알려줌
    notify();
  };
  window.addEventListener("popstate", () => notify());
  //이건 뒤로 가기/앞으로 가기 같은 브라우저 내비게이션 조작이 있을 때 발생하는 이벤트.
  //popstate는 뒤로 가기/앞으로 가기 할 때 자동으로 페이지 옮겨주는 느낌
  //push(path)는 개발자가 직접 버튼을 눌러서 페이지 이동 하는 느낌

  return {
    get path() {
      return getPath();
    },
    //getter로 path(현재경로)를 가져옴
    push,
    //push(path)로 경로 이동
    subscribe,
    //subscribe(callback)로 라우터 변경에 대한 콜백 등록
    getTarget,
    //현재 경로에 해당하는 컴포넌트 가져오기
  };
};
