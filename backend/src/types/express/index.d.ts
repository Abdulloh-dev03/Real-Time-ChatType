// src/types/express/index.d.ts
import { IUser } from "../user";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}
