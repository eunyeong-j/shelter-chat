declare module "global-types" {
  export type UserType = {
    id?: number;
    name: string;
    image: string;
    isOnline: boolean;
    bgColor: string;
    createdAt: Date;
    deletedAt?: Date | null;
    accessRequest?: {
      id?: number;
      name: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
      createdAt: Date;
    };
    isAdmin: "Y" | "N";
  };

  export type AccessRequest = {
    id: number;
    name: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
  };

  export type Message = {
    id?: number;
    isMine: "Y" | "N";
    message: string;
    imageFile?: string; // base64
    createdAt: Date;
    // for UI data
    messageId?: number;
    type?: "DATE" | "MSG" | "LOG";
    reactions?: string; // type:count:isMine,type:count:isMine,type:count:isMine ...
    isContinue?: "Y" | "N";
  };

  export interface UserMessage extends Message, UserType {}
}
