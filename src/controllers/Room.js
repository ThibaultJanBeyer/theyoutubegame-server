const youTubeHandler = require("./YouTubeHandler");

class Room {
  constructor({ id, member, socket, io }) {
    this.io = io;
    this.id = id;
    this.points = 1000;
    this.video = { id: "foo" };
    this.members = {};
    this.addMember(member, socket);
    this.sync();
  }

  message(msg, data) {
    this.io.to(this.id).emit(msg, data);
  }

  addMember(member, socket) {
    console.log("add player", member);
    socket.join(this.id);
    if (this.members[member.id]) return member;
    this.members[member.id] = Object.assign({}, member);
    socket.on("disconnect", () => this.removeMember(member.id));
    return member;
  }

  removeMember(memberId) {
    delete this.members[memberId];
    return this.members;
  }

  async startRound() {
    const id = await youTubeHandler.roll();
    const stats = await youTubeHandler.getVideoStats(id);
    this.video = { id, stats };
    this.videoStats = false;
  }

  allVoted() {
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
    if (!this.allVoted()) return;
    this.videoStats = this.video.stats;
    this.nearest = this.getNearestToViews();
    this.applyScore(this.nearest);
  }

  sync() {
    this.loop = setInterval(() => {
      this.message("room/sync", {
        members: Object.values(this.members),
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
