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
    return (this.members[user.id] = user);
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

  applyScore() {
    return nearest.map((member, i) => {
      member.guess = 0;
      member.score += Math.floor(this.points / (i + 1));
    });
  }

  checkRound() {
    return false;
    if (!this.allVoted) return;
    this.videoStats = this.video.stats;
    this.nearest = this.getNearestToViews();
    this.applyScore(this.nearest);
  }

  sync() {
    this.loop = setInterval(() => {
      const members = Object.values(this.members).map(user =>
        user.export(!!this.videoStats)
      );
      this.message("room/sync", {
        members,
        videoId: this.video.id,
        nearest: this.nearest,
        points: this.points,
        videoStats: this.videoStats
      });
      this.checkRound();
    }, 5000);
  }
}

exports.Room = Room;
