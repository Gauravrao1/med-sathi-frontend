export interface User {
  id: string;
  phone: string;
  name?: string;
  ageBracket?: string;
  chronicConditions?: string[];
  preferredLanguage?: 'en' | 'hi';
  hasConsent?: boolean;
}

export interface Medicine {
  id: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  mrp: number;
  ceilingPrice: number;
}

export interface GenericAlternative {
  id: string;
  brandName: string;
  manufacturer: string;
  mrp: number;
}

export interface Batch {
  id: string;
  medicineId: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  isRecalled: boolean;
  recallReason?: string;
  recallSeverity?: 'Critical' | 'Warning';
}

export interface Recall {
  id: string;
  batchId: string;
  reason: string;
  severity: 'Critical' | 'Warning';
  alertDate: string;
}

export interface TrustScoreBreakdown {
  label: string;
  value: number;
  max: number;
  status: 'pass' | 'fail' | 'warning';
}

export interface TrustScoreResult {
  score: number;
  status: 'genuine' | 'inconclusive' | 'flagged';
  breakdown: TrustScoreBreakdown[];
}

export interface Scan {
  id: string;
  userId: string;
  medicineId: string;
  batchId: string;
  scanDate: string;
  trustScore: TrustScoreResult;
  medicine: Medicine;
  batch: Batch;
}

export interface AuthResponse {
  token: string;
  user: User;
}
