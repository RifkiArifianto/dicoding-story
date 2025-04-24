import Api from "../data/api.js";
import Idb from "../idb.js";

class HomePresenter {
  constructor(view) {
    this.view = view;
  }

  async loadStories(token) {
    try {
      if (!token) {
        this.view.showError("No token found. Please log in again.");
        return;
      }

      this.view.showLoading();

      try {
        const response = await Api.getAllStories(token, { location: 1 });
        if (response.error) {
          throw new Error(response.message);
        }

        const stories = response.listStory || [];
        if (stories.length === 0) {
          this.view.showEmptyMessage();
          return;
        }

        await Idb.saveStories(stories);
        this.view.showStories(stories);
      } catch (error) {
        const cachedStories = await Idb.getAllStories();
        if (cachedStories.length > 0) {
          this.view.showStories(cachedStories);
          this.view.showOfflineMessage("Showing cached stories (offline mode)");
        } else {
          this.view.showError(
            error.message ||
              "Failed to load stories. Please check your connection or log in again."
          );
        }
      }
    } finally {
      this.view.hideLoading();
    }
  }

  async clearStories() {
    try {
      await Idb.deleteAllStories();
      this.view.showEmptyMessage();
    } catch (error) {
      this.view.showError("Failed to clear stories from cache.");
    }
  }
}

export default HomePresenter;
