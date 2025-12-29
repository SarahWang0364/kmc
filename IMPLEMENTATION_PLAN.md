# KMC Implementation Plan - Phases 2-9

**Phase 1 Status:** ✅ COMPLETE - Authentication & Foundation Ready

---

## Phase 2: Core Data Models

**Estimated Time:** 1-2 weeks
**Priority:** Critical
**Status:** Pending

### 2.1 Database Models

#### Term Model
**File:** `backend/models/Term.js`

```javascript
{
  name: String,              // "25T1" or "25H1"
  type: String,              // "school_term" | "holiday"
  startDate: Date,
  weeks: Number,             // 10 for school, 3 for holiday
  isFirstTermOfYear: Boolean,
  isCurrent: Boolean,
  createdBy: UserId,
  timestamps: true
}
```

**Business Logic:**
- Only one term can be `isCurrent` at a time
- When activated with `isFirstTermOfYear=true`, trigger year increment
- Validate weeks: 10 for school_term, 3 for holiday

**Indexes:**
```javascript
{ isCurrent: 1 }
{ startDate: -1 }
```

---

#### Topic Model
**File:** `backend/models/Topic.js`

```javascript
{
  name: String,
  content: String,           // Text content
  year: String,              // Y6-Y12, Y12 3U, Y12 4U
  term: String,              // T1-T4 (filter only, not tied to actual term)
  createdBy: UserId,
  timestamps: true
}
```

**Indexes:**
```javascript
{ year: 1, term: 1 }
```

---

#### Test Model
**File:** `backend/models/Test.js`

```javascript
{
  name: String,              // "Y8 Test1" format
  year: String,
  term: String,              // T1-T4 (filter only)
  createdBy: UserId,
  timestamps: true
}
```

**Indexes:**
```javascript
{ year: 1, term: 1 }
```

---

#### Progress Model
**File:** `backend/models/Progress.js`

```javascript
{
  name: String,              // "Year 8 general class"
  term: TermId,
  year: String,              // Y6-Y12
  weeklyContent: [{
    week: Number,
    topics: [TopicId],
    test: TestId,
    comments: String
  }],
  timestamps: true
}
```

**Populate:** topics, test, term

**Indexes:**
```javascript
{ term: 1, year: 1 }
```

---

#### Classroom Model
**File:** `backend/models/Classroom.js`

```javascript
{
  name: String,
  capacity: Number,
  isActive: Boolean,
  timestamps: true
}
```

**Indexes:**
```javascript
{ isActive: 1 }
```

---

#### Class Model ⭐ MOST CRITICAL
**File:** `backend/models/Class.js`

```javascript
{
  name: String,              // Auto: "Sarah Y8 Fri 7pm-9pm"
  year: String,
  teacher: UserId,
  classroom: ClassroomId,
  term: TermId,
  progress: ProgressId,
  schedule: [{
    dayOfWeek: Number,       // 0-6 (0=Sunday)
    startTime: String,       // "19:00"
    duration: Number         // minutes
  }],
  students: [{
    student: UserId,
    schoolTestResults: String,
    joinedWeek: Number
  }],
  weeklyData: [{
    week: Number,
    classNotes: [{
      filename: String,
      fileId: GridFSId,       // Reference to GridFS file
      uploadedAt: Date,
      uploadedBy: UserId
    }],
    attendance: [{
      student: UserId,
      status: String         // "arrived" | "absent"
    }],
    homework: [{
      student: UserId,
      grade: String,         // A, B, C, D, E, incomplete, missing, absent
      comments: String
    }],
    test: {
      test: TestId,
      marks: [{
        student: UserId,
        mark: Number
      }]
    }
  }],
  copyToNextTerm: Boolean,   // Only for school terms
  isActive: Boolean,
  timestamps: true
}
```

**Business Logic:**
- Auto-generate name: `{teacher.name} {year} {day} {time}`
- Validate schedule doesn't overlap in same classroom
- Initialize weeklyData array with {term.weeks} entries when created
- Validate: school terms can only have 1 weekday, holidays max 3 weekdays

**Populate:** teacher, classroom, term, progress, students.student, weeklyData.test

**Indexes:**
```javascript
{ term: 1, teacher: 1 }
{ term: 1, isActive: 1 }
{ "students.student": 1 }
{ "schedule.dayOfWeek": 1, "schedule.startTime": 1, classroom: 1 }
```

---

#### Detention Model
**File:** `backend/models/Detention.js`

