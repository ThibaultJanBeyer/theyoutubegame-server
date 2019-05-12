const http = require("http").createServer();
const io = require("socket.io")(http);
const { Room } = require("./controllers/Room");
const User = require("./model/User");

new (class App {
  constructor() {
    this.rooms = {};
    this.users = {};
    this.io = io;
    this.io.sockets.on("connection", socket => this.init(socket));
  }

  init(socket) {
    console.log("new player", socket.id);
    const user = new User({}, socket);
    this.users[user.id] = user;

    socket.on("user/sync", data => {
      console.log("update user", data);
      user.data = data;
    });
    socket.on("room/join", data => this.joinRoom(data.id, user));
    socket.on("room/leave", data => this.leaveRoom(user));
    socket.on("disconnect", () => this.disconnect(user));
  }

  joinRoom(id, user) {
    if (!id || !user) return console.log("missing id or user");
    if (!this.rooms[id]) this.rooms[id] = new Room(id, this);
    user.room = this.rooms[id];
  }

  leaveRoom(user) {
    if (!user.room) return console.log("user was in no room");
    const roomId = user.room.id;
    user.room = false;
    if (this.rooms[roomId].isEmpty) {
      this.rooms[roomId].unMount();
      delete this.rooms[roomId];
    }
  }

  disconnect(user) {
    console.log("player left", user.id);
    this.leaveRoom(user);
    delete this.users[user.id];
  }
})();

// let time = new Date().getTime();
// setInterval(function() {
//   // get past time
//   let now = new Date().getTime(),
//     dt = now - time;

//   time = now;

//   socket.broadcast.emit("updatePlayers", players);
// });

console.log("Server started. 8000");
http.listen(8000);
