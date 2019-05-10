const http = require("http").createServer();
const io = require("socket.io")(http);
const { Room } = require("./Room");

new (class App {
  constructor() {
    this.rooms = {};
    io.sockets.on("connection", socket => this.init(socket));
  }

  init(socket) {
    console.log("new player");
    socket.on("room/join", data => this.joinRoom(data, socket));
    socket.on("room/leave", data => this.leaveRoom(data, socket));
  }

  joinRoom(data, socket) {
    if (!data.user || !data.id) return console.log("missing id or user");
    if (this.rooms[data.id]) {
      this.rooms[data.id].addMember(data.user, socket);
    } else {
      this.rooms[data.id] = new Room({
        io,
        socket,
        id: data.id,
        member: data.user
      });
    }
  }

  leaveRoom(data, socket) {
    if (!data.roomId || !data.userId) return console.log("missing id or user");
    const room = this.rooms[data.roomId];
    if (!room) return console.log("room does not exist");
    room.removeMember(data.userId);
  }

  disconnect() {
    console.log("player left");
  }
})();

// socket.on("initialize", function() {
//   console.log("player joined");
//   const id = socket.id;
//   const newPlayer = new Player({ id });
//   // Creates a new player object with a unique ID number.

//   players[id] = newPlayer;
//   // Adds the newly created player to the array.

//   socket.emit("playerData", { id: id, players: players });
//   // Sends the connecting client his unique ID, and data about the other players already connected.

//   socket.broadcast.emit("playerJoined", newPlayer);
//   // Sends everyone except the connecting player data about the new player.
// });

// socket.on("positionUpdate", function(data) {
//   var player = players[data.id];

//   player.position = data.position;
//   player.rotation = data.rotation;
// });

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
