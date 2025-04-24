import Api from "../data/api.js";

const RegisterPage = {
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
        <h1>Register</h1>
        <form id="register-form">
          <label for="name">Name</label>
          <input type="text" id="name" required aria-required="true">
          <label for="email">Email</label>
          <input type="email" id="email" required aria-required="true">
          <label for="password">Password</label>
          <input type="password" id="password" required aria-required="true">
          <button type="submit">Register</button>
        </form>
        <p>Already have an account? <a href="#login">Login here</a></p>
      </main>
    `;
  },

  async afterRender() {
    const form = document.querySelector("#register-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.querySelector("#name").value;
      const email = form.querySelector("#email").value;
      const password = form.querySelector("#password").value;

      if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      const response = await Api.register({ name, email, password });
      console.log("API Response:", response); // Tambahkan log untuk debugging
      if (!response.error) {
        alert("Registration successful! Please login to continue.");
        window.location.hash = "#login";
      } else {
        alert("Registration failed: " + response.message);
      }
    });
  },
};

export default RegisterPage;
