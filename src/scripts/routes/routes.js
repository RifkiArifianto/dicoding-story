import HomePage from "../pages/home-page.js";
import AddStoryPage from "../pages/add-story-page.js";
import DetailPage from "../pages/detail-page.js";
import LoginPage from "../pages/login-page.js";
import RegisterPage from "../pages/register-page.js";
import AboutPage from "../pages/about-page.js";

const routes = {
  "": HomePage,
  "home": HomePage,
  "add-story": AddStoryPage,
  "detail": DetailPage,
  "login": LoginPage,
  "register": RegisterPage,
  "about": AboutPage,
};

export default routes;
