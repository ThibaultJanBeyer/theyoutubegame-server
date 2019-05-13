const youTubeHandler = require("./YouTubeHandler");

const loopTimer = 1000;

class Room {
  constructor(id, app) {
    this.app = app;
    this.id = id;

    this.points = 1000;
    this.video = {};
    this.members = [];
    this.membersLookup = [];

    this.sync();
    this.startRound();
  }

  message(msg, data) {
    this.app.io.to(this.id).emit(msg, data);
  }

  addMember(user) {
    console.log("add player", user.id);
    if (this.membersLookup.indexOf(user.id) >= 0) return user;
    this.membersLookup.push(user.id);
    this.members.push(user);
  }

  removeMember(user) {
    const index = this.membersLookup.indexOf(user.id);
    this.membersLookup.splice(index);
    this.members.splice(index);
    return this.members;
  }

  get isEmpty() {
    return this.members.length < 1;
  }

  async startRound() {
    try {
      this.members.forEach(member => (member.guess = 0));
      const id = await youTubeHandler.roll();
      const stats = await youTubeHandler.getVideoStats(id);
      this.video = { id, stats };
    } catch (err) {
      console.log(err);
    }
    this.videoStats = false;

    this.timeout = 120000;
    this.timeoutCallback = () => this.endRound();
  }

  get allVoted() {
    return !this.members.filter(member => typeof member.guess !== number)[0];
  }

  getNearestToViews() {
    const views = this.video.stats ? this.video.stats.viewCount * 1 : 0;
    const guess = this.members.filter(user => typeof user.guess === number);
    return guess.sort(
      (a, b) => Math.abs(views - a.guess) - Math.abs(views - b.guess)
    );
  }

  applyScores(nearest) {
    nearest.forEach((user, i) => {
      const bonus = Math.floor(this.points / (i + 1));
      user.score += bonus;
      user.bonus = bonus;
    });
  }

  checkRound() {
    console.log(this.allVoted, this.members);
    if (!this.allVoted) return;
    if (typeof this.videoStats === "number") return;

    this.endRound();
  }

  endRound() {
    if (this.videoStats) return;

    console.log("endRound");
    this.videoStats = this.video.stats || 0;
    this.applyScores(this.getNearestToViews());

    this.timeout = 30000;
    this.timeoutCallback = () => this.startRound();
  }

  handleTimeouts() {
    console.log(this.timeout);
    if (this.timeout > 0) return (this.timeout = this.timeout - loopTimer);
    if (this.timeout <= 0) {
      this.timeout = false;
      this.timeoutCallback();
    }
  }

  sync() {
    this.loop = setInterval(() => {
      this.handleTimeouts();
      this.checkRound();

      const members = this.members.map(user =>
        user.export(typeof this.videoStats === "number")
      );

      this.message("room/sync", {
        members,
        videoId: this.video.id,
        points: this.points,
        videoStats: this.videoStats,
        timeout: this.timeout
      });
    }, loopTimer);
  }

  unMount() {
    clearInterval(this.loop);
  }
}

exports.Room = Room;
