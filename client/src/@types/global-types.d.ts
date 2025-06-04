declare module "global-types" {
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
    imageFile?: string; // base64
    createdAt: Date;
    // for UI data
    messageId?: number;
    type?: "DATE" | "MSG" | "LOG";
    reactions?: string;
  };

  export interface UserMessage extends Message, User {}
}
