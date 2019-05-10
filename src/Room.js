class Room {
  constructor({ id, member, socket, io }) {
    this.io = io;
    this.id = id;
    this.members = {};
    this.addMember(member, socket);
    this.sync();
  }

  message(msg, data) {
    this.io.to(this.id).emit(msg, data);
  }

  addMember(member, socket) {
    console.log("add player", member);
    socket.join(this.id);
    if (this.members[member.id]) return member;
    this.members[member.id] = Object.assign({}, member);
    socket.on("disconnect", () => this.removeMember(member.id));
    return member;
  }

  removeMember(memberId) {
    console.log("player left", memberId);
    delete this.members[memberId];
    console.log(this.members);
    return this.members;
  }

  sync() {
    this.loop = setInterval(
      () => this.message("room/sync", Object.values(this.members)),
      5000
    );
  }
}

exports.Room = Room;
