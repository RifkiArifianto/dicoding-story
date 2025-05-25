import HomePresenter from "../presenter/home-presenter.js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { saveStory } from "../utils/indexedDB.js";
import Config from "../utils/config.js";

const HomePage = {
  async render() {
    const token = localStorage.getItem("token");
    return `
      <a href="#main-content" class="skip-link">Skip to content</a>
      <header>
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="#home" class="nav-link">Home</a></li>
            <li><a href="#add-story" class="nav-link">Add Story</a></li>
            <li><a href="#favorites" class="nav-link">Favorites</a></li>
            <li><a href="#about" class="nav-link">About</a></li>
            ${
              token
                ? '<li><a href="#logout" class="nav-link nav-logout">Logout</a></li>'
                : '<li><a href="#login" class="nav-link">Login</a></li>'
            }
          </ul>
        </nav>
      </header>
      <main id="main-content" role="main">
        <h1>Dicoding Stories</h1>
        <button id="install-button" style="display: none;">Add to Homescreen</button>
        <button id="subscribe-notification">Enable Notifications</button>
        <div id="offline-message" style="display: none; color: orange;"></div>
        <button id="refresh-stories">Refresh Stories</button>
        <button id="clear-stories">Clear Cached Stories</button>
        <div id="loading" style="display: none;">Loading...</div>
        <section id="stories" aria-label="List of stories"></section>
        <div id="map" style="height: 400px;"></div>
      </main>
      <footer>
        <p>© 2025 Dicoding Stories. All rights reserved.</p>
      </footer>
    `;
  },

  async afterRender() {
    let token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#login";
      return;
    }

    let mapInstance = null;

    const view = {
      showLoading() {
        document.querySelector("#loading").style.display = "block";
        document.querySelector("#stories").style.display = "none";
      },
      hideLoading() {
        document.querySelector("#loading").style.display = "none";
        document.querySelector("#stories").style.display = "block";
      },
      showStories(stories) {
        const storiesContainer = document.querySelector("#stories");
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
                <a href="#detail/${story.id}" aria-label="View details of ${
              story.name
            }'s story">View Details</a>
                <button class="add-favorite" data-id="${
                  story.id
                }">Add to Favorites</button>
              </article>
            `
          )
          .join("");

        const addFavoriteButtons = document.querySelectorAll(".add-favorite");
        addFavoriteButtons.forEach((button) => {
          button.addEventListener("click", async (e) => {
            const id = e.target.dataset.id;
            const story = stories.find((s) => s.id === id);
            await saveStory(story);
            e.target.disabled = true;
            e.target.textContent = "Added to Favorites";
          });
        });

        if (!mapInstance) {
          mapInstance = L.map("map").setView([-6.2, 106.816], 10);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }).addTo(mapInstance);
        } else {
          mapInstance.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
              mapInstance.removeLayer(layer);
            }
          });
        }

        stories.forEach((story) => {
          if (story.lat && story.lon) {
            L.marker([story.lat, story.lon])
              .addTo(mapInstance)
              .bindPopup(`<b>${story.name}</b><br>${story.description}`);
          }
        });
      },
      showEmptyMessage() {
        const storiesContainer = document.querySelector("#stories");
        storiesContainer.innerHTML =
          '<p id="first-story" tabindex="0">No stories found. Try adding a new story!</p>';
      },
      showError(message) {
        const storiesContainer = document.querySelector("#stories");
        storiesContainer.innerHTML = `<p id="first-story" tabindex="0">Error: ${message}. Try <a href="#login">logging in again</a> or check your connection.</p>`;
      },
      showOfflineMessage(message) {
        const offlineMessage = document.querySelector("#offline-message");
        offlineMessage.style.display = "block";
        offlineMessage.textContent = message;
      },
    };

    const presenter = new HomePresenter(view);
    await presenter.loadStories(token);

    const refreshButton = document.querySelector("#refresh-stories");
    if (refreshButton) {
      refreshButton.addEventListener("click", async () => {
        token = localStorage.getItem("token");
        if (!token) {
          window.location.hash = "#login";
          return;
        }
        await presenter.loadStories(token);
      });
    }

    const clearButton = document.querySelector("#clear-stories");
    if (clearButton) {
      clearButton.addEventListener("click", async () => {
        await presenter.clearStories();
      });
    }

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
          document.querySelector("#stories");
        if (firstStory) {
          firstStory.setAttribute("tabindex", "0");
          firstStory.focus();
        }
      });
    }

    // Add to Homescreen
    let deferredPrompt;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installButton = document.querySelector("#install-button");
      if (installButton) {
        installButton.style.display = "block";
      }
    });

    const installButton = document.querySelector("#install-button");
    if (installButton) {
      installButton.addEventListener("click", async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === "accepted") {
            console.log("User accepted the A2HS prompt");
          } else {
            console.log("User dismissed the A2HS prompt");
          }
          deferredPrompt = null;
          installButton.style.display = "none";
        }
      });
    }

    // Push Notification
    const subscribeButton = document.querySelector("#subscribe-notification");
    if (subscribeButton) {
      subscribeButton.addEventListener("click", async () => {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          subscribeButton.style.display = "none";
          const registration = await navigator.serviceWorker.ready;
          try {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(
                Config.VAPID_PUBLIC_KEY
              ),
            });

            console.log("Push subscription:", subscription);

            registration.showNotification("Welcome to Dicoding Stories!", {
              body: "You will now receive updates.",
              icon: "/public/images/favicon.png", // Tetap menggunakan path relatif
            });
          } catch (error) {
            console.error("Failed to subscribe to push notifications:", error);
            alert("Failed to enable notifications. Please try again.");
          }
        } else {
          alert("Notification permission denied.");
        }
      });
    }
  },
};

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default HomePage;
