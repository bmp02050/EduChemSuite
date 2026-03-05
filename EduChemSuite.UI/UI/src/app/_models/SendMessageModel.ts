export interface SendMessageModel {
  recipientIds: string[];
  parentMessageId?: string;
  subject: string;
  body: string;
}
