import { createStore } from "../lib/createStore";

export const globalStore = createStore({
  user: null,
  // null: 비로그인 상태
  // 객체: 로그인 상태
});
