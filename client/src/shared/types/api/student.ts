export interface ScheduleSlot {
  start: string; // HH:mm
  end: string;
}

export interface WeekdaySchedule {
  weekday: number; // 0-6 (0 = Sunday, 6 = Saturday)
  slots: ScheduleSlot[];
}

export interface StudentLocation {
  city: string;
  district?: string;
}

export interface BudgetRange {
  min: number;
  max: number;
}

export type StudentMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';

export interface StudentProfile {
  _id: string;
  parentId: string;
  userId?: string;
  // Basic fields
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  school?: string;
  grade?: string;
  specialNeeds?: string;
  // Enhanced fields
  subjectsNeeded?: Array<{ _id: string; name: string } | string>;
  gradeLevel?: string;
  learningGoals?: string;
  schedulePreferences?: WeekdaySchedule[];
  mode?: StudentMode;
  location?: StudentLocation;
  budgetRange?: BudgetRange;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentDto {
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  school?: string;
  grade?: string;
  specialNeeds?: string;
  subjectsNeeded?: string[];
  gradeLevel?: string;
  learningGoals?: string;
  schedulePreferences?: WeekdaySchedule[];
  mode?: StudentMode;
  location?: StudentLocation;
  budgetRange?: BudgetRange;
  notes?: string;
}

export type UpdateStudentDto = Partial<CreateStudentDto>;