```javascript
{
  class: ClassId,
  student: UserId,
  week: Number,
  reason: String,
  status: String,            // "assigned" | "booked" | "completed"
  bookedSlot: DetentionSlotId,
  completionStatus: String,  // "complete" | "incomplete" | "absent"
  attempts: Number,
  assignedBy: UserId,
  assignedAt: Date,
  timestamps: true
}
```

**Indexes:**
```javascript
{ student: 1, status: 1 }
{ status: 1, assignedAt: -1 }
{ bookedSlot: 1 }
```

---

#### DetentionSlot Model
**File:** `backend/models/DetentionSlot.js`

```javascript
{
  date: Date,
  startTime: String,
  endTime: String,
  classroom: ClassroomId,
  capacity: Number,          // From classroom capacity
  bookedCount: Number,
  createdBy: UserId,
  timestamps: true
}
```

**Indexes:**
```javascript
{ date: 1, classroom: 1 }
{ date: 1, bookedCount: 1 }  // For finding available slots
```

---

#### Followup Model
**File:** `backend/models/Followup.js`

```javascript
{
  issue: String,
  solution: String,
  dueDate: Date,
  isCompleted: Boolean,
  completedAt: Date,
  createdBy: UserId,
  timestamps: true
}
```

**Indexes:**
```javascript
{ isCompleted: 1, dueDate: 1 }
{ createdBy: 1 }
```

---

### 2.2 Controllers & Routes

For each model above, create:

1. **Controller File:** `backend/controllers/{model}Controller.js`
   - `getAll(req, res)` - List with pagination, filters
   - `getById(req, res)` - Single resource
   - `create(req, res)` - Create new
   - `update(req, res)` - Update existing
   - `delete(req, res)` - Delete resource

2. **Route File:** `backend/routes/{model}Routes.js`
   - GET `/api/{model}` - List all (with query filters)
   - GET `/api/{model}/:id` - Get one
   - POST `/api/{model}` - Create (requireAdmin or requireTeacher)
   - PUT `/api/{model}/:id` - Update
   - DELETE `/api/{model}/:id` - Delete (requireAdmin)

3. **Register in server.js:**
   ```javascript
   app.use('/api/terms', require('./routes/termRoutes'));
   app.use('/api/topics', require('./routes/topicRoutes'));
   // ... etc for all models
   ```

---

### 2.3 Special Class Controller Methods

**File:** `backend/controllers/classController.js`

Additional methods beyond CRUD:

```javascript
// Mark attendance for a week
exports.markAttendance = async (req, res) => {
  const { classId, week, attendanceData } = req.body;
  // attendanceData: [{ student: userId, status: "arrived"|"absent" }]
  // Update class.weeklyData[week].attendance
};

// Grade homework for a week
exports.gradeHomework = async (req, res) => {
  const { classId, week, homeworkData } = req.body;
  // homeworkData: [{ student: userId, grade: "A", comments: "..." }]
  // Update class.weeklyData[week].homework
};

// Upload class notes
exports.uploadClassNotes = async (req, res) => {
  const { classId, week } = req.body;
  const files = req.files; // From multer
  // Save to GridFS, update class.weeklyData[week].classNotes
};

// Download class notes
exports.downloadClassNotes = async (req, res) => {
  const { fileId } = req.params;
  // Stream file from GridFS
};

// Enter test marks
exports.enterTestMarks = async (req, res) => {
  const { classId, week, testId, marks } = req.body;
  // marks: [{ student: userId, mark: 85 }]
  // Update class.weeklyData[week].test
};

// Switch student to another class (same week, same progress)
exports.switchStudent = async (req, res) => {
  const { studentId, fromClassId, toClassId, week } = req.body;
  // Validate: same progress, same week, time > now
  // Remove from fromClass, add to toClass
  // Log in OperationLog
};
```

---

### 2.4 File Upload Setup

#### Install Multer
```bash
cd backend
npm install multer
```

#### Upload Middleware
**File:** `backend/middleware/uploadMiddleware.js`

```javascript
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (we'll use GridFS)
const storage = multer.memoryStorage();

// File filter - only PDF, DOC, DOCX
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = upload;
```

#### GridFS Helper
**File:** `backend/utils/gridfs.js`

