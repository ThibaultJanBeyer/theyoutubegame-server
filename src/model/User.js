const { color: colorRnd, wordId } = require("../utils/random");

module.exports = class User {
  constructor(data, socket) {
    this.id = socket.id;
    this.socket = socket;
    this.data = data;
  }

  set data({
    color = colorRnd(),
    username = wordId(),
    score = 0,
    guess = false,
    role = "user"
  }) {
    this.color = color;
    this.username = username;
    this.score = score;
    this.guess = guess;
    this.role = role;
  }

  get room() {
    return this._room;
  }

  set room(room) {
    // leave old
    if (this._room) {
      this.socket.leave(this._room.id);
      this._room.removeMember(this);
    }
    this._room = room;

    if (!room) return;
    // join new
    this._room.addMember(this);
    this.socket.join(this._room.id);
  }

  export(withGuess) {
    const user = {
      color: this.color,
      id: this.id,
      username: this.username,
      score: this.score,
      guess: withGuess ? this.guess : typeof this.guess === "number",
      role: this.role
    };
    return user;
  }
};
