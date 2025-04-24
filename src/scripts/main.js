import App from "./app.js";
import "../styles/styles.css";

const app = new App({
  content: document.querySelector("#app"),
});

window.addEventListener("hashchange", () => {
  app.renderPage();
});

window.addEventListener("load", () => {
  app.renderPage();
});
