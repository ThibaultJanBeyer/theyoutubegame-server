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
    this.skip = false;
  }

  set data({ color, username, guess, uuid = uuidRnd(), skip }) {
    this.color = color;
    this.username = username;
    this.guess = guess;
    this.uuid = uuid;
    this.skip = skip;
  }

  joinRoom(room) {
    this.room = room;
    this.room.addMember(this);
    this.socket.join(this.room.id);
  }

  leaveRoom() {
    if (!this.room || !this.socket || !this.socket.leave) return;
    this.socket.leave(this.room.id);
    this.room.removeMember(this);
    this.room = false;
  }

  resetVotes() {
    this.guess = false;
    this.bonus = false;
    this.skip = false;
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
