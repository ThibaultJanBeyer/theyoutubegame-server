const { color, uuid, int, username: usernameRnd } = require("../utils/random");
const User = require("./User");

const guessSteps = [10, 100, 1000, 10000, 100000, 1000000, 10000000];

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
    this.interval = setInterval(() => this.fakeGuess(), int(5000, 45000));
  }

  fakeGuess() {
    this.skip = true;
    if (typeof this.guess !== "number") {
      const guessRange = guessSteps[int(0, guessSteps.length - 1)];
      this.guess = int(0, guessRange);
    }
  }

  unMount() {
    super.unMount();
    clearInterval(this.interval);
  }
};
