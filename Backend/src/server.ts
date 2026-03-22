import http from "http";
import app from "./app";
import { env } from "./configs/env";

const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});

server.on("error", (error) => {
  console.error("Error starting server:", error);
});
