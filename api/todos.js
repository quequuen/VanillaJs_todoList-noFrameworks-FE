//  todo 관련 api
import api from "./api";

const TODO_ENDPOINTS = {
  list: "", // TODO: 엔드포인트 설정
  detail: "", // TODO: 엔드포인트 설정 (예: `/api/todos/{id}`)
  create: "", // TODO: 엔드포인트 설정
  update: "", // TODO: 엔드포인트 설정 (예: `/api/todos/{id}`)
  remove: "", // TODO: 엔드포인트 설정 (예: `/api/todos/{id}`)
  toggle: "", // TODO: 엔드포인트 설정 (예: `/api/todos/{id}/toggle`)
};

const resolveEndpoint = (key) => {
  const endpoint = TODO_ENDPOINTS[key];
  if (!endpoint) {
    throw new Error(`TODO_ENDPOINTS.${key}가 아직 설정되지 않았습니다.`);
  }
  return endpoint;
};

export const getTodos = async (params = {}) => {
  return api.get(resolveEndpoint("list"), { params });
};

export const getTodoById = async (id) => {
  return api.get(resolveEndpoint("detail"), { params: { id } });
};

export const createTodo = async (payload) => {
  return api.post(resolveEndpoint("create"), payload);
};

export const updateTodo = async (id, payload) => {
  return api.put(resolveEndpoint("update"), { id, ...payload });
};

export const deleteTodo = async (id) => {
  return api.delete(resolveEndpoint("remove"), { data: { id } });
};

export const toggleTodo = async (id) => {
  return api.patch(resolveEndpoint("toggle"), { id });
};

export default {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
};
