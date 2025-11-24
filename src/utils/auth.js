import { globalStore } from "../stores/globalStore";

// 로그인 여부 확인
export const isAuthenticated = () => {
  const user = globalStore.getState().user;
  return !!user && user !== null; // null 체크 추가
};

// user 정보 가져오기
export const getUser = () => {
  return globalStore.getState().user;
};

// user 정보 설정 (매직링크 인증 성공 시 사용)
export const setUser = (user) => {
  globalStore.setState({ user });
};

// user 정보 제거 (로그아웃 시 사용)
export const clearUser = () => {
  globalStore.setState({ user: null, posts: [] }); // posts도 초기화
};

// DB에서 todos 가져오기 (로그인 상태일 때만 사용)
export const fetchTodosFromDB = async () => {
  try {
    const { getTodos } = await import("../../api/todos.js");
    const response = await getTodos();

    // 응답 데이터가 배열인지 확인
    const todos = response?.data?.data || response?.data || [];

    // 배열이 아닌 경우 빈 배열로 처리
    const todosArray = Array.isArray(todos) ? todos : [];

    // globalStore에 저장
    globalStore.setState({ posts: todosArray });

    return todosArray;
  } catch (error) {
    // 500 에러는 조용히 처리 (사용자에게 알림하지 않음)
    // 다른 에러는 처리하되, 빈 배열로 초기화하여 앱이 계속 작동하도록 함
    if (error.response?.status !== 500) {
      const { handleTodoError } = await import("./errorHandler.js");
      handleTodoError(error);
    }
    // 에러 발생 시 빈 배열로 초기화
    globalStore.setState({ posts: [] });
    return [];
  }
};

// 현재 로그인한 사용자 정보 조회 (세션 쿠키 기반)
export const getCurrentUser = async () => {
  try {
    const { getCurrentUser: getCurrentUserAPI } = await import(
      "../../api/auth.js"
    );
    const user = await getCurrentUserAPI();

    if (user) {
      setUser(user);
      // 로그인 성공 시 DB에서 todos 가져오기
      await fetchTodosFromDB();
      return user;
    }

    return null;
  } catch (error) {
    console.error("사용자 정보 조회 실패:", error);
    return null;
  }
};

// 매직링크 토큰 처리 (URL에서 token 파싱)
export const handleMagicLinkToken = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    // 토큰이 있으면 인증 시도
    try {
      const { verifyMagicLink } = await import("../../api/auth.js");
      const response = await verifyMagicLink(token);
      const user = response.data.user;
      setUser(user);

      // 로그인 성공 시 DB에서 todos 가져오기
      await fetchTodosFromDB();

      // URL에서 token 제거
      window.history.replaceState({}, "", window.location.pathname);

      return { success: true, user };
    } catch (error) {
      // 에러 응답 처리
      let errorMessage = "인증에 실패했습니다.";

      if (error.response?.status === 401 || error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData?.message) {
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(", ");
          } else {
            errorMessage = errorData.message;
          }
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        }
      }

      console.error("매직링크 인증 에러:", errorMessage);
      return { success: false, error: { message: errorMessage } };
    }
  }

  return null; // token이 없으면 null 반환
};