```javascript
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let bucket;

const initGridFS = () => {
  const db = mongoose.connection.db;
  bucket = new GridFSBucket(db, {
    bucketName: 'classNotes'
  });
  return bucket;
};

const uploadFile = (buffer, filename, metadata) => {
  return new Promise((resolve, reject) => {
    if (!bucket) initGridFS();

    const uploadStream = bucket.openUploadStream(filename, {
      metadata
    });

    uploadStream.on('finish', () => {
      resolve(uploadStream.id);
    });

    uploadStream.on('error', reject);

    uploadStream.end(buffer);
  });
};

const downloadFile = (fileId) => {
  if (!bucket) initGridFS();
  return bucket.openDownloadStream(fileId);
};

const deleteFile = async (fileId) => {
  if (!bucket) initGridFS();
  await bucket.delete(fileId);
};

module.exports = {
  initGridFS,
  uploadFile,
  downloadFile,
  deleteFile
};
```

**Initialize in server.js:**
```javascript
const { initGridFS } = require('./utils/gridfs');

// After mongoose connection
mongoose.connection.once('open', () => {
  initGridFS();
  console.log('GridFS initialized');
});
```

---

### 2.5 Business Logic Services

#### Term Service
**File:** `backend/services/termService.js`

```javascript
const Term = require('../models/Term');
const User = require('../models/User');
const { logManual } = require('../middleware/loggingMiddleware');

// Activate a term (set as current)
exports.activateTerm = async (termId, userId) => {
  // Set all terms to isCurrent = false
  await Term.updateMany({}, { isCurrent: false });

  // Set this term to isCurrent = true
  const term = await Term.findByIdAndUpdate(
    termId,
    { isCurrent: true },
    { new: true }
  );

  // If first term of year, increment student years
  if (term.isFirstTermOfYear) {
    await this.incrementStudentYears(userId);
  }

  return term;
};

// Increment all student year levels (Y7 -> Y8, etc.)
exports.incrementStudentYears = async (userId) => {
  const students = await User.find({ isStudent: true, isActive: true });

  const yearMap = {
    'Y6': 'Y7', 'Y7': 'Y8', 'Y8': 'Y9',
    'Y9': 'Y10', 'Y10': 'Y11', 'Y11': 'Y12', 'Y12': null
  };

  const updates = [];

  for (const student of students) {
    const newYear = yearMap[student.year];

    if (newYear) {
      student.year = newYear;
      await student.save();
      updates.push(student);
    } else if (student.year === 'Y12') {
      // Deactivate Y12 students
      student.isActive = false;
      await student.save();
      updates.push(student);
    }
  }

  // Log the operation
  if (userId) {
    await logManual(
      { user: { _id: userId } },
      'update',
      'Term',
      null,
      { operation: 'incrementStudentYears', affectedStudents: updates.length }
    );
  }

  return updates;
};
```

#### Class Service
**File:** `backend/services/classService.js`

```javascript
const Class = require('../models/Class');

// Validate schedule doesn't overlap in same classroom
exports.validateSchedule = async (schedule, classroomId, termId, excludeClassId = null) => {
  for (const slot of schedule) {
    const query = {
      classroom: classroomId,
      term: termId,
      'schedule.dayOfWeek': slot.dayOfWeek,
      isActive: true
    };

    if (excludeClassId) {
      query._id = { $ne: excludeClassId };
    }

    const overlappingClasses = await Class.find(query);

    for (const existingClass of overlappingClasses) {
      for (const existingSlot of existingClass.schedule) {
        if (existingSlot.dayOfWeek === slot.dayOfWeek) {
          // Check time overlap
          const newStart = timeToMinutes(slot.startTime);
          const newEnd = newStart + slot.duration;
          const existingStart = timeToMinutes(existingSlot.startTime);
          const existingEnd = existingStart + existingSlot.duration;

          if (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
          ) {
            return {
              valid: false,
              message: `Schedule conflicts with ${existingClass.name}`
            };
          }
        }
      }
    }
  }

  return { valid: true };
};

// Generate class name
exports.generateClassName = async (teacherId, year, schedule) => {
  const teacher = await User.findById(teacherId);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const primarySlot = schedule[0];

  const day = days[primarySlot.dayOfWeek];
  const time = formatTime(primarySlot.startTime);

  return `${teacher.name} ${year} ${day} ${time}`;
};

// Copy class to next term
exports.copyClassToNextTerm = async (classId, nextTermId) => {
  const originalClass = await Class.findById(classId).populate('term');

  const newClass = new Class({
    ...originalClass.toObject(),
    _id: undefined,
    term: nextTermId,
    weeklyData: [] // Will be initialized based on new term weeks
  });

  // Initialize weeklyData for new term
  const nextTerm = await Term.findById(nextTermId);
  for (let week = 1; week <= nextTerm.weeks; week++) {
    newClass.weeklyData.push({
      week,
      classNotes: [],
      attendance: [],
      homework: [],
      test: { marks: [] }
    });
  }

  await newClass.save();
  return newClass;
};

// Helper functions
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
}
```

