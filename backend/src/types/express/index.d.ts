// src/types/express/index.d.ts
import { IUser } from "../user.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}
