//이벤트 위임을 위한 컴포넌트

const eventHandlers = {};
// 이벤트 타입(click, submit 등)에 따라
// 어떤 셀렉터에서 어떤 함수를 실행할지를 담아두는 등록소 역할

const handleGlobalEvents = (e) => {
  // 실제로 document.body에서 발생한 이벤트를 잡아
  const handlers = eventHandlers[e.type];
  if (!handlers) return;
  //없을 시 그냥 return
  for (const selector in handlers) {
    if (e.target.matches(selector)) {
      // 이벤트 타입(e.type)에 등록된 셀렉터들과 e.target을 비교해서
      handlers[selector](e);
      // 해당하는 셀렉터가 있으면 등록된 핸들러를 실행
      break;
    }
  }
};

const registerGlobalEvents = (() => {
  // 최초 1번만 실행되게 하는 초기화 함수
  let init = false;
  // 중복 실행 방지 (init flag)
  return () => {
    if (init) return;

    Object.keys(eventHandlers).forEach((eventType) => {
      document.body.addEventListener(eventType, handleGlobalEvents);
      // eventHandlers에 등록된 이벤트 타입에 대해 document.body에 리스너 추가
    });

    init = true;
    //이벤트가 1번 실행되고 난 후, 바로 true 처리를 해서 단 한 번만 실행될 수 있게 함
  };
})();

const addEvent = (eventType, selector, handler) => {
  // 원하는 이벤트를 셀렉터와 함께 등록하는 함수
  if (!eventHandlers[eventType]) {
    eventHandlers[eventType] = {};
  }
  eventHandlers[eventType][selector] = handler;
};

export { registerGlobalEvents };
export { addEvent };
