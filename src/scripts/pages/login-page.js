import Api from "../data/api.js";

const LoginPage = {
  async render() {
    return `
      <a href="#main-content" class="skip-link">Skip to content</a>
      <header>
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#add-story">Add Story</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#login">Login</a></li>
          </ul>
        </nav>
      </header>
      <main id="main-content" role="main">
        <h1>Login</h1>
        <form id="login-form">
          <label for="email">Email</label>
          <input type="email" id="email" required aria-required="true">
          <label for="password">Password</label>
          <input type="password" id="password" required aria-required="true">
          <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <a href="#register">Register here</a></p>
      </main>
    `;
  },

  async afterRender() {
    const form = document.querySelector("#login-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.querySelector("#email").value;
      const password = form.querySelector("#password").value;

      const response = await Api.login({ email, password });
      if (!response.error) {
        localStorage.setItem("token", response.loginResult.token);
        window.location.hash = "#home";
      } else {
        alert("Login failed: " + response.message);
      }
    });
  },
};

export default LoginPage;
