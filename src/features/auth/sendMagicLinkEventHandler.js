import { sendMagicLink } from "../../../api/auth";
import closeModalEventHandler from "../closeModalEventHandler";
import { addEvent } from "../../utils/eventUtil";

const setInputValueForLogin = () => {
  const $email = document.getElementById("loginEmail");
  return {
    email: $email.value,
    $email,
  };
};

const showMessage = (message, isError = false) => {
  const $message = document.getElementById("loginMessage");
  $message.textContent = message;
  $message.className = `mt-4 text-center text-sm ${
    isError ? "text-red-600" : "text-green-600"
  }`;
  $message.classList.remove("hidden");
};

const sendMagicLinkEventHandler = async (e) => {
  e.preventDefault();

  const { email, $email } = setInputValueForLogin();

  if (!email) {
    alert("⚠️ 이메일을 입력하세요.");
    return;
  }

  try {
    // 이메일 발송
    await sendMagicLink(email);

    // 성공 메시지 표시
    showMessage(
      `${email}로 인증 링크가 발송되었습니다. 이메일을 확인해주세요.`
    );

    // 입력 필드 비활성화 (선택)
    $email.disabled = true;

    // 3초 후 모달 자동 닫기 (선택)
    setTimeout(() => {
      closeModalEventHandler();
    }, 3000);
  } catch (error) {
    showMessage("이메일 발송에 실패했습니다. 다시 시도해주세요.", true);
  }
};

export default sendMagicLinkEventHandler;
