export interface IUser {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profilePic?: string;
  bio?: string;
  lastMessage?: Partial<IMessage> | null;
  createdAt: string;
  updatedAt: string;
  isOnline?: boolean;
  lastSeen?: string;
  isVerified?: boolean;
  unreadCount?: number;
}

export interface IMessage {
  _id: string;
  sender: IUser;
  receiver: IUser;
  text?: string;
  image?: string;
  tempId: string;
  status: string;
  deliveredAt?: string;
  readAt?: string;
  reactions: Array<{ userId: string; emoji: string }>;
  createdAt: string;
  updatedAt: string;
}
