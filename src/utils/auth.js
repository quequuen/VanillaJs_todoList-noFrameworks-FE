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
export const setUser = async (user) => {
  globalStore.setState({ user });
};

// user 정보 제거 (로그아웃 시 사용)
export const clearUser = async () => {
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

    const todos = response?.data || [];

    // 배열이 아닌 경우 빈 배열로 처리
    const todosArray = Array.isArray(todos) ? todos : [];

    // globalStore에 저장
    globalStore.setState({ posts: todosArray });

    return todosArray;
  } catch (error) {
    // 에러 메시지 설정
    let errorMessage = "Todo 목록을 불러오는데 실패했습니다.";

    if (error.response?.status === 401) {
      errorMessage = "인증이 필요합니다. 다시 로그인해주세요.";
      await clearUser();
    } else if (error.response?.status >= 500) {
      errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    } else if (
      error.code === "ERR_NETWORK" ||
      error.message.includes("Network")
    ) {
      errorMessage = "네트워크 연결을 확인해주세요.";
    } else if (error.response?.data?.message) {
      const message = error.response.data.message;
      errorMessage = Array.isArray(message) ? message.join(", ") : message;
    } else if (error.message) {
      errorMessage = `오류가 발생했습니다: ${error.message}`;
    }

    console.error("❌ Todo 목록 조회 실패:", error);
    alert(errorMessage);

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

    // 쿠키가 없으면 조용히 비로그인 상태로 처리
    if (!cookies) {
      console.log("🍪 쿠키가 없습니다. 비로그인 상태로 처리합니다.");
      await clearUser();
      return null;
    }

    console.log("🍪 /api/auth/me 호출 전 쿠키 상태:", cookies);

    const { getCurrentUser: getCurrentUserAPI } = await import(
      "../../api/auth.js"
    );
    const user = await getCurrentUserAPI();

    if (user) {
      console.log("✅ getCurrentUser 성공:", user);
      await setUser(user);
      // 로그인 성공 시 DB에서 todos 가져오기
      await fetchTodosFromDB();
      return user;
    }

    // user가 null이면 (401 에러 등) 비로그인 상태로 처리
    // 쿠키가 있었지만 세션이 만료된 경우
    console.log(
      "ℹ️ 세션이 만료되었거나 유효하지 않습니다. 비로그인 상태로 처리합니다."
    );
    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
    await clearUser();
    return null;
  } catch (error) {
    // 네트워크 에러나 서버 에러
    let errorMessage = "사용자 정보를 불러오는데 실패했습니다.";

    if (error.response?.status === 401) {
      errorMessage = "인증이 필요합니다. 다시 로그인해주세요.";
    } else if (error.response?.status >= 500) {
      errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    } else if (
      error.code === "ERR_NETWORK" ||
      error.message.includes("Network")
    ) {
      errorMessage = "네트워크 연결을 확인해주세요.";
    } else if (error.message) {
      errorMessage = `오류가 발생했습니다: ${error.message}`;
    }

    console.error("❌ 사용자 정보 조회 실패:", error);
    alert(errorMessage);
    // 에러 발생 시 비로그인 상태로 처리
    await clearUser();
    return null;
  }
};

