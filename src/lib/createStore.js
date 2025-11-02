import { createObserver } from "./createObserver";

export const createStore = (initialStore) => {
  //store= 상태 관리
  //전역상태 관리 시스템(react의 useState 같은 친구)
  //앱 전체에서 공유할 수 있는 상태를 만들고 이 상태가 변경되면 구독 중인
  //컴포넌트들에게 notify 해주는 코드
  const { subscribe, notify } = createObserver();
  let state = { ...initialStore };
  //초기 상태를 받아서 객체 복사를 통해 초기화(initialStore 참조 보호)
  const setState = (newState) => {
    console.log(newState);
    state = { ...state, ...newState };
    // 기존 state유지하고 새로운게 들어오면 새로운것만 바꾸기<-객체 병합
    // console.log(state);
    notify();
  };
  const getState = () => ({ ...state });
  return { setState, getState, subscribe };
};

// const [state,setState] = useState([1])

// setState(2)
