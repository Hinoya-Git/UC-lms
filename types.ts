
export interface Student {
  id: string;
  name: string;
  email: string;
  major: string;
  year: number;
  gpa: number;
  avatar: string;
  bio?: string;
  birthdate?: string;
  isOnline?: boolean;
}

export interface Instructor {
  name: string;
  email: string;
  bio: string;
  photo: string;
}

export interface Assignment {
  id: string;
  title: string;
  status: 'missed' | 'near-due' | 'submitted' | 'none';
  score?: number; // percentage
  dueDate: string;
  type: 'text' | 'file' | 'quiz';
  submissionDate?: string;
  content?: string;
}

export interface Module {
  id: string;
  title: string;
  content: string;
}

export interface CourseBlock {
  id: string;
  section: string;
  schedule: string;
  instructor: string;
  capacity: number;
  enrolled: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  room: string;
  description: string;
  pricePerUnit: number;
  blocks: CourseBlock[];
  detailedInstructor?: Instructor;
  modules?: Module[];
  assignments?: Assignment[];
  meetUrl?: string;
}

export interface EnrollmentEntry {
  courseId: string;
  blockId: string;
}

export interface GateTap {
  id: string;
  location: string;
  timestamp: string;
  status: 'In' | 'Out';
}

export interface ClassroomActivity {
  type: 'class' | 'event';
  name: string;
  instructor?: string;
  timeRange: string;
}

export interface Classroom {
  id: string;
  roomNumber: string;
  building: string;
  status: 'Available' | 'In Use' | 'Cleaning';
  currentActivity?: ClassroomActivity;
  nextClass?: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  type: 'Academic' | 'Social' | 'Holiday';
  description: string;
}

export interface AssignmentSubmission {
  id: string;
  timestamp: string;
  tool: 'image' | 'video' | 'audio';
  analysis: string;
  studentNotes: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'event' | 'suspension' | 'system';
  timestamp: string;
  read: boolean;
}

export type View = 'dashboard' | 'courses' | 'enrollment' | 'campus' | 'ai-helper' | 'profile' | 'calendar' | 'course-detail' | 'enrollment-wizard' | 'payment' | 'course-dashboard';
export type CourseSubView = 'home' | 'modules' | 'assignments' | 'grades' | 'meet';
