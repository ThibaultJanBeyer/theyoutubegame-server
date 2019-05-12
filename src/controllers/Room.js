const youTubeHandler = require("./YouTubeHandler");

class Room {
  constructor(id, app) {
    this.app = app;
    this.id = id;

    this.points = 1000;
    this.video = {};
    this.members = {};

    this.sync();
    this.startRound();
  }

  message(msg, data) {
    this.app.io.to(this.id).emit(msg, data);
  }

  addMember(user) {
    console.log("add player", user.id);
    if (this.members[user.id]) return user;
    this.members[user.id] = user;
  }

  removeMember(user) {
    delete this.members[user.id];
    return this.members;
  }

  get isEmpty() {
    return Object.keys(this.members).length < 1;
  }

  async startRound() {
    try {
      Object.values(this.members).forEach(user => (user.guess = 0));
      const id = await youTubeHandler.roll();
      const stats = await youTubeHandler.getVideoStats(id);
      this.video = { id, stats };
      this.videoStats = false;
    } catch (err) {
      console.log(err);
    }
  }

  get allVoted() {
    return !Object.values(this.members).filter(member => !member.guess)[0];
  }

  getNearestToViews() {
    const views = this.video.stats.viewCount * 1;
    return Object.values(this.members).sort(
      (a, b) => Math.abs(views - a.guess) - Math.abs(views - b.guess)
    );
  }

  applyScores(nearest) {
    return nearest.map((user, i) => {
      user.score += Math.floor(this.points / (i + 1));
      user.nearestPlace = i;
    });
  }

  checkRound() {
    if (this.videoStats || !this.allVoted) return;
    this.endRound();
  }

  endRound() {
    console.log("endRound");
    this.videoStats = this.video.stats;
    this.applyScores(this.getNearestToViews());
  }

  sync() {
    this.loop = setInterval(() => {
      const members = Object.values(this.members).map(user =>
        user.export(!!this.videoStats)
      );
      this.message("room/sync", {
        members,
        videoId: this.video.id,
        points: this.points,
        videoStats: this.videoStats
      });
      this.checkRound();
    }, 2000);
  }

  unMount() {
    clearInterval(this.loop);
  }
}

exports.Room = Room;
