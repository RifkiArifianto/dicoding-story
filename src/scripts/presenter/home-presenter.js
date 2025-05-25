// src/scripts/presenter/home-presenter.js
import Api from "../data/api.js"; // Perbaiki path impor
import Idb from "../idb.js";

class HomePresenter {
  constructor(view) {
    this.view = view;
    this.api = Api;
  }

  async loadStories(token) {
    this.view.showLoading();
    try {
      const response = await this.api.getAllStories(token, {
        page: 1,
        size: 10,
        location: 0,
      });
      if (response.error) {
        this.view.showError(response.message);
      } else if (response.listStory.length === 0) {
        this.view.showEmptyMessage();
      } else {
        await Idb.saveStories(response.listStory); // Simpan ke IndexedDB
        this.view.showStories(response.listStory);
      }
    } catch (error) {
      const cachedStories = await Idb.getAllStories(); // Ambil dari cache
      if (cachedStories.length > 0) {
        this.view.showStories(cachedStories);
      } else {
        this.view.showError("Failed to load stories. Check your connection.");
        this.view.showOfflineMessage(
          "You are offline. Showing cached stories if available."
        );
      }
    }
    this.view.hideLoading();
  }

  async clearStories() {
    await Idb.deleteAllStories();
    console.log("Stories cache cleared");
    this.view.showEmptyMessage();
  }
}

export default HomePresenter;
