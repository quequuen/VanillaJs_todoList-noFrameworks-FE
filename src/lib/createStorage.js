//local storage 도우미 함수
//그냥 저장하는 애
export const createStorage = (key, storage = window.localStorage) => {
  const get = () => JSON.parse(storage.getItem(key));
  //key: 문자열->객체
  const set = (value) => storage.setItem(key, JSON.stringify(value));
  //key: 객체->문자열
  const reset = () => storage.removeItem(key);
  //해당 key의 값을 스토리지에서 완전 삭제
  return { get, set, reset };
};
