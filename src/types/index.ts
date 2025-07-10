export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  editsUsed: number;
  maxEdits: number;
  createdAt: Date;
}

export interface PDFDocument {
  id: string;
  name: string;
  file: File;
  lastModified: Date;
  userId: string;
}

export interface EditSession {
  id: string;
  documentId: string;
  userId: string;
  timestamp: Date;
  editType: 'text' | 'annotation' | 'image' | 'form';
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodEnd: Date;
  amount: number;
}