# Project Status — Limkokwing Student Portal

## Routing ✅ COMPLETED
- [x] Update `main.tsx` — Move all routing logic from App.tsx to main.tsx using createBrowserRouter
- [x] Fix Route Paths — Add trailing "*" to parent routes that have child routes
- [x] Simplify `App.tsx` — Remove routing logic and make it a simple component

## User Flow Implementation ✅ COMPLETED

### Flow 1: Exam Results Retrieval
- [x] Grades page with tabs (Overview, Course Grades, Transcript, Analytics, GPA Tracker)
- [x] Semester selector dropdown
- [x] GPA calculation display (cumulative & per-semester)
- [x] Academic standing indicator
- [x] Transcript download
- [x] Performance analytics charts

### Flow 2: Download Official Timetable
- [x] Program selection (Faculty, Programme, Year, Semester)
- [x] "Generate Timetable" button
- [x] Weekly grid view (Monday-Friday, 8am-5pm)
- [x] Color-coded by module type (Lecture/Lab/Tutorial)
- [x] Module name | Lecturer | Room number | Building
- [x] PDF download (via print)
- [x] Google Calendar integration
- [x] Apple Calendar (.ics file download)
- [x] Print support
- [x] "Notify me when ready" for unpublished timetables

### Flow 3: Check Fee Balance & Pay
- [x] Financial summary (Total Fees / Paid / Pending / Status)
- [x] Payment due alerts and overdue alerts
- [x] Make Payment tab with amount selection
- [x] Payment history
- [x] Financial aid applications
- [x] Budget tracker
- [x] Payment plan setup
- [x] Download fee statement

### Flow 4: Report a Campus Issue
- [x] Issue categories with dynamic subcategories
- [x] Building & room location fields
- [x] Photo/file attachment upload
- [x] Auto-generated ticket numbers (#CATEGORY-YYYY-SEQ)
- [x] Success dialog with ticket number
- [x] Ticket conversation thread
- [x] Status tracking (Submitted → Reviewed → In Progress → Resolved)
- [x] Rating/satisfaction survey
- [x] Status & category filters

### Flow 5: Find a Lecturer's Office & Hours
- [x] Staff directory page with search
- [x] Department & Faculty filters
- [x] Staff profile cards (name, title, department, office, hours)
- [x] Detail dialog with full profile
- [x] Consultation hours table (day, time, type)
- [x] Copy email, view phone
- [x] Book appointment action
- [x] Send message action
- [x] Empty state with "Browse all" suggestion
- [x] Staff API service (staffService.ts)
- [x] TypeScript types (StaffMember, StaffFilters, AppointmentRequest)

### Flow 6: Navigation Map (Mobile Priority)
- [x] Interactive SVG campus map
- [x] Building search by name/code
- [x] Building detail panel on click
- [x] Category-based map layers with toggle
- [x] Google Maps directions integration
- [x] Important Places quick list
- [x] Color-coded buildings by category
- [x] Mobile-first responsive layout
- [x] Campus map API service (campusMapService.ts)
- [x] TypeScript types (CampusBuilding, CampusMapLayer, NavigationRoute)

## Documentation ✅ COMPLETED
- [x] User flows documentation (`docs/user-flows.md`)
- [x] Database schema (`docs/database-schema.md`)

## Additional
- [x] Added Staff Directory and Campus Map to sidebar navigation
- [x] Added new routes to main.tsx
- [x] Updated Header page title mapping
- [x] Support categories enhanced with subcategories matching user flow
- [x] Support ticket creation with building/room location
- [x] Photo upload for support tickets
