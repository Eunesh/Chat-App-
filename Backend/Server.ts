import { app } from "./index";
import dotenv from "dotenv";
import http from "http";
import { availableParallelism } from "os";
import { Connection } from "./Socket";
import cluster from "node:cluster";
dotenv.config({ path: "./.env" });

const PORT: string | undefined = process.env.PORT; // FOR PORT

// checking processor of your cpu
const numCpus = availableParallelism();

const server = http.createServer(app);

Connection(server); // connection for socket and emitting message
server.listen(PORT, () => {
  console.log(`Server is listining on port ${PORT} ${process.pid}`);
});

// clustering nodejs(dividing work load)
// if (cluster.isPrimary) {
//   console.log(`Primary ${process.pid} is running`);

//   // Fork workers.
//   for (let i = 0; i < numCpus; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//   });
// } else {
//   Connection(server); // connection for socket and emitting message
//   server.listen(PORT, () => {
//     console.log(`Server is listining on port ${PORT} ${process.pid}`);
//   });
// }
