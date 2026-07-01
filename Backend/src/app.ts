import express, { Request, Response } from "express";
import cors from "cors";
import route from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { metricsMiddleware, register } from "./middlewares/metrics.middleware";

const app = express();

// Áp dụng metrics middleware thu thập chỉ số request
app.use(metricsMiddleware);

app.use(express.json());
app.use(cors());

// Route để Prometheus scrape metrics
app.get("/metrics", async (_req: Request, res: Response) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

app.use("/api", route);

app.use("/", (_req: Request, res: Response) => {
  res.send("<b>WELCOME TO MY BACKEND WEBSITE!</b>");
});

// Error handling middleware
app.use(errorHandler);

export default app;
