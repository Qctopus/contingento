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