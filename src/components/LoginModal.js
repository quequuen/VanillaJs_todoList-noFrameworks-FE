import closeModalEventHandler from "../features/closeModalEventHandler";
import sendMagicLinkEventHandler from "../features/auth/sendMagicLinkEventHandler";
import { addEvent } from "../utils/eventUtil";

const LoginModal = () => {
  addEvent("submit", "#loginForm", sendMagicLinkEventHandler);
  addEvent("click", "#closeLoginModal", closeModalEventHandler);

  return `
    <div id="modal" class="w-[100%] h-[100%] bg-black/30 absolute inset-0 flex justify-center items-center z-50">
      <div id="modalBody" class="bg-white p-6 rounded shadow-xl w-[35%] relative">
        <div id="closeLoginModal" class="absolute right-5 cursor-pointer">
          X
        </div>
        <div>
          <div class="flex justify-center items-center w-[100%] mb-6">
            <p class="italic text-blue-700 text-4xl font-extrabold">Login</p>
          </div>
          
          <form id="loginForm" class="flex flex-col gap-4">
            <div>
              <input 
                type="email" 
                id="loginEmail" 
                required
                class="w-full outline outline-1 outline-gray-600 rounded px-4 py-2" 
                placeholder="example@email.com"
              />
            </div>
            
            <div class="mt-4 flex justify-center gap-4">
              <button 
                type="submit" 
                class="px-4 py-2 bg-black text-white rounded hover:bg-gray-500"
              >
                Send Link
              </button>
              
            </div>
          </form>
          
          <div id="loginMessage" class="mt-4 text-center text-sm text-gray-600 hidden">
          </div>
        </div>
      </div>
    </div>
  `;
};

export default LoginModal;
