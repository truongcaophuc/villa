import { Request, Response, NextFunction } from "express";
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || 500;
  const code = err.code || "internal_error";
  const message = err.message || "Internal Server Error";
  res.status(status).json({ code, message });
}