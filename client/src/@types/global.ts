export type User = {
  id?: number;
  name: string;
  image: string;
  isOnline: boolean;
  bgColor: string;
};

export type Message = {
  id?: number;
  messageId?: number; // for UI
  userId: number;
  message: string;
  createdAt: Date;
};

export interface UserMessage extends Message, User {}
