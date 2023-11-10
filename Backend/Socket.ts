import { Server, Socket } from "socket.io";
import http from "http";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export function Connection(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });
  io.on("connection", (socket) => {
    console.log("A new user has connected", socket.id);
    EmitMessage(socket, io);
  });
}

function EmitMessage(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  socket.on("chat-message", (mssg) => {
    io.emit("message", mssg);
    console.log(mssg);
  });
}
