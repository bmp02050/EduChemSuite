import {BaseModel} from "./BaseModel";

export interface MessageModel extends BaseModel {
  senderId: string;
  recipientId: string;
  conversationId: string;
  parentMessageId?: string;
  subject: string;
  body: string;
  isRead: boolean;
  readAt?: Date;
  senderName?: string;
  senderAccountType?: string;
  recipientName?: string;
  recipientAccountType?: string;
  replies?: MessageModel[];
}
