import express, { Request, Response } from "express";
import { initDB } from "./config/db";
import { logger } from "./middleware/logger";
import router from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(logger);

initDB();

app.get("/", logger, (req: Request, res: Response) => {
  res.send("Hello Next Level Developers!");
});

app.use("/api/v1", router);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

export default app;