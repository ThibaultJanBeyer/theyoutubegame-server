const { color: colorRnd, wordId, uuid: uuidRnd } = require("../utils/random");

module.exports = class User {
  constructor(
    {
      color = colorRnd(),
      username = wordId(),
      score = 0,
      guess = false,
      role = "user"
    },
    socket
  ) {
    this.id = socket.id;
    this.socket = socket;

    this.score = score;
    this.role = role;
    this.color = color;
    this.username = username;
    this.guess = guess;
  }

  set data({ color, username, guess, uuid = uuidRnd() }) {
    console.log("setData", color, username, guess, uuid);
    this.color = color;
    this.username = username;
    this.guess = guess;
    this.uuid = uuid;
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
      uuid: this.uuid,
      username: this.username,
      score: this.score,
      guess: withGuess ? this.guess : typeof this.guess === "number",
      role: this.role,
      bonus: this.bonus
    };
    return user;
  }
};
