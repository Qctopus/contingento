// Common types used across the application

export interface FormData {
  [stepId: string]: {
    [fieldLabel: string]: any
  }
}

export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved?: Date
}

export interface ValidationError {
  field: string
  message: string
}

export interface StepProgress {
  stepId: string
  completed: boolean
  percentage: number
  answeredQuestions: number
  totalQuestions: number
}

export interface UserInteractionState {
  hasInteracted: boolean
  didMount: boolean
  lastInteraction?: Date
}

// Re-export existing types for convenience
export type { LocationData, PreFillData } from '../data/types'

// Anonymous User Management Types
export interface AnonymousSession {
  id: string;
  businessName?: string;
  pin?: string;
  email?: string; // Optional for recovery
  createdAt: Date;
  lastAccessed: Date;
  planData: any; // The actual BCP data
  isCloudSaved: boolean;
  shareableLink?: string;
  qrCode?: string;
}

export interface SaveOptions {
  saveToCloud: boolean;
  businessName?: string;
  pin?: string;
  email?: string;
  allowSharing: boolean;
}

export interface AccessAttempt {
  businessName: string;
  pin: string;
} 