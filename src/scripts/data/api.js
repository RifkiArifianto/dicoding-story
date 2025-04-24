import Config from "../utils/config.js";

const BASE_URL = Config.API_BASE_URL;

const Api = {
  BASE_URL,

  async register({ name, email, password }) {
    const response = await fetch(`${Config.API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  async login({ email, password }) {
    const response = await fetch(`${Config.API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getAllStories(token, { page = 1, size = 10, location = 0 } = {}) {
    try {
      const url = `${Config.API_BASE_URL}/stories?page=${page}&size=${size}&location=${location}`;
      console.log("Fetching stories with token:", token); // Debug token
      console.log("Request URL:", url); // Debug URL

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Response status:", response.status); // Debug status
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug respon
      return data;
    } catch (error) {
      console.error("Error in getAllStories:", error);
      throw error; // Lempar error ke loadStories
    }
  },

  async addStory({ description, photo, lat, lon, token }) {
    if (photo.size > Config.MAX_FILE_SIZE) {
      throw new Error("Photo size exceeds 1MB limit");
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat && lon) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    const response = await fetch(`${Config.API_BASE_URL}/stories`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },

  async getStoryDetail(id, token) {
    const response = await fetch(`${Config.API_BASE_URL}/stories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};

export default Api;
