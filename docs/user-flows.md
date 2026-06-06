# User Flow Design — Limkokwing Student Portal

---

## Flow 1: Exam Results Retrieval

**Persona:** Thabo, 2nd year BSc IT student  
**Goal:** Get semester results and GPA

### Implementation Status: ✅ Complete

**Files:**
- `src/pages/grades/GradesPage.tsx` — Main grades page with tabs
- `src/components/Grades/GradeOverview.tsx` — GPA summary cards
- `src/components/Grades/CourseGrades.tsx` — Per-course grade breakdown
- `src/components/Grades/TranscriptView.tsx` — Full transcript
- `src/components/Grades/PerformanceAnalytics.tsx` — Charts & trends
- `src/components/Grades/GPATracker.tsx` — GPA history tracker
- `src/services/gradesService.ts` — API service layer

**User Flow:**
```
START: Student opens website
    ↓
Step 1: Clicks "My Grades" in sidebar nav
    ↓
Step 2: Log in (if not already authenticated via ProtectedRoute)
    ↓
Step 3: Select semester from dropdown
    ↓
Step 4: Dashboard shows:
    - Cumulative GPA | Current Semester GPA | Credits Earned | Academic Standing
    - Tabbed view: Overview, Course Grades, Transcript, Analytics, GPA Tracker
    - Course name | Grade | Credits | Status (Pass/Fail)
    ↓
Step 5: Can download unofficial transcript (PDF)
    ↓
END: Student knows their results and GPA
```

**Key Features:**
- Semester selector dropdown
- Real-time GPA calculation display
- Color-coded GPA (green ≥ 3.5, blue ≥ 3.0, orange ≥ 2.5, red < 2.5)
- Academic standing badges (Excellent/Good/Satisfactory/Probation)
- Transcript download button
- Performance analytics with charts
- GPA trend tracking over semesters

---

## Flow 2: Download Official Timetable

**Persona:** Lerato, 1st year Graphic Design student  
**Goal:** Get personalized weekly schedule

### Implementation Status: ✅ Complete

**Files:**
- `src/pages/schedule/SchedulePage.tsx` — Enhanced timetable page
- `src/components/Courses/CourseSchedule.tsx` — Weekly grid view

**User Flow:**
```
START: Student opens website (mobile phone)
    ↓
Step 1: Clicks "My Schedule" in sidebar
    ↓
Step 2: Select from dropdowns:
    - Faculty: [Faculty of Creative Arts]
    - Programme: [BA Graphic Design]
    - Year: [Year 1]
    - Semester: [Semester 2, 2025]
    ↓
Step 3: Clicks "Generate Timetable"
    ↓
Step 4: Views weekly grid showing:
    - Monday to Friday, 8am - 5pm
    - Module name | Lecturer | Room number | Building
    - Color-coded by module type (Lecture/Lab/Tutorial)
    ↓
Step 5: Can:
    - Download as PDF (print-based)
    - Add to Google Calendar (one-click)
    - Add to Apple Calendar (.ics download)
    - Print
    ↓
END: Student knows where to be and when
```

**Edge Cases:**
- If no timetable exists: Shows "Timetable for this programme will be published [Date]" with "Notify Me" button
- Mobile-responsive weekly grid

---

## Flow 3: Check Fee Balance & Pay

**Persona:** Musa, final year BCom student  
**Goal:** View outstanding balance and make payment

### Implementation Status: ✅ Complete

**Files:**
- `src/pages/payments/PaymentsPage.tsx` — Main payments page
- `src/components/Payments/PaymentOverview.tsx` — Financial summary
- `src/components/Payments/PaymentItems.tsx` — Fee breakdown
- `src/components/Payments/PaymentHistory.tsx` — Past payments
- `src/components/Payments/FinancialAid.tsx` — Aid applications
- `src/components/Payments/BudgetTracker.tsx` — Student budget tool
- `src/services/paymentsService.ts` — API service layer

**User Flow:**
```
START: Student clicks "Payments & Fees" from sidebar
    ↓
Step 1: Dashboard shows:
    - Current balance: R [amount]
    - Due date: [Date]
    - Payment deadline warning (if less than 7 days: red highlight)
    ↓
Step 2: Clicks "Make Payment" tab
    ↓
Step 3: Selects payment amount:
    - Full balance (default)
    - Partial amount (enter custom)
    ↓
Step 4: Chooses payment method:
    - Credit/Debit Card
    - Bank Transfer (shows banking details + reference number)
    - M-Pesa / Mobile Money
    ↓
Step 5: Confirms payment
    ↓
Step 6: Receives on-screen confirmation
    ↓
END: Balance updates within 24 hours
```

**Key Features:**
- Real-time financial summary (Total Fees / Amount Paid / Pending / Status)
- Payment due alerts (yellow) and overdue alerts (red)
- Multiple payment tabs: Overview, Make Payment, Payment History, Financial Aid, Budget Tracker
- Payment plan setup option
- Download fee statement
- Overdue amount highlighting

---

## Flow 4: Report a Campus Issue

**Persona:** Nonhlanhla, 3rd year student, broken printer  
**Goal:** Report problem and track resolution

### Implementation Status: ✅ Complete

**Files:**
- `src/pages/support/SupportPage.tsx` — Main support page
- `src/components/Support/SupportTickets.tsx` — Enhanced ticket system
- `src/services/supportService.ts` — API service layer

