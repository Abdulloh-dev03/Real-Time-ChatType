// src/types/user.ts
import { Types } from "mongoose";

// src/types/user.ts
export interface IUser {
  _id: Types.ObjectId;
  email: string;
  isVerified: boolean;
  firstName: string;
  lastName: string;
  username: string;
  bio?: string | null; // allow null
  profilePic?: string | null; // allow null
  contacts: Types.ObjectId[];
  authProvider: "local" | "google";
  googleId?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}
