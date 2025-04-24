import Api from "../data/api.js";

class DetailPresenter {
  constructor(view) {
    this.view = view;
  }

  async loadStoryDetail(id, token) {
    try {
      this.view.showLoading();
      const response = await Api.getStoryDetail(id, token);
      if (response.error) {
        this.view.showError(response.message);
        return;
      }

      const story = response.story;
      if (!story) {
        this.view.showError("Story not found.");
        return;
      }

      this.view.showStory(story);
    } catch (error) {
      this.view.showError(error.message);
    } finally {
      this.view.hideLoading();
    }
  }
}

export default DetailPresenter;