---

### 2.6 Enhanced Seed Script

**File:** `backend/seedDatabase.js` - Add to existing:

```javascript
// Import new models
const Term = require('./models/Term');
const Classroom = require('./models/Classroom');
const Topic = require('./models/Topic');
const Test = require('./models/Test');
const Progress = require('./models/Progress');
const Class = require('./models/Class');
const Followup = require('./models/Followup');

// ... in seedData() function, after users are created:

// Create Terms
const terms = await Term.insertMany([
  {
    name: '25T1',
    type: 'school_term',
    startDate: new Date('2025-01-27'),
    weeks: 10,
    isFirstTermOfYear: true,
    isCurrent: true,
    createdBy: adminUser._id
  },
  {
    name: '25H1',
    type: 'holiday',
    startDate: new Date('2025-04-07'),
    weeks: 3,
    isFirstTermOfYear: false,
    isCurrent: false,
    createdBy: adminUser._id
  }
]);

// Create Classrooms
const classrooms = await Classroom.insertMany([
  { name: 'Room A', capacity: 15, isActive: true },
  { name: 'Room B', capacity: 12, isActive: true },
  { name: 'Room C', capacity: 10, isActive: true }
]);

// Create Topics
const topics = await Topic.insertMany([
  { name: 'Algebra Basics', content: 'Introduction to algebraic expressions', year: 'Y8', term: 'T1', createdBy: adminUser._id },
  { name: 'Geometry Fundamentals', content: 'Angles and triangles', year: 'Y8', term: 'T1', createdBy: adminUser._id },
  // Add more topics...
]);

// Create Tests
const tests = await Test.insertMany([
  { name: 'Y8 Test1', year: 'Y8', term: 'T1', createdBy: adminUser._id },
  { name: 'Y10 Test1', year: 'Y10', term: 'T1', createdBy: adminUser._id }
]);

// Create Progress
const progress = await Progress.create({
  name: 'Year 8 General',
  term: terms[0]._id,
  year: 'Y8',
  weeklyContent: Array.from({ length: 10 }, (_, i) => ({
    week: i + 1,
    topics: [topics[0]._id, topics[1]._id],
    test: i === 9 ? tests[0]._id : null,
    comments: i === 0 ? 'Introduction week' : ''
  }))
});

// Create Classes
const sampleClass = await Class.create({
  name: 'Sarah Y8 Fri 7pm',
  year: 'Y8',
  teacher: teacherUser._id,
  classroom: classrooms[0]._id,
  term: terms[0]._id,
  progress: progress._id,
  schedule: [{
    dayOfWeek: 5, // Friday
    startTime: '19:00',
    duration: 120
  }],
  students: [
    { student: studentUsers[0]._id, joinedWeek: 1 },
    { student: studentUsers[1]._id, joinedWeek: 1 }
  ],
  weeklyData: Array.from({ length: 10 }, (_, i) => ({
    week: i + 1,
    classNotes: [],
    attendance: [],
    homework: [],
    test: { marks: [] }
  })),
  copyToNextTerm: true,
  isActive: true
});

// Create Followups
await Followup.insertMany([
  {
    issue: 'Update curriculum for Y9',
    solution: '',
    dueDate: new Date('2025-02-15'),
    isCompleted: false,
    createdBy: adminUser._id
  },
  {
    issue: 'Order new textbooks',
    solution: 'Ordered from supplier',
    dueDate: new Date('2025-01-30'),
    isCompleted: true,
    completedAt: new Date(),
    createdBy: adminUser._id
  }
]);

console.log('All data seeded successfully!');
```

---

### 2.7 Phase 2 Deliverables Checklist

- [ ] All 9 models created
- [ ] All controllers created with CRUD operations
- [ ] All routes registered
- [ ] File upload middleware configured
- [ ] GridFS setup and tested
- [ ] Business logic services implemented
- [ ] Enhanced seed script with all data
- [ ] Database indexes created
- [ ] API endpoints tested with Postman/Thunder Client
- [ ] Validation logic in place

