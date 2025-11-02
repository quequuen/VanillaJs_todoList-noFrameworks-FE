import render from "../render.js";
import { router } from "../router.js";
import { createRouter } from "./lib/createRouter.js";
import AllTodosPage from "./pages/AllTodosPage.js";
import HomePage from "./pages/HomePage.js";
import { globalStore } from "./stores/globalStore.js";

router.set(
  createRouter({
    "/": HomePage,
    "/all": AllTodosPage,
  })
);
function main() {
  router.get().subscribe(render);
  globalStore.subscribe(render);
  render();
}

main();
