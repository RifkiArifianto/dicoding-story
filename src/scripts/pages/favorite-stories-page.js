import { getAllStories, deleteStory } from "../utils/indexedDB.js";

const FavoriteStoriesPage = {
  async render() {
    return `
      <a href="#main-content" class="skip-link">Skip to content</a>
      <header>
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="#home" class="nav-link">Home</a></li>
            <li><a href="#add-story" class="nav-link">Add Story</a></li>
            <li><a href="#favorites" class="nav-link">Favorites</a></li>
            <li><a href="#about" class="nav-link">About</a></li>
            <li><a href="#logout" class="nav-link nav-logout">Logout</a></li>
          </ul>
        </nav>
      </header>
      <main id="main-content" role="main">
        <h1>Favorite Stories</h1>
        <section id="favorite-stories" aria-label="List of favorite stories"></section>
      </main>
      <footer>
        <p>© 2025 Dicoding Stories. All rights reserved.</p>
      </footer>
    `;
  },

  async afterRender() {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#login";
      return;
    }

    const storiesContainer = document.querySelector("#favorite-stories");
    const stories = await getAllStories();

    if (stories.length === 0) {
      storiesContainer.innerHTML =
        '<p id="first-story" tabindex="0">No favorite stories found.</p>';
      return;
    }

    storiesContainer.innerHTML = stories
      .map(
        (story, index) => `
          <article role="article" ${
            index === 0 ? 'tabindex="0" id="first-story"' : ""
          }>
            <img src="${story.photoUrl}" alt="Photo by ${
          story.name
        }" loading="lazy">
            <h2>${story.name}</h2>
            <p>${story.description}</p>
            <time datetime="${story.createdAt}">${new Date(
          story.createdAt
        ).toLocaleDateString()}</time>
            <button class="remove-favorite" data-id="${
              story.id
            }">Remove from Favorites</button>
          </article>
        `
      )
      .join("");

    const removeButtons = document.querySelectorAll(".remove-favorite");
    removeButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        await deleteStory(id);
        e.target.closest("article").remove();
        const remainingStories = await getAllStories();
        if (remainingStories.length === 0) {
          storiesContainer.innerHTML =
            '<p id="first-story" tabindex="0">No favorite stories found.</p>';
        }
      });
    });

    const logoutLink = document.querySelector(".nav-logout");
    if (logoutLink) {
      logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("token");
        window.location.hash = "#login";
      });
    }

    const navLinks = document.querySelectorAll(".nav-link");
    const currentHash = window.location.hash || "#home";
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === currentHash) {
        link.classList.add("active");
      }
    });

    const skipLink = document.querySelector(".skip-link");
    if (skipLink) {
      skipLink.addEventListener("click", (event) => {
        event.preventDefault();
        const firstStory =
          document.querySelector("#first-story") ||
          document.querySelector("#favorite-stories");
        if (firstStory) {
          firstStory.setAttribute("tabindex", "0");
          firstStory.focus();
        }
      });
    }
  },
};

export default FavoriteStoriesPage;
