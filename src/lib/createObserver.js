// 관찰자 패턴을 위한 유틸 파일
// 관찰자 패턴: 어떤 값이나 상태가 바뀌면, 그걸 지켜보는 애들한테 자동으로 알려주는 패턴
// 이를 통해 라우터에 변화가 생기면 다른 코드(컴포넌트 등)가 이를 구독해서 반응할 수 있어.
export const createObserver = () => {
  const listener = new Set();
  const subscribe = (fn) => listener.add(fn);
  //여기 fn에 들어간 기능 자체를 listener에 저장한 후 나중에 notify를 불렀을 때 listener에 저장된 걸 한번씩 다 실행?
  //그럼 subscribe는 기능을 저장하기 위한 변수(구독 느낌)고 notify는 기능을 불러오기 위한 변수(구독한 애들 다 호출)인건가
  //subscribe: 외부에서 라우터 변경을 감지할 수 있도록 구독하는 함수
  //listener는 기능을 저장하는 set이고
  const notify = () => listener.forEach((listener) => listener());
  return { subscribe, notify };
};
