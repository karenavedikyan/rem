import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";

import partnersRouter from "./routes/partners";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, service: "partners-api" });
  });

  app.use("/partners", partnersRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found." });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // eslint-disable-next-line no-console
    console.error("Unhandled API error:", error);
    res.status(500).json({ message: "Internal server error." });
  });

  return app;
};

if (require.main === module) {
  const port = Number(process.env.PORT) || 3001;
  const app = createApp();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Partners API is running on port ${port}`);
  });
}
