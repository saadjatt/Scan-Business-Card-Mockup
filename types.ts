export interface ContactInfo {
  name: string;
  email: string;
  role: string;
  company: string;
  phone: string;
  rawData?: string;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
}

export interface ScanRecord {
  id: string;
  timestamp: number;
  contact: ContactInfo;
  emailDraft?: GeneratedEmail;
  imageUri?: string; // Store base64 thumbnail
  status: 'scanned' | 'drafted' | 'sent_manual' | 'sent_gmail';
}

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  accessToken: string;
}

export enum AppState {
  CAMERA = 'CAMERA',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW',
  HISTORY = 'HISTORY',
  HISTORY_DETAIL = 'HISTORY_DETAIL',
  SETTINGS = 'SETTINGS'
}

export interface AppSettings {
  autoSend: boolean;
  userName: string;
  userRole: string;
  userCompany: string;
  googleUser?: GoogleUser;
}