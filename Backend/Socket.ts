import { Server, Socket } from "socket.io";
import crypto from "crypto";
const randomId = () => crypto.randomBytes(8).toString("hex");

import http from "http";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { InMemorySessionStore } from "./SessionStore";

// Creating new instance of InMemorySessionStore to access all of this class method
const sessionStore = new InMemorySessionStore();

interface Isession {
  userID: String;
  username: String;
  connected: Boolean;
}

export function Connection(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  //   middleware to check username and for session id
  io.use((socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    console.log(sessionID);

    if (sessionID) {
      const session = sessionStore.findSession(sessionID);
      socket.data.sessionID = session ? sessionID : "null";
      socket.data.userID = session ? session.userID : "null";
      socket.data.username = session ? session.username : "null";
      return next();
    }
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("invalid username"));
    }
    console.log(username);

    // Create  new session
    socket.data.sessionID = randomId();
    socket.data.userID = randomId();
    socket.data.username = username;
    next();
  });

  // for connection
  io.on("connection", (socket) => {
    PersistSession(socket);
    PrivateMessage(socket);
    EmitUsers(socket);
    EmitMessage(socket, io);
  });
}

function PersistSession(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  sessionStore.saveSession(socket.data.sessionID, {
    userID: socket.data.userID ? socket.data.userID : "",
    username: socket.data.username ? socket.data.username : "",
    connected: true,
  });

  //emit session details for client
  socket.emit("session", {
    sessionID: socket.data.sessionID ? socket.data.sessionID : "",
    userID: socket.data.userID ? socket.data.userID : "",
  });

  console.log(socket.data.userID);
  console.log(socket.data.sessionID);

  // join the room same as UserID
  //   socket.join(socket.data.userID);
}

function EmitUsers(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  const users: Array<Isession> = [];
  sessionStore.findallSessions().forEach((session) => {
    users.push({
      userID: session.userID,
      username: session.username,
      connected: true,
    });
  });

  socket.emit("users", users);
  // broadcast will emit everyone except the senders.
  // Notify existing users
  //   socket.broadcast.emit("user connected", {
  //     userID: socket.id,
  //     username: socket.handshake.auth.username,
  //   });
}

function PrivateMessage(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  socket.on("private message", ({ hi, to }) => {
    socket.to(to).emit("private dm", {
      hi,
      from: socket.id,
    });
  });
}

// getting message from client and again emmiting to every client
function EmitMessage(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  socket.on("chat-message", (mssg) => {
    console.log(mssg);
    io.emit("message", mssg);
  });
}
