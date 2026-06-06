# Database Schema — Limkokwing Student Portal

## 1. Core System Tables

### Users
```sql
CREATE TABLE users (
  _id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  role           ENUM('student','staff','admin','superadmin') NOT NULL DEFAULT 'student',
  status         ENUM('active','inactive','suspended','graduated') NOT NULL DEFAULT 'active',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Students
```sql
CREATE TABLE students (
  _id                    UUID PRIMARY KEY REFERENCES users(_id),
  student_id             VARCHAR(20) UNIQUE NOT NULL,
  first_name             VARCHAR(100) NOT NULL,
  last_name              VARCHAR(100) NOT NULL,
  middle_name            VARCHAR(100),
  date_of_birth          DATE,
  gender                 ENUM('male','female','other'),
  nationality            VARCHAR(100),
  profile_picture_url    TEXT,
  phone                  VARCHAR(20),
  alternate_phone        VARCHAR(20),
  address_street         TEXT,
  address_city           VARCHAR(100),
  address_state          VARCHAR(100),
  address_country        VARCHAR(100),
  address_postal_code    VARCHAR(20),
  emergency_name         VARCHAR(200),
  emergency_relationship VARCHAR(100),
  emergency_phone        VARCHAR(20),
  program_id             UUID REFERENCES programs(_id),
  department_id          UUID REFERENCES departments(_id),
  faculty_id             UUID REFERENCES faculties(_id),
  level                  VARCHAR(20),
  admission_date         DATE,
  expected_graduation    DATE,
  current_semester       VARCHAR(50),
  academic_year          VARCHAR(20),
  gpa                    DECIMAL(3,2) DEFAULT 0.00,
  total_credits          INT DEFAULT 0,
  completed_credits      INT DEFAULT 0,
  created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Staff / Lecturers
```sql
CREATE TABLE staff (
  _id              UUID PRIMARY KEY REFERENCES users(_id),
  employee_id      VARCHAR(20) UNIQUE NOT NULL,
  first_name       VARCHAR(100) NOT NULL,
  last_name        VARCHAR(100) NOT NULL,
  title            VARCHAR(100) NOT NULL,  -- Dr., Prof., Mr., Ms.
  department_id    UUID REFERENCES departments(_id),
  faculty_id       UUID REFERENCES faculties(_id),
  email            VARCHAR(255) NOT NULL,
  phone            VARCHAR(20),
  profile_picture_url TEXT,
  biography        TEXT,
  hire_date        DATE,
  status           ENUM('active','on_leave','retired') DEFAULT 'active',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff_office_locations (
  _id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id    UUID NOT NULL REFERENCES staff(_id),
  building_id UUID REFERENCES campus_buildings(_id),
  building    VARCHAR(200) NOT NULL,
  room        VARCHAR(50) NOT NULL,
  campus      VARCHAR(100) DEFAULT 'Main Campus',
  is_primary  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff_consultation_hours (
  _id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id    UUID NOT NULL REFERENCES staff(_id),
  day         ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  location    VARCHAR(200),
  type        ENUM('in_person','virtual','both') DEFAULT 'in_person',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff_specializations (
  _id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        UUID NOT NULL REFERENCES staff(_id),
  specialization  VARCHAR(200) NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2. Academic Structure

### Faculties
```sql
CREATE TABLE faculties (
  _id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(200) NOT NULL,
  code        VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Departments
```sql
CREATE TABLE departments (
  _id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id  UUID REFERENCES faculties(_id),
  name        VARCHAR(200) NOT NULL,
  code        VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Programs
```sql
CREATE TABLE programs (
  _id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(_id),
  faculty_id    UUID REFERENCES faculties(_id),
  name          VARCHAR(200) NOT NULL,
  code          VARCHAR(20) UNIQUE NOT NULL,
  duration      INT NOT NULL,  -- years
  total_credits INT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Courses
```sql
CREATE TABLE courses (
  _id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code        VARCHAR(20) UNIQUE NOT NULL,
  course_name        VARCHAR(200) NOT NULL,
  description        TEXT,
  credits            INT NOT NULL,
  department_id      UUID REFERENCES departments(_id),
  faculty_id         UUID REFERENCES faculties(_id),
  level              VARCHAR(20),
  semester           VARCHAR(50),
  academic_year      VARCHAR(20),
  max_enrollment     INT DEFAULT 50,
  status             ENUM('active','inactive','completed') DEFAULT 'active',
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_prerequisites (
  _id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id          UUID NOT NULL REFERENCES courses(_id),
  prerequisite_id    UUID NOT NULL REFERENCES courses(_id),
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Course Schedules
```sql
CREATE TABLE course_schedules (
  _id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(_id),
  day         ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  type        ENUM('lecture','lab','tutorial','seminar','exam') NOT NULL,
  building_id UUID REFERENCES campus_buildings(_id),
  building    VARCHAR(200) NOT NULL,
  room        VARCHAR(100) NOT NULL,
  campus      VARCHAR(100) DEFAULT 'Main Campus',
  staff_id    UUID REFERENCES staff(_id),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Enrollments
```sql
CREATE TABLE enrollments (
  _id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES students(_id),
  course_id      UUID NOT NULL REFERENCES courses(_id),
  semester       VARCHAR(50) NOT NULL,
  academic_year  VARCHAR(20) NOT NULL,
  status         ENUM('enrolled','dropped','completed','waitlisted') DEFAULT 'enrolled',
  enrolled_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at   TIMESTAMP,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id, semester, academic_year)
);
```

## 3. Grades & Assessments

### Assessments
```sql
CREATE TABLE assessments (
  _id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES courses(_id),
  name         VARCHAR(200) NOT NULL,
  type         ENUM('assignment','quiz','midterm','final','project','participation') NOT NULL,
  max_points   DECIMAL(8,2) NOT NULL,
  weight       DECIMAL(5,2) NOT NULL,  -- percentage weight of final grade
  date         DATE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Grades
```sql
CREATE TABLE grades (
  _id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES students(_id),
  course_id      UUID NOT NULL REFERENCES courses(_id),
  semester       VARCHAR(50) NOT NULL,
  academic_year  VARCHAR(20) NOT NULL,
  final_grade    ENUM('A','B+','B','C+','C','D','F','I','W') NOT NULL,
  grade_points   DECIMAL(3,2) NOT NULL,
  percentage     DECIMAL(5,2),
  status         ENUM('in_progress','completed','incomplete','withdrawn') DEFAULT 'in_progress',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id, semester, academic_year)
);

CREATE TABLE grade_assessments (
  _id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id       UUID NOT NULL REFERENCES grades(_id),
  assessment_id  UUID NOT NULL REFERENCES assessments(_id),
  earned_points  DECIMAL(8,2) NOT NULL,
  feedback       TEXT,
  graded_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### GPA Calculations
```sql
CREATE TABLE gpa_records (
  _id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL REFERENCES students(_id),
  semester          VARCHAR(50),
  academic_year     VARCHAR(20),
  semester_gpa      DECIMAL(3,2),
  cumulative_gpa    DECIMAL(3,2) NOT NULL,
  semester_credits  INT DEFAULT 0,
  total_credits     INT DEFAULT 0,
  semester_qp       DECIMAL(10,2) DEFAULT 0,
  total_qp          DECIMAL(10,2) DEFAULT 0,
  calculated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. Payments & Finance

### Payment Items (Fee Structure)
```sql
CREATE TABLE payment_items (
  _id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES students(_id),
  type             ENUM('tuition','accommodation','library','laboratory','examination','registration','late_fee','other') NOT NULL,
  description      TEXT NOT NULL,
  amount           DECIMAL(12,2) NOT NULL,
  currency         VARCHAR(3) DEFAULT 'SZL',
  due_date         DATE NOT NULL,
  semester         VARCHAR(50),
  academic_year    VARCHAR(20),
  status           ENUM('pending','paid','overdue','waived','partial') DEFAULT 'pending',
  paid_amount      DECIMAL(12,2) DEFAULT 0,
  remaining_amount DECIMAL(12,2) DEFAULT 0,
  category         ENUM('mandatory','optional') DEFAULT 'mandatory',
  priority         ENUM('high','medium','low') DEFAULT 'medium',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Payments
```sql
CREATE TABLE payments (
  _id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id         UUID NOT NULL REFERENCES students(_id),
  total_amount       DECIMAL(12,2) NOT NULL,
  paid_amount        DECIMAL(12,2) NOT NULL,
  currency           VARCHAR(3) DEFAULT 'SZL',
  payment_method     ENUM('card','bank_transfer','momo','cash','remita','paystack','flutterwave') NOT NULL,
  payment_reference  VARCHAR(100) UNIQUE NOT NULL,
  transaction_id     VARCHAR(100),
  status             ENUM('pending','processing','completed','failed','cancelled','refunded') DEFAULT 'pending',
  payment_date       TIMESTAMP,
  receipt_number     VARCHAR(50),
  receipt_url        TEXT,
  gateway            VARCHAR(50),
  gateway_reference  VARCHAR(100),
  gateway_response   JSONB,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_allocations (
  _id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id       UUID NOT NULL REFERENCES payments(_id),
  payment_item_id  UUID NOT NULL REFERENCES payment_items(_id),
  amount           DECIMAL(12,2) NOT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Payment Plans
```sql
CREATE TABLE payment_plans (
  _id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES students(_id),
  total_amount    DECIMAL(12,2) NOT NULL,
  setup_fee       DECIMAL(12,2) DEFAULT 0,
  interest_rate   DECIMAL(5,2) DEFAULT 0,
  status          ENUM('active','completed','defaulted','cancelled') DEFAULT 'active',
  semester        VARCHAR(50),
  academic_year   VARCHAR(20),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plan_installments (
  _id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id           UUID NOT NULL REFERENCES payment_plans(_id),
  installment_no    INT NOT NULL,
  amount            DECIMAL(12,2) NOT NULL,
  due_date          DATE NOT NULL,
  status            ENUM('pending','paid','overdue') DEFAULT 'pending',
  paid_date         DATE,
  payment_id        UUID REFERENCES payments(_id),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5. Support / Issue Tracking

### Support Tickets
```sql
CREATE TABLE support_tickets (
  _id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number   VARCHAR(30) UNIQUE NOT NULL,  -- e.g., IT-2025-1234
  student_id      UUID NOT NULL REFERENCES students(_id),
  title           VARCHAR(200) NOT NULL,
  description     TEXT NOT NULL,
  category        ENUM('facilities','it','academic','administrative','safety','general') NOT NULL,
  sub_category    VARCHAR(100),
  priority        ENUM('low','medium','high','urgent') DEFAULT 'medium',
  status          ENUM('open','in_progress','resolved','closed','escalated') DEFAULT 'open',
  building_id     UUID REFERENCES campus_buildings(_id),
  building_name   VARCHAR(200),
  room_number     VARCHAR(100),
  assigned_to     UUID REFERENCES staff(_id),
  resolution_summary TEXT,
  resolved_by     UUID REFERENCES staff(_id),
  resolved_at     TIMESTAMP,
  satisfaction    INT,  -- 1-5 rating
  feedback        TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_messages (
  _id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES support_tickets(_id),
  sender_id   UUID NOT NULL REFERENCES users(_id),
  sender_role ENUM('student','staff','admin') NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_attachments (
  _id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id      UUID REFERENCES support_tickets(_id),
  message_id     UUID REFERENCES ticket_messages(_id),
  filename       VARCHAR(255) NOT NULL,
  original_name  VARCHAR(255) NOT NULL,
  mime_type      VARCHAR(100),
  size           INT,
  url            TEXT NOT NULL,
  uploaded_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 6. Campus Map

### Campus Buildings
```sql
CREATE TABLE campus_buildings (
  _id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(200) NOT NULL,
  code          VARCHAR(20) UNIQUE NOT NULL,
  description   TEXT,
  category      ENUM('academic','administrative','library','cafeteria','parking','residential','sports','health','other') NOT NULL,
  latitude      DECIMAL(10,7),
  longitude     DECIMAL(10,7),
  address       TEXT,
  floors        INT DEFAULT 1,
  facilities    TEXT[],  -- array of facility names
  images        TEXT[],  -- array of image URLs
  is_accessible BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE building_rooms (
  _id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id   UUID NOT NULL REFERENCES campus_buildings(_id),
  name          VARCHAR(100) NOT NULL,
  floor         INT NOT NULL,
  type          ENUM('classroom','lab','office','meeting_room','auditorium','library','cafeteria','restroom','other') NOT NULL,
  capacity      INT,
  equipment     TEXT[],
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE building_opening_hours (
  _id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id  UUID NOT NULL REFERENCES campus_buildings(_id),
  day          ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  open_time    TIME,
  close_time   TIME,
  is_closed    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(building_id, day)
);

CREATE TABLE map_layers (
  _id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  color       VARCHAR(7) NOT NULL,  -- hex color
  icon        VARCHAR(50),
  sort_order  INT DEFAULT 0,
  is_visible  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE layer_buildings (
  _id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id     UUID NOT NULL REFERENCES map_layers(_id),
  building_id  UUID NOT NULL REFERENCES campus_buildings(_id),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(layer_id, building_id)
);
```

## 7. Appointments (Lecturer Booking)

### Appointments
```sql
CREATE TABLE appointments (
  _id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES students(_id),
  staff_id      UUID NOT NULL REFERENCES staff(_id),
  scheduled_at  TIMESTAMP NOT NULL,
  duration      INT NOT NULL,  -- minutes
  type          ENUM('in_person','virtual','phone') DEFAULT 'in_person',
  status        ENUM('pending','confirmed','completed','cancelled','rescheduled') DEFAULT 'pending',
  meeting_link  TEXT,
  location      VARCHAR(200),
  agenda        TEXT[],
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointment_notifications (
  _id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL REFERENCES appointments(_id),
  recipient_id    UUID NOT NULL REFERENCES users(_id),
  type            ENUM('confirmation','reminder','cancellation','reschedule') NOT NULL,
  channel         ENUM('email','sms','push') DEFAULT 'email',
  sent_at         TIMESTAMP,
  status          ENUM('pending','sent','failed') DEFAULT 'pending',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 8. Notifications

```sql
CREATE TABLE notifications (
  _id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES users(_id),
  title        VARCHAR(200) NOT NULL,
  message      TEXT NOT NULL,
  type         ENUM('info','success','warning','error','announcement') DEFAULT 'info',
  category     ENUM('academic','payment','system','general','support') DEFAULT 'general',
  priority     ENUM('low','medium','high','urgent') DEFAULT 'medium',
  is_read      BOOLEAN DEFAULT FALSE,
  action_url   TEXT,
  action_text  VARCHAR(100),
  expires_at   TIMESTAMP,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_preferences (
  _id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(_id) UNIQUE,
  email_alerts       BOOLEAN DEFAULT TRUE,
  sms_alerts         BOOLEAN DEFAULT FALSE,
  push_alerts        BOOLEAN DEFAULT TRUE,
  grade_updates      BOOLEAN DEFAULT TRUE,
  payment_reminders  BOOLEAN DEFAULT TRUE,
  ticket_updates     BOOLEAN DEFAULT TRUE,
  appointment_reminders BOOLEAN DEFAULT TRUE,
  announcements      BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

```sql
-- Students
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_program ON students(program_id);
CREATE INDEX idx_students_department ON students(department_id);

-- Staff
CREATE INDEX idx_staff_department ON staff(department_id);
CREATE INDEX idx_staff_faculty ON staff(faculty_id);
CREATE INDEX idx_staff_name ON staff(last_name, first_name);

-- Courses
CREATE INDEX idx_courses_code ON courses(course_code);
CREATE INDEX idx_courses_department ON courses(department_id);
CREATE INDEX idx_courses_semester ON courses(semester, academic_year);

-- Enrollments
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- Grades
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_course ON grades(course_id);
CREATE INDEX idx_grades_semester ON grades(semester, academic_year);

-- Payments
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference ON payments(payment_reference);

-- Tickets
CREATE INDEX idx_tickets_student ON support_tickets(student_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_category ON support_tickets(category);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_tickets_created ON support_tickets(created_at DESC);

-- Campus Map
CREATE INDEX idx_buildings_category ON campus_buildings(category);
CREATE INDEX idx_buildings_coords ON campus_buildings(latitude, longitude);

-- Appointments
CREATE INDEX idx_appointments_student ON appointments(student_id);
CREATE INDEX idx_appointments_staff ON appointments(staff_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Notifications
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_read ON notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```
