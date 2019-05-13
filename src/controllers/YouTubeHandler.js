const {
  query,
  date,
  boolean,
  int,
  regionCode,
  languageCode
} = require("../utils/random");
const fetch = require("node-fetch");

module.exports = class YouTubeHandler {
  get randomOrder() {
    const possible = [
      "date",
      "rating",
      "relevance",
      "title",
      "videoCount",
      "viewCount"
    ];
    return possible[Math.floor(Math.random() * possible.length)];
  }

  get randomDateOrder() {
    return Math.random() > 0.5 ? "publishedAfter" : "publishedBefore";
  }

  /**
   * Rolls for a random video.
   * pass region code to prevent blocked content.
   * @param {string} location ISO 3166-1 alpha-2 country code e.g. "DE"
   * @param {string} language ISO 639-1 two-letter language code e.g. "de"
   */
  async roll(location, language, trial = 0) {
    const reg = location || regionCode();
    const lang = language || languageCode();
    const request = `https://www.googleapis.com/youtube/v3/search
      ?q=${query()}
      &maxResults=50
      &${boolean ? `${this.randomDateOrder}=${date()}` : ""}
      &order=${this.randomOrder}
      &type=video
      &videoSyndicated=true
      &videoEmbeddable=true
      &part=id
      ${reg ? `&regionCode=${reg}` : ""}
      ${lang ? `&relevanceLanguage=${lang}` : ""}
      &key=${process.env[`YOUTUBE_KEY_${trial}`]}
      `.replace(/\s/g, "");

    console.log("roll youtube video", request);

    const result = await fetch(request)
      .then(resp => resp.json())
      .then(resp => {
        if (resp.items) return resp.items[int(0, resp.items.length)];
        else throw resp;
      })
      .then(item => {
        const videoId = item && item.id && item.id.videoId;
        if (videoId) return videoId;
        else throw item;
      })
      .catch(err => console.error(err));

    console.log(trial);
    if (!result && trial < process.env.YOUTUBE_KEYS_MAX) {
      const newTrial = trial + 1;
      return await this.roll(location, language, newTrial);
    } else return result;
  }

  /**
   * Returns Video Stats based on ID
   * @param {string} videoID youtube video ID
   */
  getVideoStats(videoID) {
    return fetch(
      `
      https://www.googleapis.com/youtube/v3/videos
      ?part=statistics
      &id=${videoID}
      &key=${process.env[`YOUTUBE_KEY_${int(0, process.env.YOUTUBE_KEYS_MAX)}`]}
    `.replace(/\s/g, "")
    )
      .then(resp => resp.json())
      .then(resp => resp.items && resp.items[0] && resp.items[0].statistics)
      .catch(err => console.error(err));
  }
};
