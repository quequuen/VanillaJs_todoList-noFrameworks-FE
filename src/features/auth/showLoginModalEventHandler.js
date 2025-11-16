import LoginModal from "../../components/LoginModal";

const showLoginModalEventHandler = () => {
  const $body = document.querySelector("body");
  $body.innerHTML += LoginModal();
};

export default showLoginModalEventHandler;
