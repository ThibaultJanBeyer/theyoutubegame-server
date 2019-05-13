const {
  color: colorRnd,
  username: usernameRnd,
  uuid: uuidRnd
} = require("../utils/random");

module.exports = class User {
  constructor(
    {
      color = colorRnd(),
      username = usernameRnd(),
      score = 0,
      guess = false,
      role = "user"
    },
    socket,
    app
  ) {
    this.app = app;
    this.id = socket.id;
    this.socket = socket;

    this.score = score;
    this.role = role;
    this.color = color;
    this.username = username;
    this.guess = guess;
  }

  set data({ color = colorRnd(), username, guess, uuid = uuidRnd() }) {
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

  resetGuess() {
    console.log("guess resetted", this.guess);
    this.guess = false;
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

  unMount() {
    this.app.disconnect(this);
  }
};
