import { app } from "./index";
import dotenv from "dotenv";
import http from "http";
import { availableParallelism } from "os";
import { Connection } from "./Socket";
import cluster from "node:cluster";
import { setupPrimary } from "@socket.io/cluster-adapter";

dotenv.config({ path: "./.env" });

const PORT: string | undefined = process.env.PORT; // FOR PORT

// checking processor of your cpu
const numCpus = availableParallelism();

const server = http.createServer(app);

// clustering nodejs(dividing work load)
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers and make it run on different port
  for (let i = 0; i < numCpus; i++) {
    cluster.fork({
      PORT: 3000 + i,
    });
  }

  // setup connections between the workers
  setupPrimary();

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  Connection(server); // connection for socket and emitting message
  server.listen(PORT, () => {
    console.log(`Server is listining on port ${PORT} ${process.pid}`);
  });
}
