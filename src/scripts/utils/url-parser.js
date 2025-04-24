const UrlParser = {
  parseActiveUrlWithCombiner() {
    const url = window.location.hash.slice(1); // Hapus toLowerCase
    const splitedUrl = url.split("/");
    return {
      resource: splitedUrl[0] || "",
      id: splitedUrl[1] || "",
    };
  },

  parseActiveUrlWithoutCombiner() {
    return window.location.hash.slice(1); // Hapus toLowerCase
  },
};

export default UrlParser;
