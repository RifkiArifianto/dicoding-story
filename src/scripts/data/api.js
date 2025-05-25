// src/scripts/data/api.js
import Config from "../utils/config.js";

const Api = {
  BASE_URL: Config.API_BASE_URL,

  async getAllStories(token, options = {}) {
    const { page = 1, size = 10, location = 0 } = options;
    const url = `${this.BASE_URL}/stories?location=${location}&page=${page}&size=${size}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  async addStory(formData, token) {
    const response = await fetch(`${this.BASE_URL}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  },

  async getStoryDetail(id, token) {
    const response = await fetch(`${this.BASE_URL}/stories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  async login(credentials) {
    const response = await fetch(`${this.BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  async register(credentials) {
    const response = await fetch(`${this.BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },
};

export default Api;
