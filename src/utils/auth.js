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
  // 로그인 상태 확인
  if (!isAuthenticated()) {
    console.warn(
      "fetchTodosFromDB: 로그인하지 않은 상태에서는 호출하지 않습니다."
    );
    return [];
  }

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
    // 401 에러면 로그인 상태가 아니므로 조용히 처리
    if (error.response?.status === 401) {
      clearUser();
      globalStore.setState({ posts: [] });
      return [];
    }

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
    // 쿠키 확인
    const cookies = document.cookie;
    console.log("🍪 /api/auth/me 호출 전 쿠키 상태:", cookies || "쿠키 없음");

    const { getCurrentUser: getCurrentUserAPI } = await import(
      "../../api/auth.js"
    );
    const user = await getCurrentUserAPI();

    if (user) {
      console.log("✅ getCurrentUser 성공:", user);
      setUser(user);
      // 로그인 성공 시 DB에서 todos 가져오기
      await fetchTodosFromDB();
      return user;
    }

    // user가 null이면 (401 에러 등) 로그아웃 처리
    console.warn(
      "⚠️ getCurrentUser: user가 null입니다. 세션 쿠키가 없거나 만료되었을 수 있습니다."
    );
    console.warn("⚠️ 현재 쿠키:", cookies || "쿠키 없음");
    clearUser();
    return null;
  } catch (error) {
    console.error("❌ 사용자 정보 조회 실패:", error);
    // 에러 발생 시에도 로그아웃 처리
    clearUser();
    return null;
  }
};

// 매직링크 토큰 처리 (백엔드 redirect 방식)
// 백엔드에서 /api/auth/verify?token=xxx로 접근하면
// 세션 생성 후 프론트엔드로 redirect(?success=true 또는 ?error=메시지)
// 이 함수는 success 파라미터가 있을 때 사용자 정보를 가져옴
export const handleMagicLinkSuccess = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get("success");

  if (success === "true") {
    try {
      console.log("✅ 매직링크 인증 성공 - 사용자 정보 조회 중...");

      // 백엔드에서 이미 세션 쿠키가 설정되었으므로 getCurrentUser로 사용자 정보 가져오기
      // getCurrentUser 내부에서 setUser, fetchTodosFromDB를 자동으로 처리함
      const user = await getCurrentUser();

      if (!user || !user.id || !user.email) {
        console.error("❌ 사용자 정보를 가져올 수 없습니다.");
        alert("로그인은 성공했지만 사용자 정보를 가져오는데 실패했습니다.");
        return { success: false, error: { message: "사용자 정보 조회 실패" } };
      }

      // URL에서 success 파라미터 제거
      window.history.replaceState({}, "", window.location.pathname);

      return { success: true, user };
    } catch (error) {
      console.error("매직링크 인증 후 사용자 정보 조회 에러:", error);
      return { success: false, error: { message: "사용자 정보 조회 실패" } };
    }
  }

  return null; // success 파라미터가 없으면 null 반환
};
