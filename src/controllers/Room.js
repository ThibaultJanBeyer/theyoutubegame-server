const { int } = require("../utils/random");
const AI = require("../model/AI");

const loopTimer = 1000;
const baseTimeout = 50 * 1000;

module.exports = class Room {
  constructor(id, app, socket) {
    this.app = app;
    this.id = id;

    this.points = 1000;
    this.video = {};
    this.members = [];
    this.membersLookup = [];
    this.fakeMemberLookup = [];
    this.chatMessages = [];

    this.handleAI();

    this.sync();
  }

  chatMessage(data) {
    console.log("got a message", data);
    const user = this.members.find(user => user.uuid === data.author.uuid);
    if (!user) return console.log("user not found in room");
    this.chatMessages.push({ author: user.export(), text: data.text });
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
    const realMembers = this.membersLookup.filter(
      member => this.fakeMemberLookup.indexOf(member) < 0
    );
    return realMembers.length < 1;
  }

  async startRound() {
    this.members.forEach(user => user.resetVotes());
    this.ended = false;

    try {
      const id = await this.app.yt.roll(); // 100 quota cost
      const stats = await this.app.yt.getVideoStats(id); // 2 quota cost
      this.video = { id, stats };
    } catch (err) {
      console.log(err);
    }
    this.videoStats = false;

    this.timeout = baseTimeout * 2.2;
    this.timeoutCallback = () => this.endRound();
  }

  get allVoted() {
    return this.members.every(member => typeof member.guess === "number");
  }

  get allSkip() {
    return this.members.every(member => member.skip);
  }

  getNearestToViews() {
    const views = this.video.stats ? +this.video.stats.viewCount : 0;
    const guess = this.members.filter(user => typeof user.guess === "number");
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
    if (this.allVoted && !this.ended) return this.endRound();
    if (this.allSkip && this.ended) return this.startRound();
  }

  endRound() {
    console.log("endRound");
    this.ended = true;
    this.videoStats = this.video.stats || {};
    this.applyScores(this.getNearestToViews());

    this.timeout = baseTimeout;
    this.timeoutCallback = () => this.startRound();
  }

  handleTimeouts() {
    if (this.timeout > 0) return (this.timeout = this.timeout - loopTimer);
    if (this.timeout <= 0) {
      this.timeout = false;
      this.timeoutCallback();
    }
  }

  sync() {
    this.loop = setInterval(() => {
      if (this.isEmpty) return;

      if (!this.running) {
        this.running = true;
        this.startRound();
      }

      this.handleTimeouts();
      this.checkRound();

      const members = this.members.map(user => user.export(this.videoStats));

      this.message("room/sync", {
        members,
        videoId: this.video.id,
        points: this.points,
        videoStats: this.videoStats,
        timeout: this.timeout,
        chatMessages: this.chatMessages
      });
    }, loopTimer);
  }

  unMount() {
    clearInterval(this.loop);
  }

  addFakeMember() {
    console.log("add fake");
    const fakeMember = new AI(this.app);
    this.fakeMemberLookup.push(fakeMember.id);
    this.app.joinRoom("public", fakeMember);
    return fakeMember;
  }

  handleAI() {
    console.log(this.id);
    if (this.id !== "public" || this.membersLookup.length > 4) return;
    for (let i = 0; i < int(1, 12); i++) {
      setTimeout(() => this.addFakeMember());
    }
    setTimeout(() => this.addFakeMember(), int(60 * 1000, 60 * 60 * 1000));
  }
};
