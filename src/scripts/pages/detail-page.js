import DetailPresenter from "../presenter/detail-presenter.js";
import L from "leaflet/dist/leaflet.js";
import "leaflet/dist/leaflet.css";

const DetailPage = {
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
        <div id="loading" style="display: none;">Loading...</div>
        <article id="story-detail"></article>
        <div id="map" style="height: 400px;"></div>
      </main>
    `;
  },

  async afterRender(id) {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#login";
      return;
    }

    if (!id) {
      const storyDetail = document.querySelector("#story-detail");
      storyDetail.innerHTML =
        '<h2 id="first-story" tabindex="0">Error: Story ID is missing.</h2><p><a href="#home">Back to Home</a> or <a href="#add-story">Add a New Story</a></p>';
      return;
    }

    const view = {
      showLoading() {
        document.querySelector("#loading").style.display = "block";
        document.querySelector("#story-detail").style.display = "none";
      },
      hideLoading() {
        document.querySelector("#loading").style.display = "none";
        document.querySelector("#story-detail").style.display = "block";
      },
      showStory(story) {
        const storyDetail = document.querySelector("#story-detail");
        storyDetail.innerHTML = `
          <img src="${story.photoUrl}" alt="Photo by ${
          story.name
        }" loading="lazy">
          <h2 id="first-story" tabindex="0">${story.name}</h2>
          <p>${story.description}</p>
          <time datetime="${story.createdAt}">${new Date(
          story.createdAt
        ).toLocaleDateString()}</time>
        `;

        if (story.lat && story.lon) {
          const map = L.map("map").setView([story.lat, story.lon], 10);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }).addTo(map);

          L.marker([story.lat, story.lon])
            .addTo(map)
            .bindPopup(`<b>${story.name}</b><br>${story.description}`);
        }
      },
      showError(message) {
        const storyDetail = document.querySelector("#story-detail");
        storyDetail.innerHTML = `<h2 id="first-story" tabindex="0">Error: ${message}</h2><p>The story may have been deleted, expired, or is not accessible with your current account. Try <a href="#home">refreshing the story list</a> or <a href="#add-story">adding a new story</a>. If the issue persists, <a href="#login">log in again</a>.</p>`;
      },
    };

    const presenter = new DetailPresenter(view);
    await presenter.loadStoryDetail(id, token);

    const logoutLink = document.querySelector(".nav-logout");
    if (logoutLink) {
      logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("token");
        window.location.hash = "#login";
      });
    }

    const navLinks = document.querySelectorAll(".nav-link");
    const currentHash = window.location.hash.split("/")[0] || "#home";
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === currentHash) {
        link.classList.add("active");
      }
    });

    // Pindahkan logika "Skip to Content" ke app.js, tetapi jika diperlukan spesifik, bisa dipertahankan
    const skipLink = document.querySelector(".skip-link");
    if (skipLink) {
      skipLink.addEventListener("click", (event) => {
        event.preventDefault();
        const firstStory =
          document.querySelector("#first-story") ||
          document.querySelector("#story-detail");
        if (firstStory) {
          firstStory.setAttribute("tabindex", "0");
          firstStory.focus();
        }
      });
    }
  },
};

export default DetailPage;