---

## Phase 3: Admin Dashboard - Core Features

**Estimated Time:** 1-2 weeks
**Priority:** Critical
**Status:** Pending

### 3.1 Admin Layout Component

**File:** `frontend/src/components/admin/AdminLayout.jsx`

```jsx
import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const switchToTeacher = () => {
    navigate('/teacher');
  };

  return (
    <div className="admin-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>KMC Admin</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin">Home</Link>
          <Link to="/admin/timetable">Timetable</Link>

          <div className="nav-section">
            <h3>Manage</h3>
            <Link to="/admin/students">Students</Link>
            <Link to="/admin/classes">Classes</Link>
            <Link to="/admin/classrooms">Classrooms</Link>
            <Link to="/admin/staff">Staff</Link>
            <Link to="/admin/terms">Terms</Link>
            <Link to="/admin/progress">Progress</Link>
            <Link to="/admin/topics">Topics</Link>
          </div>

          <div className="nav-section">
            <h3>Detentions</h3>
            <Link to="/admin/detention-slots">Slots</Link>
            <Link to="/admin/unbooked-detentions">Unbooked</Link>
          </div>

          <div className="nav-section">
            <h3>Reports</h3>
            <Link to="/admin/followups">Followups</Link>
            <Link to="/admin/class-change-log">Class Changes</Link>
            <Link to="/admin/absence-summary">Absences</Link>
            <Link to="/admin/operation-history">History</Link>
          </div>
        </nav>
      </aside>

      <div className="main-content">
        <header className="top-bar">
          <div className="user-info">
            <span>{user?.name}</span>
            {user?.isTeacher && (
              <button onClick={switchToTeacher} className="btn-secondary">
                Switch to Teacher
              </button>
            )}
            <button onClick={handleLogout} className="btn-outline">
              Logout
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
```

**File:** `frontend/src/components/admin/AdminLayout.css`

```css
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: var(--color-primary);
  color: white;
  transition: width 0.3s;
}

.sidebar.closed {
  width: 60px;
}

.sidebar-header {
  padding: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-nav {
  padding: var(--spacing-md);
}

.sidebar-nav a {
  display: block;
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-xs);
  border-radius: var(--radius-sm);
  text-decoration: none;
}

.sidebar-nav a:hover {
  background: var(--color-primary-dark);
}

.nav-section {
  margin-top: var(--spacing-lg);
}

.nav-section h3 {
  font-size: 12px;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: var(--spacing-sm);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-bar {
  background: white;
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.content {
  padding: var(--spacing-lg);
  background: var(--color-background);
  flex: 1;
}
```

---

### 3.2 Admin Home Page

**File:** `frontend/src/pages/admin/Home.jsx`

```jsx
import { useState, useEffect } from 'react';
import followupService from '../../services/followupService';
import classService from '../../services/classService';
import detentionService from '../../services/detentionService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Home.css';

const AdminHome = () => {
  const [followups, setFollowups] = useState([]);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [todaysDetentions, setTodaysDetentions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [followupsData, classesData, detentionsData] = await Promise.all([
        followupService.getFollowups({ isCompleted: false }),
        classService.getTodaysClasses(),
        detentionService.getTodaysDetentions()
      ]);

      setFollowups(followupsData);
      setTodaysClasses(classesData);
      setTodaysDetentions(detentionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markFollowupDone = async (id) => {
    await followupService.markComplete(id);
    loadData();
  };

  const updateAttendance = async (classId, week, studentId, status) => {
    await classService.markAttendance(classId, week, [
      { student: studentId, status }
    ]);
    loadData();
  };

  const updateDetentionStatus = async (detentionId, status) => {
    await detentionService.updateStatus(detentionId, status);
    loadData();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-home">
      <h1>Admin Dashboard</h1>

      {/* Followups Section */}
      <section className="followups-section">
        <h2>Followups</h2>
        <div className="followups-list">
          {followups.map((followup) => {
            const isOverdue = new Date(followup.dueDate) < new Date();
            return (
              <div
                key={followup._id}
                className={`followup-card ${isOverdue ? 'overdue' : ''}`}
                title={followup.issue}
              >
                <div className="followup-content">
                  <p>{followup.issue}</p>
                  <span className="due-date">
                    Due: {new Date(followup.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => markFollowupDone(followup._id)}
                  className="btn-primary"
                >
                  Done
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div className="bottom-section">
        {/* Today's Attendance */}
        <section className="attendance-section">
          <h2>Today's Attendance</h2>
          {todaysClasses.map((classItem) => (
            <div key={classItem._id} className="class-attendance">
              <h3>{classItem.name}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Present</th>
                  </tr>
                </thead>
                <tbody>
                  {classItem.students.map((student) => (
                    <tr key={student.student._id}>
                      <td>{student.student.name}</td>
                      <td>
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            updateAttendance(
                              classItem._id,
                              classItem.currentWeek,
                              student.student._id,
                              e.target.checked ? 'arrived' : 'absent'
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>

        {/* Today's Detentions */}
        <section className="detentions-section">
          <h2>Today's Detentions</h2>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Class</th>
                <th>Week</th>
              </tr>
            </thead>
            <tbody>
              {todaysDetentions.map((detention) => (
                <tr key={detention._id}>
                  <td>{detention.student.name}</td>
                  <td>
                    <select
                      value={detention.completionStatus || ''}
                      onChange={(e) =>
                        updateDetentionStatus(detention._id, e.target.value)
                      }
                    >
                      <option value="">Pending</option>
                      <option value="complete">Complete</option>
                      <option value="incomplete">Incomplete</option>
                      <option value="absent">Absent</option>
                    </select>
                  </td>
                  <td>{detention.class.name}</td>
                  <td>{detention.week}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default AdminHome;
```

