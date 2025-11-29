import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import pino from "pino";
import { createServer } from "http";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { postsRouter } from "./routes/posts";
import { categoriesRouter } from "./routes/categories";
import { tagsRouter } from "./routes/tags";
import { mediaRouter } from "./routes/media";
import { setupGraphQL } from "./graphql/server";
import { commentsRouter } from "./routes/comments";

const app = express();
const logger = pino();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/categories", categoriesRouter);
app.use("/tags", tagsRouter);
app.use("/media", mediaRouter);
app.use("/comments", commentsRouter);

setupGraphQL(app);

app.use(errorHandler);

const server = createServer(app);
server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "server_started");
});
