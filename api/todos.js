//  todo 관련 api
import api, { isUsingProxy } from "./api";

const API_PREFIX = isUsingProxy() ? "" : "/api";

const TODO_ENDPOINTS = {
  list: `${API_PREFIX}/todo`,
  detail: `${API_PREFIX}/todo`, // /todo/:id로 사용
  create: `${API_PREFIX}/todo`,
  update: `${API_PREFIX}/todo`, // /todo/:id로 사용
  remove: `${API_PREFIX}/todo`, // /todo/:id로 사용
  toggle: `${API_PREFIX}/todo`, // /todo/:id/toggle로 사용
};

const resolveEndpoint = (key) => {
  const endpoint = TODO_ENDPOINTS[key];
  if (!endpoint) {
    throw new Error(`TODO_ENDPOINTS.${key}가 아직 설정되지 않았습니다.`);
  }
  return endpoint;
};

export const getTodos = async () => {
  return api.get(resolveEndpoint("list"));
};

export const getTodoById = async (id) => {
  return api.get(`${resolveEndpoint("detail")}/${id}`);
};

export const createTodo = async (params) => {
  return api.post(resolveEndpoint("create"), params);
};

export const updateTodo = async (id, params) => {
  return api.put(`${resolveEndpoint("update")}/${id}`, params);
};

export const deleteTodo = async (id) => {
  return api.delete(`${resolveEndpoint("remove")}/${id}`);
};

export const toggleTodo = async (id) => {
  return api.patch(`${resolveEndpoint("toggle")}/${id}/toggle`);
};

export default {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
};