---

### 3.3 Reusable DataTable Component

**File:** `frontend/src/components/common/DataTable.jsx`

```jsx
import { useState } from 'react';
import './DataTable.css';

const DataTable = ({
  columns,
  data,
  onSort,
  onEdit,
  onDelete,
  onRowClick,
  loading = false
}) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (column) => {
    if (!column.sortable) return;

    const direction =
      sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';

    setSortColumn(column.key);
    setSortDirection(direction);

    if (onSort) {
      onSort(column.key, direction);
    }
  };

  if (loading) {
    return <div className="table-loading">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="table-empty">No data available</div>;
  }

  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column)}
                className={column.sortable ? 'sortable' : ''}
              >
                {column.label}
                {sortColumn === column.key && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                  </span>
                )}
              </th>
            ))}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row._id || index}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render
                    ? column.render(row)
                    : row[column.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="actions">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(row);
                      }}
                      className="btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(row);
                      }}
                      className="btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
```

---

### 3.4 Student List Page

**File:** `frontend/src/pages/admin/StudentList.jsx`

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    year: '',
    class: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (row) => (
      <Link to={`/admin/students/${row._id}`}>{row.name}</Link>
    )},
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'school', label: 'School', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    { key: 'currentClass', label: 'Current Class', sortable: false },
    { key: 'absences', label: 'Absences', sortable: true }
  ];

  useEffect(() => {
    loadStudents();
  }, [filters]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await userService.getStudents(filters);
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    // Open edit modal
  };

  const handleDelete = async (student) => {
    if (confirm(`Delete student ${student.name}?`)) {
      await userService.deleteUser(student._id);
      loadStudents();
    }
  };

  return (
    <div className="student-list">
      <div className="page-header">
        <h1>Students</h1>
        <Button onClick={() => setShowAddModal(true)}>Add Student</Button>
      </div>

      <div className="filters">
        <Input
          placeholder="Search by name"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        {/* Add year and class filters */}
      </div>

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          {/* Add student form */}
        </Modal>
      )}
    </div>
  );
};

export default StudentList;
```

---

### 3.5 Service Files to Create

For each resource, create a service file:

**Example:** `frontend/src/services/userService.js`
```javascript
import api from './api';

