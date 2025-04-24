import Api from "../data/api.js";
import L from "leaflet/dist/leaflet.js";
import "leaflet/dist/leaflet.css";

const AddStoryPage = {
  async render() {
    const token = localStorage.getItem("token");
    return `
      <a href="#main-content" class="skip-link">Skip to content</a>
      <header>
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#add-story">Add Story</a></li>
            <li><a href="#about">About</a></li>
            ${
              token
                ? '<li><button id="logout-button">Logout</button></li>'
                : '<li><a href="#login">Login</a></li>'
            }
          </ul>
        </nav>
      </header>
      <main id="main-content" role="main">
        <h1>Add New Story</h1>
        <form id="add-story-form">
          <label for="description">Description</label>
          <textarea id="description" required aria-required="true"></textarea>
          <label for="photo">Photo (or use camera below)</label>
          <input type="file" id="photo" accept="image/*">
          <div>
            <video id="camera-stream" style="width: 100%; max-width: 300px; height: auto;"></video>
            <button type="button" id="capture-photo">Capture Photo</button>
          </div>
          <div id="map" style="height: 300px;"></div>
          <button type="submit">Add Story</button>
        </form>
      </main>
    `;
  },

  async afterRender() {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#login";
      return;
    }

    let lat, lon;
    const form = document.querySelector("#add-story-form");
    const video = document.querySelector("#camera-stream");
    const captureButton = document.querySelector("#capture-photo");
    let capturedPhoto = null;
    let stream = null; // Simpan referensi stream

    // Inisialisasi kamera
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.play();
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Failed to access camera. Please upload a photo instead.");
    }

    // Fungsi untuk mematikan stream kamera
    const stopCameraStream = () => {
      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        stream = null;
      }
    };

    // Tangkap foto dari kamera
    captureButton.addEventListener("click", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        capturedPhoto = new File([blob], "captured-photo.jpg", {
          type: "image/jpeg",
        });
        alert("Photo captured! You can now submit the form.");
      }, "image/jpeg");
    });

    // Inisialisasi peta
    const map = L.map("map").setView([-6.2, 106.816], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", (e) => {
      lat = e.latlng.lat;
      lon = e.latlng.lng;
      L.marker([lat, lon]).addTo(map);
    });

    // Tangani submit form
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const description = form.querySelector("#description").value.trim();
      const photoInput = form.querySelector("#photo").files[0];
      const photo = capturedPhoto || photoInput;

      // Validasi
      if (!description) {
        alert("Description cannot be empty.");
        stopCameraStream(); // Matikan stream meskipun validasi gagal
        return;
      }
      if (!photo) {
        alert("Please select a photo or capture one using the camera.");
        stopCameraStream(); // Matikan stream meskipun validasi gagal
        return;
      }

      // Nonaktifkan stream kamera setelah submit
      stopCameraStream();

      try {
        const response = await Api.addStory({
          description,
          photo,
          lat,
          lon,
          token,
        });
        console.log("API Response:", response);
        if (!response.error) {
          alert("Story added successfully!");
          window.location.hash = "#home";
          window.location.reload();
        } else {
          alert("Failed to add story: " + response.message);
        }
      } catch (error) {
        console.error("Error adding story:", error);
        alert("Error: " + error.message);
      }
    });

    // Matikan stream kamera saat berpindah halaman
    const handleHashChange = () => {
      if (window.location.hash !== "#add-story") {
        stopCameraStream();
        window.removeEventListener("hashchange", handleHashChange); // Hapus listener setelah digunakan
      }
    };
    window.addEventListener("hashchange", handleHashChange);

    // Matikan stream kamera saat halaman ditutup atau di-refresh
    window.addEventListener("beforeunload", () => {
      stopCameraStream();
    });

    // Tambahkan event listener untuk tombol logout
    const logoutButton = document.querySelector("#logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        stopCameraStream(); // Matikan stream sebelum logout
        localStorage.removeItem("token");
        window.location.hash = "#login";
      });
    }
  },
};

export default AddStoryPage;
