const UrlParser = {
  parseActiveUrlWithCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    const splitedUrl = url.split("/");
    return {
      resource: splitedUrl[1] || null,
      id: splitedUrl[2] || null,
      verb: splitedUrl[3] || null,
    };
  },
};

export default UrlParser;