const userService = {
  getStudents: async (filters) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/users/students?${params}`);
    return response.data;
  },

  createStudent: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    await api.delete(`/users/${id}`);
  }
};

export default userService;
```

Create similar services for:
- `classService.js`
- `termService.js`
- `detentionService.js`
- `followupService.js`
- `topicService.js`
- etc.

---

### 3.6 Phase 3 Pages to Create

All in `frontend/src/pages/admin/`:

1. ✅ `Home.jsx` - Dashboard with followups, attendance, detentions
2. `StudentList.jsx` - Student management
3. `ClassList.jsx` - Class management
4. `ClassroomList.jsx` - Classroom management
5. `StaffList.jsx` - Staff management
6. `TermList.jsx` - Term management
7. `ProgressList.jsx` - Progress management
8. `TopicList.jsx` - Topic library

Each page should have:
- DataTable display
- Add/Edit modals
- Search and filters
- CRUD operations

---

## Phase 4: Admin Dashboard - Timetable & Detentions

**Estimated Time:** 1-2 weeks
**Priority:** High
**Status:** Pending

### 4.1 Install FullCalendar

```bash
cd frontend
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

### 4.2 Timetable Page

**File:** `frontend/src/pages/admin/Timetable.jsx`

```jsx
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import classService from '../../services/classService';
import './Timetable.css';

const Timetable = () => {
  const [classes, setClasses] = useState([]);
  const [view, setView] = useState('timeGridWeek');
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    loadClasses();
  }, [selectedClassroom]);

  const loadClasses = async () => {
    const data = await classService.getClasses({
      classroom: selectedClassroom !== 'all' ? selectedClassroom : undefined
    });
    setClasses(data);
  };

  // Transform classes to calendar events
  const events = classes.flatMap((classItem) =>
    classItem.schedule.map((slot) => ({
      id: classItem._id,
      title: `${classItem.name}\n${classItem.classroom.name}`,
      daysOfWeek: [slot.dayOfWeek],
      startTime: slot.startTime,
      endTime: addMinutes(slot.startTime, slot.duration),
      backgroundColor: getClassroomColor(classItem.classroom._id),
      extendedProps: {
        classData: classItem
      }
    }))
  );

  const handleEventClick = (info) => {
    const classData = info.event.extendedProps.classData;
    // Open class details modal
  };

  return (
    <div className="timetable-page">
      <div className="timetable-header">
        <h1>Timetable</h1>

        <div className="timetable-controls">
          <div className="view-toggle">
            <button
              onClick={() => setView('timeGridWeek')}
              className={view === 'timeGridWeek' ? 'active' : ''}
            >
              Week
            </button>
            <button
              onClick={() => setView('timeGridDay')}
              className={view === 'timeGridDay' ? 'active' : ''}
            >
              Day
            </button>
          </div>

          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
          >
            <option value="all">All Classrooms</option>
            {classrooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        events={events}
        eventClick={handleEventClick}
        nowIndicator={true}
        height="auto"
      />
    </div>
  );
};

// Helper functions
function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}:00`;
}

function getClassroomColor(classroomId) {
  const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];
  const hash = classroomId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default Timetable;
```

### 4.3 Detention Slot Management

**File:** `frontend/src/pages/admin/DetentionSlots.jsx`

```jsx
import { useState } from 'react';
import detentionService from '../../services/detentionService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const DetentionSlots = () => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    classroom: '',
    startTime: '',
    endTime: '',
    duration: 60
  });
  const [preview, setPreview] = useState([]);

  const generatePreview = () => {
    // Generate list of slots that will be created
    const slots = [];
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      const slotTime = formData.startTime;
      slots.push({
        date: new Date(d),
        time: slotTime,
        classroom: formData.classroom
      });
    }

    setPreview(slots);
  };

  const createSlots = async () => {
    await detentionService.createSlots(formData);
    alert('Detention slots created successfully!');
    setPreview([]);
  };

  return (
    <div className="detention-slots">
      <h1>Detention Slot Management</h1>

      <div className="slot-form">
        <h2>Create Detention Slots</h2>

        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        />

        <Input
          label="End Date"
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
        />

        {/* Classroom dropdown, time inputs */}

        <Button onClick={generatePreview}>Preview Slots</Button>

        {preview.length > 0 && (
          <div className="preview">
            <h3>Preview: {preview.length} slots will be created</h3>
            <ul>
              {preview.slice(0, 10).map((slot, i) => (
                <li key={i}>
                  {slot.date.toDateString()} at {slot.time}
                </li>
              ))}
              {preview.length > 10 && <li>... and {preview.length - 10} more</li>}
            </ul>
            <Button onClick={createSlots}>Create Slots</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetentionSlots;
```

---

## Phase 5: Admin Dashboard - Logs & Reports

**Estimated Time:** 1 week
**Priority:** Medium
**Status:** Pending

### Pages to Create:

1. **Followup Management** (`FollowupList.jsx`)
   - CRUD for followups
   - Sort by due date
   - Mark as complete

2. **Class Change Log** (`ClassChangeLog.jsx`)
   - Show when students switch classes
   - Filter by student, term, date range
   - Count changes per term

3. **Absence Summary** (`AbsenceSummary.jsx`)
   - List absences for current term
   - "Send class notes" button
   - Filter by student, class, date

