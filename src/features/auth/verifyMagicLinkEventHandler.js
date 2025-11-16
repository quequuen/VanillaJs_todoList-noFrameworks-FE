import { verifyMagicLink } from "../../../api/auth";
import { setUser } from "../../utils/auth";
import { router } from "../../../router";

const verifyMagicLinkEventHandler = async (token) => {
  try {
    const response = await verifyMagicLink(token);
    const user = response.data.user;

    // user 정보 저장
    setUser(user);

    // 홈으로 이동
    router.get().push("/");

    alert("로그인되었습니다!");
  } catch (error) {
    alert("인증에 실패했습니다. 다시 시도해주세요.");
  }
};

export default verifyMagicLinkEventHandler;
