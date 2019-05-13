const { color, uuid, int, username: usernameRnd } = require("../utils/random");
const User = require("./User");

module.exports = class AI extends User {
  constructor(app) {
    super(
      {
        color: color(),
        username: usernameRnd(),
        score: 0,
        guess: false,
        role: "user"
      },
      { join: () => {}, id: uuid() },
      app
    );
    setTimeout(() => this.unMount(), int(0, 12 * 60 * 60 * 1000));
    this.interval = setInterval(() => this.fakeGuess(), int(10000, 60000));
  }

  fakeGuess() {
    if (typeof this.guess !== "number") this.guess = int(0, 2000000);
  }

  unMount() {
    super.unMount();
    clearInterval(this.interval);
  }
};