// 매직링크 토큰 처리
// 두 가지 방식 지원:
// 1. 백엔드 리다이렉트 방식: 이메일 링크 → 백엔드 /api/auth/verify → 프론트엔드 /?success=...
// 2. 프론트엔드 직접 호출 방식: 이메일 링크 → 프론트엔드 /?token=xxx → verify-api 호출
export const handleMagicLinkToken = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get("success");
  const token = urlParams.get("token");

  // 백엔드 리다이렉트 방식: success 파라미터가 있으면 이미 백엔드에서 세션 설정 완료
  if (success) {
    console.log(
      "✅ 백엔드 리다이렉트로 인증 완료:",
      decodeURIComponent(success)
    );
    console.log("⏳ 세션 쿠키 설정 대기 중...");

    // 백엔드에서 리다이렉트할 때 Set-Cookie 헤더가 전달되므로 쿠키 설정 대기
    // 리다이렉트 후 브라우저가 쿠키를 처리하는데 시간이 필요함
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 1. 먼저 /api/auth/me를 호출하여 세션 확인
    console.log("👤 1단계: getCurrentUser 호출하여 세션 확인...");
    let user = await getCurrentUser();

    console.log("👤 getCurrentUser 결과:", {
      user,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
    });

    // 2. 세션이 없으면 URL의 token 파라미터로 /api/auth/verify-api 호출
    if (!user || !user.id || !user.email) {
      console.warn(
        "⚠️ 세션이 없습니다. URL의 token 파라미터로 verify-api 호출 시도..."
      );

      // URL에서 token 파라미터 확인
      const tokenFromUrl = urlParams.get("token");

      if (tokenFromUrl) {
        console.log("🔐 token 파라미터 발견:", tokenFromUrl);
        console.log("📡 verify-api 호출 시작...");

        try {
          // 프론트엔드에서 verify-api 호출
          const { verifyMagicLink } = await import("../../api/auth.js");
          const response = await verifyMagicLink(tokenFromUrl);

          console.log("✅ verify-api 호출 완료:", response.data);

          // verify-api 호출 후 쿠키 설정 대기
          await new Promise((resolve) => setTimeout(resolve, 500));

          // 다시 getCurrentUser 호출
          console.log("👤 2단계: verify-api 후 getCurrentUser 재호출...");
          user = await getCurrentUser();

          console.log("👤 getCurrentUser 결과 (재시도):", {
            user,
            hasUser: !!user,
            userId: user?.id,
            userEmail: user?.email,
          });
        } catch (error) {
          console.error("❌ verify-api 호출 실패:", error);
          let errorMessage = "인증에 실패했습니다.";

          if (
            error.response?.status === 401 ||
            error.response?.status === 400
          ) {
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

          alert(errorMessage);
          window.history.replaceState({}, "", window.location.pathname);
          return { success: false, error: { message: errorMessage } };
        }
      } else {
        console.error("❌ URL에 token 파라미터가 없습니다.");
        console.error("❌ 세션 쿠키가 제대로 설정되지 않았을 수 있습니다.");
        alert("로그인에 실패했습니다. 세션 쿠키가 설정되지 않았습니다.");
        window.history.replaceState({}, "", window.location.pathname);
        return { success: false, error: { message: "세션 설정 실패" } };
      }
    }

    // 최종 확인
    if (!user || !user.id || !user.email) {
      console.error("❌ 사용자 정보를 가져올 수 없습니다.");
      console.error("❌ 세션 쿠키가 제대로 설정되지 않았을 수 있습니다.");
      alert("로그인에 실패했습니다. 세션 쿠키가 설정되지 않았습니다.");
      window.history.replaceState({}, "", window.location.pathname);
      return { success: false, error: { message: "사용자 정보 조회 실패" } };
    }

    console.log("✅ 로그인 완료:", user);

    // URL에서 success 및 token 파라미터 제거
    window.history.replaceState({}, "", window.location.pathname);

    return { success: true, user };
  }

  // 프론트엔드 직접 호출 방식: token 파라미터가 있으면 verify-api 호출
  if (token) {
    try {
      console.log("🔐 매직링크 토큰 검증 시작:", token);
      console.log("🔍 verifyMagicLink 함수 import 시작...");

      // 프론트엔드에서 verify-api 호출
      const { verifyMagicLink } = await import("../../api/auth.js");
      console.log("✅ verifyMagicLink 함수 import 완료");
      console.log("📡 verifyMagicLink API 호출 시작...");

      const response = await verifyMagicLink(token);
      console.log("✅ verifyMagicLink API 호출 완료");
      console.log("✅ 매직링크 인증 성공:", response.data);

      // verify-api 호출 후 세션 쿠키가 설정될 시간을 기다림
      // 브라우저가 Set-Cookie 헤더를 처리하고 쿠키를 저장하는데 시간이 필요함
      console.log("⏳ 쿠키 설정 대기 중...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 쿠키 확인
      const cookies = document.cookie;
      console.log("🍪 쿠키 확인:", {
        cookies: cookies || "쿠키 없음",
        hasSessionId: cookies?.includes("sessionId"),
      });

      if (!cookies || !cookies.includes("sessionId")) {
        console.error("❌ 세션 쿠키가 설정되지 않았습니다!");
        console.error(
          "❌ 백엔드에서 Set-Cookie 헤더를 보내지 않았거나, CORS 설정 문제일 수 있습니다."
        );
        alert("로그인에 실패했습니다. 세션 쿠키가 설정되지 않았습니다.");
        return { success: false, error: { message: "세션 쿠키 설정 실패" } };
      }

      // verify-api 호출 후 세션 쿠키가 설정되었으므로 getCurrentUser로 사용자 정보 가져오기
      // getCurrentUser 내부에서 setUser, fetchTodosFromDB를 자동으로 처리함
      console.log("👤 getCurrentUser 호출 시작...");
      console.log("🍪 getCurrentUser 호출 전 쿠키 상태:", document.cookie);

      const user = await getCurrentUser();

      console.log("👤 getCurrentUser 결과:", {
        user,
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
      });

      if (!user || !user.id || !user.email) {
        console.error("❌ 사용자 정보를 가져올 수 없습니다.");
        alert("로그인은 성공했지만 사용자 정보를 가져오는데 실패했습니다.");
        return { success: false, error: { message: "사용자 정보 조회 실패" } };
      }

      console.log("✅ 로그인 완료:", user);

      // URL에서 token 파라미터 제거
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

      console.error("❌ 매직링크 인증 에러:", errorMessage);
      alert(errorMessage);

      // URL에서 token 파라미터 제거
      window.history.replaceState({}, "", window.location.pathname);

      return { success: false, error: { message: errorMessage } };
    }
  }

  return null; // token이 없으면 null 반환
};
