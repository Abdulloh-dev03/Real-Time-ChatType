import "dotenv/config";

const allowedOrigins: string[] = [
  process.env.CLIENT_WEB,
  "http://localhost:5173",
].filter(Boolean) as string[];

export const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

export const socketCorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};
