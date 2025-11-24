import { verifyMagicLink } from "../../../api/auth";
import { setUser } from "../../utils/auth";
import { router } from "../../../router";
import { handleAuthError } from "../../utils/errorHandler";

const verifyMagicLinkEventHandler = async (token) => {
  try {
    const response = await verifyMagicLink(token);
    const user = response.data.user;

    // user 정보 저장
    await setUser(user);

    // 홈으로 이동
    router.get().push("/");

    alert("로그인되었습니다!");
  } catch (error) {
    handleAuthError(error);
  }
};

export default verifyMagicLinkEventHandler;
