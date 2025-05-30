export type User = {
  id?: number;
  name: string;
  image: string;
  isOnline: boolean;
  bgColor: string;
  createdAt: Date;
  deletedAt?: Date | null;
};

export type Message = {
  id?: number;
  userId: number;
  message: string;
  createdAt: Date;
  // for UI data
  messageId?: number;
  isLog?: "Y" | "N";
};

export interface UserMessage extends Message, User {}
