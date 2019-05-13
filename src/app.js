const http = require("http").createServer();
const io = require("socket.io")(http, { origins: "*:*" });
const Room = require("./controllers/Room");
const YouTubeHandler = require("./controllers/YouTubeHandler");
const User = require("./model/User");
require("dotenv").config();

new (class App {
  constructor() {
    this.yt = new YouTubeHandler();
    this.rooms = {};
    this.users = {};
    this.io = io;
    this.io.origins("*:*");
    this.io.sockets.on("connection", socket => this.init(socket));
  }

  init(socket) {
    console.log("new player", socket.id);
    const user = new User({}, socket, this);
    this.users[user.id] = user;

    socket.on("user/sync", data => (user.data = data));
    socket.on("room/join", data => this.joinRoom(data.id, user, socket));
    socket.on("room/leave", data => this.leaveRoom(data.id, user));
    socket.on("disconnect", () => this.disconnect(user));
    socket.on("room/chat/message", data => this.chatRoom(data.id, data));
  }

  joinRoom(id, user, socket) {
    if (!id || !user) return console.log("missing id or user");
    if (!this.rooms[id]) this.rooms[id] = new Room(id, this, socket);
    user.room = this.rooms[id];
  }

  leaveRoom(id, user) {
    if (!id || !user.room) return console.log("user was in no room");
    const roomId = user.room.id;
    user.room = false;
    if (!this.rooms[id]) return console.log("room does not exist");
    if (this.rooms[id].isEmpty) {
      this.rooms[id].unMount();
      delete this.rooms[id];
    }
  }

  chatRoom(id, data) {
    const room = this.rooms[id];
    if (!room) return console.log("room does not exist");
    room.chatMessage(data);
  }

  disconnect(user) {
    console.log("player left", user.id);
    this.leaveRoom(user.room, user);
    delete this.users[user.id];
  }
})();

console.log("Server started. 8000");
http.listen(8000);
