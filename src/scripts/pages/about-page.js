const AboutPage = {
  async render() {
    return `
      <a href="#main-content" class="skip-link">Skip to content</a>
      <header>
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="#home" class="nav-link">Home</a></li>
            <li><a href="#add-story" class="nav-link">Add Story</a></li>
            <li><a href="#about" class="nav-link">About</a></li>
            ${
              localStorage.getItem("token")
                ? '<li><a href="#logout" class="nav-link nav-logout">Logout</a></li>'
                : '<li><a href="#login" class="nav-link">Login</a></li>'
            }
          </ul>
        </nav>
      </header>
      <main id="main-content" role="main">
        <h1 id="first-content" tabindex="0">About Dicoding Stories</h1>
        <section>
          <p>Welcome to Dicoding Stories, a platform where you can share your stories and experiences with the world!</p>
          <p>This application allows you to:</p>
          <ul>
            <li>Create and share stories with photos and location data.</li>
            <li>View stories from other users on an interactive map.</li>
            <li>Explore detailed story pages with maps showing the story's location.</li>
          </ul>
          <p>Built as part of the Dicoding Bootcamp project, this app demonstrates the use of modern web technologies such as Vite, Leaflet for mapping, and API integration.</p>
        </section>
      </main>
    `;
  },

  async afterRender() {
    const logoutLink = document.querySelector(".nav-logout");
    if (logoutLink) {
      logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("token");
        window.location.hash = "#login";
      });
    }

    // Tambahkan garis bawah untuk link aktif
    const navLinks = document.querySelectorAll(".nav-link");
    const currentHash = window.location.hash || "#home";
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === currentHash) {
        link.classList.add("active");
      }
    });

    // Pastikan fokus berpindah ke konten utama setelah "Skip to Content" diklik
    const skipLink = document.querySelector(".skip-link");
    skipLink.addEventListener("click", (event) => {
      event.preventDefault();
      const firstContent = document.querySelector("#first-content");
      if (firstContent) {
        firstContent.setAttribute("tabindex", "0");
        firstContent.focus();
      }
    });
  },
};

export default AboutPage;