**User Flow:**
```
START: Student clicks "Help & Support" from sidebar
    ↓
Step 1: Clicks "New Ticket"
    ↓
Step 2: Fills in:
    - Title: Brief description
    - Category: Facilities / IT / Academic / Administrative / Safety & Security / General
    - Issue Type: (dynamic subcategories based on category)
      • Facilities → AC, Lights, Plumbing, Furniture, Cleaning
      • IT → WiFi, Printer, Computer, Projector, Software
      • Academic → Lecturer Issue, Timetable Conflict, Curriculum, Assessment
      • Administrative → Registration, Fee Dispute, Documents, Graduation
      • Safety → Theft, Harassment, Emergency, Lighting
    - Building: [Building dropdown]
    - Room Number: [Text input]
    - Description: [Detailed text]
    - Attachments: [Photo/file upload]
    - Priority: Low / Medium / High / Urgent
    ↓
Step 3: Clicks "Create Ticket"
    ↓
Step 4: Receives ticket number (e.g., #IT-2025-1234)
    ↓
Step 5: Tracks status from "My Reports":
    - Submitted → Reviewed → In Progress → Resolved
    - Each status change triggers email notification
    ↓
END: Student can follow up until resolved
```

**Key Features:**
- Category-specific subcategories (Issue Type)
- Building/room location fields
- File/photo attachments
- Auto-generated ticket numbers (#CATEGORY-YYYY-SEQ)
- Success dialog with ticket number
- Ticket conversation thread
- Rating/satisfaction survey on resolution
- Status filter and category filter

---

## Flow 5: Find a Lecturer's Office & Hours

**Persona:** Siphelele, struggling with Programming 101  
**Goal:** Locate lecturer and know when they're available

### Implementation Status: ✅ Complete

**Files:**
- `src/pages/staff/StaffDirectoryPage.tsx` — Staff directory page
- `src/services/staffService.ts` — API service layer
- `src/types/index.ts` — StaffMember, StaffFilters, AppointmentRequest types

**User Flow:**
```
START: Student searches or clicks "Staff Directory" in sidebar
    ↓
Step 1: Uses search bar or filters by Department / Faculty
    ↓
Step 2: Views staff profile grid cards showing:
    - Name + Title
    - Department
    - Office location: "Building B, Room 214"
    - Consultation hours summary
    - Specializations (tags)
    ↓
Step 3: Clicks card to open detail dialog:
    - Full profile with photo
    - Biography
    - Office location with building/room
    - Email (click to copy)
    - Phone
    - Consultation hours table (day-by-day with type chip)
    ↓
Step 4: Can:
    - Book appointment (one-click action)
    - Send message through portal
    - Add consultation hours to calendar
    ↓
END: Student knows exactly where to go and when
```

**Edge Cases:**
- If lecturer not found: Shows "No results found" with suggestion to check spelling or browse by department
- Empty state shows "Browse all staff" button
- Avatar colors generated from name hash

---

## Flow 6: Navigation Map (Mobile Priority)

**Persona:** First day freshman, can't find registration office  
**Goal:** Navigate campus without asking strangers

### Implementation Status: ✅ Complete

**Files:**
- `src/pages/campusmap/CampusMapPage.tsx` — Interactive campus map
- `src/services/campusMapService.ts` — API service layer
- `src/types/index.ts` — CampusBuilding, CampusMapLayer, NavigationRoute types

**User Flow:**
```
START: Student clicks "Campus Map" from sidebar (or mobile menu)
    ↓
Step 1: Sees interactive SVG campus map
    ↓
Step 2: Can:
    - Search building by name
    - Click building to see details (name, description, facilities)
    - Click "Get Directions" (opens Google Maps)
    - Toggle map layers (Academic, Admin, Library, Cafeteria, Parking, Sports, Health)
    - View "My Location" (visual grid reference)
    ↓
Step 3: Map shows buildings color-coded by category:
    - Blue: Academic buildings
    - Orange: Administrative offices
    - Green: Library
    - Purple: Sports
    - Grey: Parking
    - Red: Health
    ↓
Step 4: "Important Places for New Students" quick list:
    - Registration Office → Admin Block, Ground Floor
    - IT Help Desk → Library, Room 101
    - Financial Aid → Admin Block, 2nd Floor
    - Student Affairs → Admin Block, 1st Floor
    - Library → Library & Resource Centre
    - Clinic → Health & Wellness Centre
    ↓
END: Student finds any location on campus in under 1 minute
```

**Key Features:**
- Interactive SVG map with building markers
- Search by building name or code
- Category-based map layers with toggle
- Building detail panel on click
- Google Maps directions integration
- Important Places quick reference list
- Mobile-first responsive layout
- Visual grid with paths and walkways

---

## Summary

| Flow | Feature | Status | Page Route | Key Files |
|------|---------|--------|------------|-----------|
| 1 | Exam Results & GPA | ✅ Complete | `/grades` | `GradesPage.tsx`, `gradesService.ts` |
| 2 | Timetable Generation | ✅ Complete | `/schedule` | `SchedulePage.tsx`, `CourseSchedule.tsx` |
| 3 | Fee Balance & Pay | ✅ Complete | `/payments` | `PaymentsPage.tsx`, `paymentsService.ts` |
| 4 | Report Campus Issue | ✅ Complete | `/support` | `SupportTickets.tsx`, `supportService.ts` |
| 5 | Lecturer Directory | ✅ Complete | `/staff` | `StaffDirectoryPage.tsx`, `staffService.ts` |
| 6 | Campus Map | ✅ Complete | `/campus-map` | `CampusMapPage.tsx`, `campusMapService.ts` |
