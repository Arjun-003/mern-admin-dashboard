import express from 'express';
import cors from 'cors';
import path from 'path';
import http from "http"; // ✅ ADD
import { fileURLToPath } from "url";
import sequelize from './config/DBconnection.js';
import initSocket from './config/SocketServer.js';
import userRoutes from './routes/userRoutes.js';
import comments from './routes/commentsRoutes.js';
import producting from "./routes/productImgRoute.js";
import likeProductRoute from "./routes/likeProductRoute.js";
import chatData from './routes/ChatRoutes.js';
import AdminDash from './routes/AdminRoutes/dashBoardRoutes.js';
import './models/index.js';

// Admin Routes
import categoryRoutes from './routes/AdminRoutes/categoryRoutes.js';
import SubCatRoutes from './routes/AdminRoutes/SubCatRoutes.js';
import userPageRoutes from './routes/AdminRoutes/userPageRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__filename , "File Name");
console.log(__dirname, "Directory Name");
const app = express();

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174"
    ],
    credentials: true,
  })
);

// Static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/', userRoutes);
app.use('/', producting);
app.use('/', categoryRoutes);
app.use('/', SubCatRoutes);
app.use('/', comments);
app.use('/', chatData);
app.use('/', likeProductRoute);

// Admin Routes
app.use('/api', AdminDash);
app.use('/api', userPageRoutes);


// 🔑 CREATE HTTP SERVER
const server = http.createServer(app);
// 🔑 INIT SOCKET.IO
const io = initSocket(server);
app.set("io", io);
// DB + Server
const PORT = process.env.PORT || 5000;

const dbConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");
    await sequelize.sync({ alter: false });
    console.log("Models synced.");
  } catch (error) {
    console.error("DB error:", error); 
  }
};

const startServer = async () => {
  await dbConnect();

  // 🔑 USE server.listen (NOT app.listen)
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
