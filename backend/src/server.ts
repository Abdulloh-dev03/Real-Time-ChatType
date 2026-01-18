import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import type { Request,Response } from "express";
import { socketCorsOptions } from "#config/cors.config.js";
import logger from "#config/logger.js";
import { initSocket } from "#socket/socket.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: socketCorsOptions,
});

initSocket(io);



app.get("/", (_req:Request, res: Response) => {
  logger.info("ChatType Backend is running!");
  res.send("ChatType Backend is running!");
});

server.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
