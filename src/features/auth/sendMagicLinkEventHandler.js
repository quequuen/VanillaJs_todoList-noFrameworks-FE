import { sendMagicLink } from "../../../api/auth";
import closeModalEventHandler from "../closeModalEventHandler";
import { handleApiError } from "../../utils/errorHandler";

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
    const response = await sendMagicLink(email);

    // 성공 메시지 표시
    const message =
      response?.data?.message ||
      `${email}로 인증 링크가 발송되었습니다. 이메일을 확인해주세요.`;
    showMessage(message);

    // 입력 필드 비활성화 (선택)
    $email.disabled = true;

    // 3초 후 모달 자동 닫기 (선택)
    setTimeout(() => {
      closeModalEventHandler();
    }, 3000);
  } catch (error) {
    // Rate Limiting 에러 처리 (429)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers?.["retry-after"];
      const message = retryAfter
        ? `요청이 너무 많습니다. ${retryAfter}초 후 다시 시도해주세요.`
        : "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
      showMessage(message, true);

      // 버튼 비활성화 (1분 후 재활성화)
      const $submitBtn = e.target.querySelector('button[type="submit"]');
      if ($submitBtn) {
        $submitBtn.disabled = true;
        setTimeout(() => {
          $submitBtn.disabled = false;
        }, 60000); // 1분 후 재활성화
      }
      return;
    }

    // Error.md 명세에 따른 에러 처리
    handleApiError(error, {
      on400: (message) => {
        showMessage(message, true);
      },
      on500: (message) => {
        showMessage(
          "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.",
          true
        );
      },
      defaultHandler: (message) => {
        showMessage(message, true);
      },
    });
  }
};

export default sendMagicLinkEventHandler;
