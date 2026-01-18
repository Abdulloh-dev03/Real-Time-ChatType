import type { IUser } from "./user.js";

declare module "express" {
  interface Request {
    user?: IUser;
  }
}
