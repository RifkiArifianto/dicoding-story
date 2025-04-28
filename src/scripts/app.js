import UrlParser from "./utils/url-parser.js";
import routes from "../scripts/routes/routes.js";
import Api from "./data/api.js";
import Config from "./utils/config.js";

class App {
  constructor({ content }) {
    this.content = content;
    this.currentPageKey = "";
    this.initializeSkipLinkHandler();
    this.initializePushNotification();
  }

  initializeSkipLinkHandler() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (target.classList.contains("skip-link")) {
        event.preventDefault();
        const mainContent = document.querySelector("#main-content");
        if (mainContent) {
          mainContent.setAttribute("tabindex", "-1");
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  }

  async initializePushNotification() {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const registration = await navigator.serviceWorker.register(
          "/service-worker.js"
        );
        console.log("Service Worker registered:", registration);

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied");
          return;
        }

        const vapidPublicKey = Config.VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error("VAPID public key is not defined in Config");
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
        });
        console.log("Subscription created:", subscription);

        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch(`${Api.BASE_URL}/subscribe`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(subscription),
          });

          if (!response.ok) {
            console.error(
              `Failed to send push subscription: ${response.status} ${response.statusText}`
            );
          } else {
            console.log("Push subscription sent to server successfully");
          }
        } else {
          console.log("No token found, skipping subscription");
        }
      } catch (error) {
        console.error("Error initializing push notification:", error);
      }
    } else {
      console.log("Push notifications are not supported in this browser");
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    const pageKey = url.resource || "";
    this.currentPageKey = pageKey;

    if (pageKey === "main-content" || pageKey === "logout") {
      return;
    }

    const page = routes[pageKey];

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        if (page) {
          if (url.resource === "detail") {
            if (url.id) {
              this.content.innerHTML = await page.render();
              await page.afterRender(url.id);
            } else {
              window.location.hash = "#home";
              return;
            }
          } else {
            this.content.innerHTML = await page.render();
            await page.afterRender();
          }
        } else {
          this.content.innerHTML = "<h2>Page not found</h2>";
        }
      });
    } else {
      if (page) {
        if (url.resource === "detail") {
          if (url.id) {
            this.content.innerHTML = await page.render();
            await page.afterRender(url.id);
          } else {
            window.location.hash = "#home";
            return;
          }
        } else {
          this.content.innerHTML = await page.render();
          await page.afterRender();
        }
      } else {
        this.content.innerHTML = "<h2>Page not found</h2>";
      }
    }
  }
}

export default App;
