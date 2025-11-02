export const router = {
  //router 객체는 상태저장소(state container)
  //value는 곧 현재 선택된 페이지(또는 컴포넌트)의 값
  value: null,
  get() {
    return this.value;
  },
  //get으로 현재 컴포넌트를 반환
  set(newValue) {
    this.value = newValue;
  },
  //set으로 외부에서 라우터의 상태를 변경할 수 있음
};