4. **Operation History** (`OperationHistory.jsx`)
   - Display from OperationLog model
   - Filter by user, action, resource type, date
   - Pagination
   - Expandable rows for details

---

## Phase 6: Teacher Portal

**Estimated Time:** 1-2 weeks
**Priority:** High
**Status:** Pending

### 6.1 Teacher Layout

Similar to AdminLayout but simpler menu:
- My Classes
- Timetable
- Detentions

### 6.2 My Classes Page

List teacher's classes with click to details

### 6.3 Class Details Page

**Tabs:**
1. Students - List with school test results
2. Weekly Content - Edit progress content
3. Attendance - Mark arrived/absent
4. Homework - Grade (A-E, incomplete, etc)
5. Tests - Enter marks
6. Detentions - Assign with reason
7. Class Notes - Upload/download files

### 6.4 File Upload Component

Drag-and-drop file upload with progress indicator

---

## Phase 7: Student Portal

**Estimated Time:** 1-2 weeks
**Priority:** High
**Status:** Pending

### Mobile-First Design

Bottom navigation bar for mobile, sidebar for desktop

### Pages:
1. **My Classes** - View current/past classes, grades, marks
2. **Detentions** - Unbooked, Booked, Completed sections with booking calendar
3. **Profile** - View info, change password

---

## Phase 8: Advanced Features & Polish

**Estimated Time:** 1-2 weeks
**Priority:** Medium
**Status:** Pending

### Features:

1. **Class Switching Logic**
   - Validate same progress, same week, time > now
   - Log changes

2. **Automatic Year Increment**
   - Manual trigger by admin
   - Preview affected students
   - Send notification emails

3. **Y12 Dual Enrollment**
   - Allow Y12 in both 3U and 4U

4. **Enhanced Email Notifications**
   - Detention reminders (3 days before)
   - Absence notifications with notes
   - Year increment notifications

5. **Performance Optimization**
   - Database indexes
   - API pagination
   - Frontend lazy loading
   - Virtual scrolling for long lists

6. **UI/UX Polish**
   - Consistent styling
   - Loading states
   - Error boundaries
   - Toast notifications
   - Confirm dialogs
   - Empty states

---

## Phase 9: Testing & Deployment

**Estimated Time:** 1-2 weeks
**Priority:** Critical
**Status:** Pending

### 9.1 Testing

**Backend:**
- Unit tests for models
- Integration tests for APIs
- Auth flow tests

**Frontend:**
- Component unit tests
- E2E tests (Playwright)

**Critical Flows to Test:**
1. Admin creates class and adds students
2. Teacher marks attendance and grades homework
3. Student books detention
4. Year increment process

### 9.2 Deployment

**Backend:**
- MongoDB Atlas setup
- Deploy to Railway/Heroku/DigitalOcean
- Configure environment variables
- SSL certificate

**Frontend:**
- Build production bundle
- Deploy to Vercel/Netlify
- Configure environment variables

**Post-Deployment:**
- Database backups
- Monitoring (Sentry)
- Logging
- Performance monitoring

---

## Quick Reference

### Critical Files by Phase

**Phase 2:**
- `backend/models/Class.js` - Most complex
- `backend/services/termService.js` - Year increment
- `backend/utils/gridfs.js` - File storage

**Phase 3:**
- `frontend/src/components/admin/AdminLayout.jsx` - Layout template
- `frontend/src/components/common/DataTable.jsx` - Reusable table
- `frontend/src/pages/admin/Home.jsx` - Dashboard

**Phase 4:**
- `frontend/src/pages/admin/Timetable.jsx` - Calendar integration

**Phase 6:**
- `frontend/src/pages/teacher/ClassDetails.jsx` - Multi-tab interface
- `frontend/src/components/common/FileUpload.jsx` - File handling

**Phase 7:**
- `frontend/src/components/student/DetentionBooking.jsx` - Calendar booking

---

## Development Tips

1. **Test as you go** - Don't wait until the end
2. **Use seed data** - Create realistic test data
3. **Commit frequently** - After each major feature
4. **Reference the plan** - When stuck, check the detailed specs
5. **Ask for clarification** - If requirements are unclear

---

## Current Status

✅ **Phase 1 COMPLETE** - Authentication & Foundation
⏳ **Phase 2-9 PENDING** - Ready to implement

**Next Step:** Fix Node.js version issue, then start Phase 2!
