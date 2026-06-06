// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: PaginationInfo;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// User and Authentication Types
export interface User {
  _id: string;
  email: string;
  role: 'student' | 'admin' | 'staff';
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    profilePicture?: string;
  };
  contactInfo: {
    phone: string;
    alternatePhone?: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  academicInfo: {
    studentId: string;
    program: string;
    department: string;
    faculty: string;
    level: string;
    admissionDate: string;
    expectedGraduationDate: string;
    currentSemester: string;
    academicYear: string;
    gpa: number;
    totalCredits: number;
    completedCredits: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Course Types
export interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  description: string;
  academicInfo: {
    department: string;
    faculty: string;
    level: 'undergraduate' | 'graduate' | 'postgraduate';
    credits: number;
    prerequisites: string[];
    corequisites: string[];
  };
  courseContent: {
    learningOutcomes: string[];
    syllabus: string;
    textbooks: Array<{
      title: string;
      author: string;
      isbn?: string;
      edition?: string;
      required: boolean;
    }>;
  };
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  schedule: Array<{
    day: string;
    startTime: string;
    endTime: string;
    location: {
      building: string;
      room: string;
      campus: string;
    };
  }>;
  semester: 'fall' | 'spring' | 'summer';
  academicYear: string;
  maxEnrollment: number;
  currentEnrollment: number;
  status: 'active' | 'inactive' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  _id: string;
  student: string;
  course: Course;
  semester: string;
  academicYear: string;
  status: 'enrolled' | 'dropped' | 'completed' | 'waitlisted';
  enrollmentDate: string;
  completionDate?: string;
  grade?: {
    letterGrade: string;
    gradePoints: number;
    percentage: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Grade Types
export interface Grade {
  _id: string;
  student: string;
  course: Course;
  semester: string;
  academicYear: string;
  assessments: Array<{
    name: string;
    type: 'assignment' | 'quiz' | 'midterm' | 'final' | 'project' | 'participation';
    maxPoints: number;
    earnedPoints: number;
    weight: number;
    date: string;
    feedback?: string;
  }>;
  finalGrade: {
    letterGrade: string;
    gradePoints: number;
    percentage: number;
  };
  gpa: number;
  status: 'in_progress' | 'completed' | 'incomplete';
  createdAt: string;
  updatedAt: string;
}

export interface Transcript {
  _id: string;
  student: string;
  academicYear: string;
  semester: string;
  courses: Array<{
    course: Course;
    grade: string;
    gradePoints: number;
    credits: number;
  }>;
  semesterGPA: number;
  cumulativeGPA: number;
  totalCredits: number;
  completedCredits: number;
  status: 'official' | 'unofficial';
  generatedAt: string;
}

// Payment Types
export interface Payment {
  _id: string;
  student: string;
  paymentType: 'tuition' | 'accommodation' | 'library' | 'laboratory' | 'examination' | 'registration' | 'other';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'remita' | 'bank_transfer' | 'cash' | 'card' | 'other';
  semester: string;
  academicYear: string;
  description: string;
  dueDate: string;
  paidDate?: string;
  remitaDetails?: {
    rrr: string;
    transactionId: string;
    orderId: string;
    paymentReference: string;
  };
  receiptNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Schedule Types
export interface ScheduleItem {
  _id: string;
  course: Course;
  type: 'lecture' | 'lab' | 'tutorial' | 'seminar' | 'exam';
  day: string;
  startTime: string;
  endTime: string;
  location: {
    building: string;
    room: string;
    campus: string;
  };
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  recurring: boolean;
  date?: string;
  notes?: string;
}

// Notification Types
export interface Notification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  category: 'academic' | 'payment' | 'system' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface DashboardStats {
  academic: {
    currentGPA: number;
    totalCredits: number;
    completedCredits: number;
    remainingCredits: number;
    currentCourses: number;
    completedCourses: number;
  };
  financial: {
    totalFees: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
  };
  attendance: {
    overallRate: number;
    presentDays: number;
    absentDays: number;
    totalDays: number;
  };
}

// Filter Types
export interface CourseFilters {
  department?: string;
  level?: string;
  semester?: string;
  academicYear?: string;
  status?: string;
  instructor?: string;
  search?: string;
}

export interface GradeFilters {
  semester?: string;
  academicYear?: string;
  course?: string;
  status?: string;
  search?: string;
}

export interface PaymentFilters {
  paymentType?: string;
  status?: string;
  semester?: string;
  academicYear?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

// Staff Directory Types
export interface StaffMember {
  _id: string;
  employeeId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    phone?: string;
    profilePicture?: string;
  };
  professionalInfo: {
    title: string;
    department: string;
    faculty: string;
    officeLocation: {
      building: string;
      room: string;
      campus: string;
    };
    consultationHours: Array<{
      day: string;
      startTime: string;
      endTime: string;
      location?: string;
      type: 'in_person' | 'virtual' | 'both';
    }>;
    biography?: string;
    specializations: string[];
    coursesTeaching: string[];
  };
  status: 'active' | 'on_leave' | 'retired';
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffFilters {
  department?: string;
  faculty?: string;
  title?: string;
  search?: string;
  status?: string;
}

export interface AppointmentRequest {
  _id: string;
  student: string;
  staff: string;
  scheduledAt: string;
  duration: number;
  type: 'in_person' | 'virtual' | 'phone';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  agenda?: string[];
  meetingLink?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Campus Map Types
export interface CampusBuilding {
  _id: string;
  name: string;
  code: string;
  description?: string;
  category: 'academic' | 'administrative' | 'library' | 'cafeteria' | 'parking' | 'residential' | 'sports' | 'health' | 'other';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  floors: number;
  rooms: Array<{
    _id: string;
    name: string;
    floor: number;
    type: 'classroom' | 'lab' | 'office' | 'meeting_room' | 'auditorium' | 'library' | 'cafeteria' | 'restroom' | 'other';
    capacity?: number;
    equipment?: string[];
  }>;
  facilities: string[];
  images: string[];
  isAccessible: boolean;
  openingHours?: {
    monday?: { open: string; close: string; closed: boolean };
    tuesday?: { open: string; close: string; closed: boolean };
    wednesday?: { open: string; close: string; closed: boolean };
    thursday?: { open: string; close: string; closed: boolean };
    friday?: { open: string; close: string; closed: boolean };
    saturday?: { open: string; close: string; closed: boolean };
    sunday?: { open: string; close: string; closed: boolean };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CampusMapLayer {
  id: string;
  name: string;
  description: string;
  buildings: string[]; // Building IDs
  color: string;
  icon?: string;
  visible: boolean;
}

export interface NavigationRoute {
  from: { latitude: number; longitude: number; name: string };
  to: { latitude: number; longitude: number; name: string };
  distance: number; // meters
  duration: number; // seconds
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
    maneuver?: string;
  }>;
}
