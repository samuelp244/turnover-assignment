export interface zodCustomError {
  for: string | number | undefined;
  message: string;
};

export type SentMessageInfo = any;

export interface userDateType {
  id: number;
  createdAt: Date;
  email: string;
  name: string;
  password: string;
  isEmailVerified: boolean;
}