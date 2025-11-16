import { logout } from "../../../api/auth";
import { clearUser } from "../../utils/auth";
import { router } from "../../../router";

const logoutEventHandler = async () => {
  const confirmLogout = confirm("로그아웃하시겠습니까?");

  if (!confirmLogout) return;

  try {
    await logout();
    clearUser();

    // 홈으로 이동
    router.get().push("/");

    alert("로그아웃되었습니다.");

    // 페이지 새로고침
    window.location.reload();
  } catch (error) {
    alert("로그아웃에 실패했습니다.");
  }
};

export default logoutEventHandler;
