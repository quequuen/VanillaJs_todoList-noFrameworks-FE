//  todo 관련 api
import api from "./api";

const TODO_ENDPOINTS = {
  list: "/api/todo",
  detail: "/api/todo", // /api/todos/:id로 사용
  create: "/api/todo",
  update: "/api/todo", // /api/todos/:id로 사용
  remove: "/api/todo", // /api/todos/:id로 사용
  toggle: "/api/todo", // /api/todos/:id/toggle로 사용
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
