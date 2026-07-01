import { Request, Response, NextFunction } from "express";
import client from "prom-client";

// Khởi tạo Registry và kích hoạt thu thập metrics mặc định của Node.js
export const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Tạo metrics đo thời gian phản hồi HTTP
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

// Tạo metrics đếm tổng số HTTP requests
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    
    // Lấy thông tin route, nếu không có (ví dụ 404) thì dùng req.path
    const route = req.route ? req.route.path : req.path;
    
    const labels = {
      method: req.method,
      route: route || req.path,
      status_code: res.statusCode.toString(),
    };

    httpRequestDurationMicroseconds.observe(labels, durationInSeconds);
    httpRequestsTotal.inc(labels);
  });

  next();
};
