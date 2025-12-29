const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Term = require('./models/Term');
const Classroom = require('./models/Classroom');
const Topic = require('./models/Topic');
const Test = require('./models/Test');
const Progress = require('./models/Progress');
const Class = require('./models/Class');
const Followup = require('./models/Followup');
const DetentionSlot = require('./models/DetentionSlot');
const Detention = require('./models/Detention');

// Load environment variables
dotenv.config();

// Helper function to generate class name
const generateClassName = (teacherName, year, dayOfWeek, startTime, duration) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = days[dayOfWeek];

  // Calculate end time
  const [hours, minutes] = startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + duration;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;

  // Format times (e.g., "4pm" or "4:30pm")
  const formatTime = (h, m) => {
    const period = h >= 12 ? 'pm' : 'am';
    const displayHours = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return m === 0 ? `${displayHours}${period}` : `${displayHours}:${m.toString().padStart(2, '0')}${period}`;
  };

  const start = formatTime(hours, minutes);
  const end = formatTime(endHours, endMins);

  return `${teacherName} ${year} ${day} ${start} - ${end}`;
};

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Term.deleteMany({});
    await Classroom.deleteMany({});
    await Topic.deleteMany({});
    await Test.deleteMany({});
    await Progress.deleteMany({});
    await Class.deleteMany({});
    await Followup.deleteMany({});
    await DetentionSlot.deleteMany({});
    await Detention.deleteMany({});
    console.log('Cleared existing data...');

    // Create sample users with new role fields
    const users = [
      // Admin Users
      {
        name: 'Admin',
        email: 'admin@kmc.com',
        password: 'Kurt2389',
        phone: '0400123456',
        isAdmin: true,
        isTeacher: false,
        isStudent: false,
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Sarah Wang',
        email: 'sarah@kmc.com',
        password: 'Teacher123',
        phone: '0400234567',
        isAdmin: true,  // Teacher + Admin
        isTeacher: true,
        isStudent: false,
        initialPasswordUsed: true,
        isActive: true
      },

      // Teachers
      {
        name: 'Michael Chen',
        email: 'michael.chen@kmc.com',
        password: 'Teacher123',
        phone: '0400345678',
        isAdmin: false,
        isTeacher: true,
        isStudent: false,
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Jessica Lee',
        email: 'jessica.lee@kmc.com',
        password: 'Teacher123',
        phone: '0400456789',
        isAdmin: false,
        isTeacher: true,
        isStudent: false,
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Robert Johnson',
        email: 'robert.johnson@kmc.com',
        password: 'Teacher123',
        phone: '0400567890',
        isAdmin: false,
        isTeacher: true,
        isStudent: false,
        initialPasswordUsed: false,
        isActive: false  // Inactive teacher
      },

      // Year 6 Students
      {
        name: 'Sophie Taylor',
        email: 'sophie.taylor@student.com',
        password: 'Student123',
        phone: '0400678901',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Sydney Primary',
        year: 'Y6',
        startingTerm: '25T1',
        notes: 'New student, enthusiastic learner',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Oliver Brown',
        email: 'oliver.brown@student.com',
        password: 'Student123',
        phone: '0400789012',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Sydney Primary',
        year: 'Y6',
        startingTerm: '25T1',
        notes: 'Good at mental math',
        initialPasswordUsed: true,
        isActive: true
      },

      // Year 7 Students
      {
        name: 'Emma Wilson',
        email: 'emma.wilson@student.com',
        password: 'Student123',
        phone: '0400890123',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Melbourne Secondary',
        year: 'Y7',
        startingTerm: '25T1',
        notes: 'Struggles with algebra',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Liam Davis',
        email: 'liam.davis@student.com',
        password: 'Student123',
        phone: '0400901234',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Brisbane High',
        year: 'Y7',
        startingTerm: '24T4',
        notes: 'Advanced for year level',
        initialPasswordUsed: true,
        isActive: true
      },

      // Year 8 Students
      {
        name: 'John Smith',
        email: 'john.smith@student.com',
        password: 'Student123',
        phone: '0401012345',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Sydney High School',
        year: 'Y8',
        startingTerm: '25T1',
        notes: 'Sometimes late to class',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Ava Martinez',
        email: 'ava.martinez@student.com',
        password: 'Student123',
        phone: '0401123456',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Perth Academy',
        year: 'Y8',
        startingTerm: '25T1',
        notes: 'Excellent homework completion',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Noah Anderson',
        email: 'noah.anderson@student.com',
        password: 'Student123',
        phone: '0401234567',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Adelaide College',
        year: 'Y8',
        startingTerm: '24T3',
        notes: 'Needs extra support with geometry',
        initialPasswordUsed: true,
        isActive: true
      },

      // Year 9 Students
      {
        name: 'Isabella Garcia',
        email: 'isabella.garcia@student.com',
        password: 'Student123',
        phone: '0401345678',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Canberra Grammar',
        year: 'Y9',
        startingTerm: '25T1',
        notes: 'Consistently high scores',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Ethan Thomas',
        email: 'ethan.thomas@student.com',
        password: 'Student123',
        phone: '0401456789',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Sydney High School',
        year: 'Y9',
        startingTerm: '24T4',
        notes: 'Strong problem solver',
        initialPasswordUsed: true,
        isActive: true
      },

      // Year 10 Students
      {
        name: 'Emily Chen',
        email: 'emily.chen@student.com',
        password: 'Student123',
        phone: '0401567890',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Melbourne Grammar',
        year: 'Y10',
        startingTerm: '25T1',
        notes: 'Advanced mathematics student, preparing for olympiad',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Mia Rodriguez',
        email: 'mia.rodriguez@student.com',
        password: 'Student123',
        phone: '0401678901',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Brisbane State High',
        year: 'Y10',
        startingTerm: '24T3',
        notes: 'Interested in engineering',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'James Wilson',
        email: 'james.wilson@student.com',
        password: 'Student123',
        phone: '0401789012',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Perth High',
        year: 'Y10',
        startingTerm: '25T1',
        notes: 'Requires calculator accommodations',
        initialPasswordUsed: true,
        isActive: true
      },

      // Year 11 Students
      {
        name: 'Charlotte Moore',
        email: 'charlotte.moore@student.com',
        password: 'Student123',
        phone: '0401890123',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Sydney Grammar',
        year: 'Y11',
        startingTerm: '25T1',
        notes: 'Planning to study medicine',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Benjamin Taylor',
        email: 'benjamin.taylor@student.com',
        password: 'Student123',
        phone: '0401901234',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Melbourne High',
        year: 'Y11',
        startingTerm: '24T4',
        notes: 'Excels in calculus',
        initialPasswordUsed: true,
        isActive: true
      },

      // Year 12 Students
      {
        name: 'David Lee',
        email: 'david.lee@student.com',
        password: 'Student123',
        phone: '0402012345',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Brisbane State High',
        year: 'Y12',
        startingTerm: '24T3',
        notes: 'Preparing for HSC, aiming for ATAR 95+',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Chloe Harris',
        email: 'chloe.harris@student.com',
        password: 'Student123',
        phone: '0402123456',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Sydney Girls High',
        year: 'Y12',
        startingTerm: '24T3',
        notes: 'Taking both 3U and 4U mathematics',
        initialPasswordUsed: true,
        isActive: true
      },

      // Year 12 3U Student
      {
        name: 'Daniel White',
        email: 'daniel.white@student.com',
        password: 'Student123',
        phone: '0402234567',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Parramatta High',
        year: 'Y12 3U',
        startingTerm: '24T3',
        notes: 'Extension 1 mathematics',
        initialPasswordUsed: true,
        isActive: true
      },

      // Year 12 4U Student
      {
        name: 'Sophia Martin',
        email: 'sophia.martin@student.com',
        password: 'Student123',
        phone: '0402345678',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'James Ruse',
        year: 'Y12 4U',
        startingTerm: '24T3',
        notes: 'Extension 2 mathematics, state rank potential',
        initialPasswordUsed: true,
        isActive: true
      },

      // Inactive student (left the program)
      {
        name: 'Ryan Clark',
        email: 'ryan.clark@student.com',
        password: 'Student123',
        phone: '0402456789',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Adelaide High',
        year: 'Y9',
        startingTerm: '24T2',
        notes: 'Left program after T3 2024',
        initialPasswordUsed: true,
        isActive: false
      },

      // Additional Year 7 Students for Monday classes
      {
        name: 'Lucas Anderson',
        email: 'lucas.anderson@student.com',
        password: 'Student123',
        phone: '0403001001',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Sydney Grammar',
        year: 'Y7',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Olivia Thompson',
        email: 'olivia.thompson@student.com',
        password: 'Student123',
        phone: '0403001002',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Melbourne High',
        year: 'Y7',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Mason Lee',
        email: 'mason.lee@student.com',
        password: 'Student123',
        phone: '0403001003',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Brisbane State',
        year: 'Y7',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Amelia Johnson',
        email: 'amelia.johnson@student.com',
        password: 'Student123',
        phone: '0403001004',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Perth Academy',
        year: 'Y7',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Jackson White',
        email: 'jackson.white@student.com',
        password: 'Student123',
        phone: '0403001005',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Sydney High',
        year: 'Y7',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Harper Martinez',
        email: 'harper.martinez@student.com',
        password: 'Student123',
        phone: '0403001006',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Adelaide College',
        year: 'Y7',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Ethan Harris',
        email: 'ethan.harris@student.com',
        password: 'Student123',
        phone: '0403001007',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Canberra Grammar',
        year: 'Y7',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Zoe Clark',
        email: 'zoe.clark@student.com',
        password: 'Student123',
        phone: '0403001008',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Melbourne Grammar',
        year: 'Y7',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Sebastian King',
        email: 'sebastian.king@student.com',
        password: 'Student123',
        phone: '0403001009',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Brisbane High',
        year: 'Y7',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Lily Walker',
        email: 'lily.walker@student.com',
        password: 'Student123',
        phone: '0403001010',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Perth High',
        year: 'Y7',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },

      // Additional Year 9 Students for Monday classes
      {
        name: 'William Scott',
        email: 'william.scott@student.com',
        password: 'Student123',
        phone: '0403002001',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Sydney High',
        year: 'Y9',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Grace Adams',
        email: 'grace.adams@student.com',
        password: 'Student123',
        phone: '0403002002',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Melbourne Secondary',
        year: 'Y9',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Henry Baker',
        email: 'henry.baker@student.com',
        password: 'Student123',
        phone: '0403002003',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Brisbane State',
        year: 'Y9',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Chloe Nelson',
        email: 'chloe.nelson@student.com',
        password: 'Student123',
        phone: '0403002004',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Perth Academy',
        year: 'Y9',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Alexander Wright',
        email: 'alexander.wright@student.com',
        password: 'Student123',
        phone: '0403002005',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Adelaide High',
        year: 'Y9',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Ella Mitchell',
        email: 'ella.mitchell@student.com',
        password: 'Student123',
        phone: '0403002006',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Canberra Grammar',
        year: 'Y9',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Jack Roberts',
        email: 'jack.roberts@student.com',
        password: 'Student123',
        phone: '0403002007',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Sydney Grammar',
        year: 'Y9',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Mia Turner',
        email: 'mia.turner@student.com',
        password: 'Student123',
        phone: '0403002008',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Melbourne High',
        year: 'Y9',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Daniel Phillips',
        email: 'daniel.phillips@student.com',
        password: 'Student123',
        phone: '0403002009',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Brisbane Grammar',
        year: 'Y9',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Ava Campbell',
        email: 'ava.campbell@student.com',
        password: 'Student123',
        phone: '0403002010',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Perth High',
        year: 'Y9',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },

      // Additional Year 11 Students for Monday classes
      {
        name: 'Ryan Cooper',
        email: 'ryan.cooper@student.com',
        password: 'Student123',
        phone: '0403003001',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Sydney Grammar',
        year: 'Y11',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Sofia Rodriguez',
        email: 'sofia.rodriguez@student.com',
        password: 'Student123',
        phone: '0403003002',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Melbourne High',
        year: 'Y11',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Matthew Hall',
        email: 'matthew.hall@student.com',
        password: 'Student123',
        phone: '0403003003',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Brisbane State',
        year: 'Y11',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Emily Young',
        email: 'emily.young@student.com',
        password: 'Student123',
        phone: '0403003004',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Perth Academy',
        year: 'Y11',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Joshua Green',
        email: 'joshua.green@student.com',
        password: 'Student123',
        phone: '0403003005',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Adelaide College',
        year: 'Y11',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Madison Hill',
        email: 'madison.hill@student.com',
        password: 'Student123',
        phone: '0403003006',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Canberra Grammar',
        year: 'Y11',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Tyler Evans',
        email: 'tyler.evans@student.com',
        password: 'Student123',
        phone: '0403003007',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Sydney High',
        year: 'Y11',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Scarlett Collins',
        email: 'scarlett.collins@student.com',
        password: 'Student123',
        phone: '0403003008',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Melbourne Grammar',
        year: 'Y11',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Nathan Stewart',
        email: 'nathan.stewart@student.com',
        password: 'Student123',
        phone: '0403003009',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Brisbane High',
        year: 'Y11',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      },
      {
        name: 'Abigail Morris',
        email: 'abigail.morris@student.com',
        password: 'Student123',
        phone: '0403003010',
        isAdmin: false,
        isTeacher: false,
        isStudent: true,
        school: 'Perth High',
        year: 'Y11',
        startingTerm: '25T1',
        notes: '',
        initialPasswordUsed: true,
        isActive: true
      }
    ];

    // Insert users one by one (passwords stored in plaintext - NOT SECURE!)
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
      const roles = [];
      if (user.isAdmin) roles.push('Admin');
      if (user.isTeacher) roles.push('Teacher');
      if (user.isStudent) roles.push('Student');
      console.log(`  - ${user.name} (${roles.join('/')}): ${user.email}`);
    }
    console.log(`Successfully created ${createdUsers.length} users`);

    // Find specific users for later reference
    const adminUser = createdUsers.find(u => u.email === 'admin@kmc.com');
    const teacherSarah = createdUsers.find(u => u.email === 'sarah@kmc.com');
    const teacherMichael = createdUsers.find(u => u.email === 'michael.chen@kmc.com');
    const teacherJessica = createdUsers.find(u => u.email === 'jessica.lee@kmc.com');
    const students = createdUsers.filter(u => u.isStudent && u.isActive);

    // Group students by year for easier assignment
    const studentsByYear = {
      Y6: students.filter(s => s.year === 'Y6'),
      Y7: students.filter(s => s.year === 'Y7'),
      Y8: students.filter(s => s.year === 'Y8'),
      Y9: students.filter(s => s.year === 'Y9'),
      Y10: students.filter(s => s.year === 'Y10'),
      Y11: students.filter(s => s.year === 'Y11'),
      Y12: students.filter(s => s.year === 'Y12'),
      'Y12 3U': students.filter(s => s.year === 'Y12 3U'),
      'Y12 4U': students.filter(s => s.year === 'Y12 4U')
    };

    // Create Terms
    console.log('\n📅 Creating terms...');
    const terms = [];

    const term1 = await Term.create({
      name: '25T1',
      type: 'school_term',
      startDate: new Date('2025-01-25'),  // Saturday
      weeks: 10,
      isFirstTermOfYear: true,
      isCurrent: false,
      createdBy: adminUser._id
    });
    terms.push(term1);
    console.log(`  - ${term1.name}`);

    const holiday1 = await Term.create({
      name: '25H1',
      type: 'holiday',
      startDate: new Date('2025-04-05'),  // Saturday
      weeks: 2,
      isFirstTermOfYear: false,
      isCurrent: false,
      createdBy: adminUser._id
    });
    terms.push(holiday1);
    console.log(`  - ${holiday1.name}`);

    const term2 = await Term.create({
      name: '25T2',
      type: 'school_term',
      startDate: new Date('2025-04-19'),  // Saturday
      weeks: 10,
      isFirstTermOfYear: false,
      isCurrent: false,
      createdBy: adminUser._id
    });
    terms.push(term2);
    console.log(`  - ${term2.name}`);

    const holiday2 = await Term.create({
      name: '25H2',
      type: 'holiday',
      startDate: new Date('2025-06-28'),  // Saturday
      weeks: 2,
      isFirstTermOfYear: false,
      isCurrent: false,
      createdBy: adminUser._id
    });
    terms.push(holiday2);
    console.log(`  - ${holiday2.name}`);

    const term3 = await Term.create({
      name: '25T3',
      type: 'school_term',
      startDate: new Date('2025-07-12'),  // Saturday
      weeks: 10,
      isFirstTermOfYear: false,
      isCurrent: false,
      createdBy: adminUser._id
    });
    terms.push(term3);
    console.log(`  - ${term3.name}`);

    const holiday3 = await Term.create({
      name: '25H3',
      type: 'holiday',
      startDate: new Date('2025-09-20'),  // Saturday
      weeks: 2,
      isFirstTermOfYear: false,
      isCurrent: false,
      createdBy: adminUser._id
    });
    terms.push(holiday3);
    console.log(`  - ${holiday3.name}`);

    const term4 = await Term.create({
      name: '25T4',
      type: 'school_term',
      startDate: new Date('2025-10-25'),  // Saturday
      weeks: 10,
      isFirstTermOfYear: false,
      isCurrent: true,
      createdBy: adminUser._id
    });
    terms.push(term4);
    console.log(`  - ${term4.name} (Current)`);

    const term26_1 = await Term.create({
      name: '26T1',
      type: 'school_term',
      startDate: new Date('2026-01-03'),  // Saturday (next week)
      weeks: 10,
      isFirstTermOfYear: true,
      isCurrent: false,
      createdBy: adminUser._id
    });
    terms.push(term26_1);
    console.log(`  - ${term26_1.name}`);

    // Create Classrooms
    console.log('\n🏫 Creating classrooms...');
    const classrooms = await Classroom.insertMany([
      { name: 'Room A', capacity: 15, isActive: true },
      { name: 'Room B', capacity: 12, isActive: true },
      { name: 'Room C', capacity: 10, isActive: true },
      { name: 'Room D', capacity: 8, isActive: true },
      { name: 'Room E', capacity: 20, isActive: true },
      { name: 'Room F', capacity: 18, isActive: true },
      { name: 'Detention Room', capacity: 15, isActive: true },
      { name: 'Old Room 1', capacity: 10, isActive: false }  // Inactive room
    ]);
    classrooms.forEach(c => console.log(`  - ${c.name} (Capacity: ${c.capacity}) ${c.isActive ? '' : '[Inactive]'}`));

    // Create Topics
    console.log('\n📚 Creating topics...');
    const topics = await Topic.insertMany([
      // Year 6 Topics
      { name: 'Fractions & Decimals', content: 'Understanding fractions, decimals, and percentages', year: 'Y6', term: 'T1', createdBy: adminUser._id },
      { name: 'Basic Geometry', content: 'Shapes, area, and perimeter', year: 'Y6', term: 'T1', createdBy: adminUser._id },

      // Year 7 Topics
      { name: 'Integers', content: 'Positive and negative numbers, operations', year: 'Y7', term: 'T1', createdBy: adminUser._id },
      { name: 'Ratios & Proportions', content: 'Understanding ratios, rates, and proportional relationships', year: 'Y7', term: 'T1', createdBy: adminUser._id },
      { name: 'Introduction to Algebra', content: 'Variables, expressions, and simple equations', year: 'Y7', term: 'T1', createdBy: adminUser._id },

      // Year 8 Topics
      { name: 'Algebra Basics', content: 'Introduction to algebraic expressions and equations', year: 'Y8', term: 'T1', createdBy: adminUser._id },
      { name: 'Linear Equations', content: 'Solving linear equations and inequalities', year: 'Y8', term: 'T1', createdBy: adminUser._id },
      { name: 'Geometry Fundamentals', content: 'Angles, triangles, and basic geometric shapes', year: 'Y8', term: 'T1', createdBy: adminUser._id },
      { name: 'Probability & Statistics', content: 'Data collection, analysis, and probability basics', year: 'Y8', term: 'T1', createdBy: adminUser._id },

      // Year 9 Topics
      { name: 'Advanced Algebra', content: 'Simultaneous equations, factorization', year: 'Y9', term: 'T1', createdBy: adminUser._id },
      { name: 'Pythagoras Theorem', content: 'Right-angled triangles and applications', year: 'Y9', term: 'T1', createdBy: adminUser._id },
      { name: 'Indices & Surds', content: 'Laws of indices and surd operations', year: 'Y9', term: 'T1', createdBy: adminUser._id },

      // Year 10 Topics
      { name: 'Quadratic Functions', content: 'Understanding and graphing quadratic functions', year: 'Y10', term: 'T1', createdBy: adminUser._id },
      { name: 'Trigonometry', content: 'Basic trigonometric ratios and applications', year: 'Y10', term: 'T1', createdBy: adminUser._id },
      { name: 'Circle Geometry', content: 'Properties of circles, tangents, and chords', year: 'Y10', term: 'T1', createdBy: adminUser._id },
      { name: 'Logarithms', content: 'Introduction to logarithmic functions', year: 'Y10', term: 'T1', createdBy: adminUser._id },

      // Year 11 Topics
      { name: 'Functions', content: 'Domain, range, and function transformations', year: 'Y11', term: 'T1', createdBy: adminUser._id },
      { name: 'Trigonometric Functions', content: 'Graphs and equations involving trig functions', year: 'Y11', term: 'T1', createdBy: adminUser._id },
      { name: 'Sequences & Series', content: 'Arithmetic and geometric sequences', year: 'Y11', term: 'T1', createdBy: adminUser._id },

      // Year 12 Topics
      { name: 'Calculus Introduction', content: 'Derivatives and basic differentiation', year: 'Y12', term: 'T1', createdBy: adminUser._id },
      { name: 'Integration', content: 'Integral calculus and applications', year: 'Y12', term: 'T1', createdBy: adminUser._id },
      { name: 'Applications of Calculus', content: 'Optimization, related rates, areas, and volumes', year: 'Y12', term: 'T1', createdBy: adminUser._id },

      // Year 12 3U Topics
      { name: 'Parametric Equations', content: 'Parametric representation and calculus', year: 'Y12 3U', term: 'T1', createdBy: adminUser._id },
      { name: 'Harder Calculus', content: 'Advanced integration techniques', year: 'Y12 3U', term: 'T1', createdBy: adminUser._id },

      // Year 12 4U Topics
      { name: 'Complex Numbers', content: 'Operations with complex numbers, Argand diagrams', year: 'Y12 4U', term: 'T1', createdBy: adminUser._id },
      { name: 'Vectors', content: 'Vector operations and applications', year: 'Y12 4U', term: 'T1', createdBy: adminUser._id },
      { name: 'Conics', content: 'Parabolas, ellipses, and hyperbolas', year: 'Y12 4U', term: 'T1', createdBy: adminUser._id }
    ]);
    console.log(`  - Created ${topics.length} topics`);

    // Create Tests
    console.log('\n📝 Creating tests...');
    const tests = await Test.insertMany([
      // Year 6-7 Tests
      { name: 'Y6 Test 1', year: 'Y6', term: 'T1', createdBy: adminUser._id },
      { name: 'Y6 Final Test', year: 'Y6', term: 'T1', createdBy: adminUser._id },
      { name: 'Y7 Test 1', year: 'Y7', term: 'T1', createdBy: adminUser._id },
      { name: 'Y7 Test 2', year: 'Y7', term: 'T1', createdBy: adminUser._id },

      // Year 8 Tests
      { name: 'Y8 Test 1', year: 'Y8', term: 'T1', createdBy: adminUser._id },
      { name: 'Y8 Test 2', year: 'Y8', term: 'T1', createdBy: adminUser._id },
      { name: 'Y8 Final Test', year: 'Y8', term: 'T1', createdBy: adminUser._id },

      // Year 9 Tests
      { name: 'Y9 Test 1', year: 'Y9', term: 'T1', createdBy: adminUser._id },
      { name: 'Y9 Test 2', year: 'Y9', term: 'T1', createdBy: adminUser._id },

      // Year 10 Tests
      { name: 'Y10 Test 1', year: 'Y10', term: 'T1', createdBy: adminUser._id },
      { name: 'Y10 Test 2', year: 'Y10', term: 'T1', createdBy: adminUser._id },
      { name: 'Y10 Final Test', year: 'Y10', term: 'T1', createdBy: adminUser._id },

      // Year 11 Tests
      { name: 'Y11 Test 1', year: 'Y11', term: 'T1', createdBy: adminUser._id },
      { name: 'Y11 Test 2', year: 'Y11', term: 'T1', createdBy: adminUser._id },

      // Year 12 Tests
      { name: 'Y12 Test 1', year: 'Y12', term: 'T1', createdBy: adminUser._id },
      { name: 'Y12 Final Test', year: 'Y12', term: 'T1', createdBy: adminUser._id },

      // Extension Tests
      { name: 'Y12 3U Test 1', year: 'Y12 3U', term: 'T1', createdBy: adminUser._id },
      { name: 'Y12 4U Test 1', year: 'Y12 4U', term: 'T1', createdBy: adminUser._id }
    ]);
    console.log(`  - Created ${tests.length} tests`);

    // Create Progress
    console.log('\n📈 Creating progress templates...');

    // Helper function to get topics and tests by year
    const getTopicsByYear = (year) => topics.filter(t => t.year === year);
    const getTestsByYear = (year) => tests.filter(t => t.year === year);

    const y6Topics = getTopicsByYear('Y6');
    const y6Progress = await Progress.create({
      name: 'Year 6 Standard',
      term: term4._id,
      year: 'Y6',
      weeklyContent: [
        { week: 1, topics: [y6Topics[0]._id], comments: 'Introduction week' },
        { week: 2, topics: [y6Topics[0]._id], comments: '' },
        { week: 3, topics: [y6Topics[0]._id], comments: '' },
        { week: 4, topics: [y6Topics[1]._id], comments: '' },
        { week: 5, topics: [y6Topics[1]._id], test: getTestsByYear('Y6')[0]._id, comments: 'Mid-term test' },
        { week: 6, topics: [y6Topics[0]._id, y6Topics[1]._id], comments: 'Revision' },
        { week: 7, topics: [y6Topics[0]._id, y6Topics[1]._id], comments: '' },
        { week: 8, topics: [y6Topics[0]._id, y6Topics[1]._id], comments: '' },
        { week: 9, topics: [y6Topics[0]._id, y6Topics[1]._id], comments: 'Review week' },
        { week: 10, topics: [], test: getTestsByYear('Y6')[1]._id, comments: 'Final test' }
      ]
    });
    console.log(`  - ${y6Progress.name}`);

    const y8Topics = getTopicsByYear('Y8');
    const y8Progress = await Progress.create({
      name: 'Year 8 General',
      term: term4._id,
      year: 'Y8',
      weeklyContent: [
        { week: 1, topics: [y8Topics[0]._id], comments: 'Introduction week' },
        { week: 2, topics: [y8Topics[0]._id, y8Topics[1]._id], comments: '' },
        { week: 3, topics: [y8Topics[1]._id], comments: '' },
        { week: 4, topics: [y8Topics[2]._id], comments: '' },
        { week: 5, topics: [y8Topics[2]._id, y8Topics[3]._id], test: getTestsByYear('Y8')[0]._id, comments: 'Test week' },
        { week: 6, topics: [y8Topics[3]._id], comments: '' },
        { week: 7, topics: [y8Topics[1]._id, y8Topics[2]._id], comments: '' },
        { week: 8, topics: [y8Topics[2]._id, y8Topics[3]._id], comments: '' },
        { week: 9, topics: y8Topics.slice(0, 3).map(t => t._id), comments: 'Review week' },
        { week: 10, topics: [], test: getTestsByYear('Y8')[2]._id, comments: 'Final test' }
      ]
    });
    console.log(`  - ${y8Progress.name}`);

    const y10Topics = getTopicsByYear('Y10');
    const y10Progress = await Progress.create({
      name: 'Year 10 Advanced',
      term: term4._id,
      year: 'Y10',
      weeklyContent: [
        { week: 1, topics: [y10Topics[0]._id], comments: 'Introduction to quadratics' },
        { week: 2, topics: [y10Topics[0]._id], comments: '' },
        { week: 3, topics: [y10Topics[0]._id, y10Topics[1]._id], comments: 'Start trigonometry' },
        { week: 4, topics: [y10Topics[1]._id], comments: '' },
        { week: 5, topics: [y10Topics[1]._id], test: getTestsByYear('Y10')[0]._id, comments: 'Mid-term test' },
        { week: 6, topics: [y10Topics[2]._id], comments: 'Circle geometry' },
        { week: 7, topics: [y10Topics[2]._id, y10Topics[3]._id], comments: '' },
        { week: 8, topics: [y10Topics[3]._id], comments: 'Logarithms' },
        { week: 9, topics: y10Topics.slice(0, 4).map(t => t._id), comments: 'Review' },
        { week: 10, topics: [], test: getTestsByYear('Y10')[2]._id, comments: 'Final assessment' }
      ]
    });
    console.log(`  - ${y10Progress.name}`);

    const y12Topics = getTopicsByYear('Y12');
    const y12Progress = await Progress.create({
      name: 'Year 12 Calculus',
      term: term4._id,
      year: 'Y12',
      weeklyContent: [
        { week: 1, topics: [y12Topics[0]._id], comments: 'Derivatives introduction' },
        { week: 2, topics: [y12Topics[0]._id], comments: '' },
        { week: 3, topics: [y12Topics[0]._id], comments: '' },
        { week: 4, topics: [y12Topics[1]._id], comments: 'Integration begins' },
        { week: 5, topics: [y12Topics[1]._id], test: getTestsByYear('Y12')[0]._id, comments: 'Mid-term test' },
        { week: 6, topics: [y12Topics[1]._id], comments: '' },
        { week: 7, topics: [y12Topics[2]._id], comments: 'Applications' },
        { week: 8, topics: [y12Topics[2]._id], comments: '' },
        { week: 9, topics: y12Topics.map(t => t._id), comments: 'Comprehensive review' },
        { week: 10, topics: [], test: getTestsByYear('Y12')[1]._id, comments: 'Final test' }
      ]
    });
    console.log(`  - ${y12Progress.name}`);

    // Create Classes
    console.log('\n👨‍🏫 Creating classes...');

    // Initialize weekly data for classes
    const initWeeklyData = (weeks, students) => {
      const weeklyData = [];
      for (let week = 1; week <= weeks; week++) {
        weeklyData.push({
          week,
          classNotes: [],
          attendance: students.map(s => ({
            student: s.student,
            status: week < 3 ? 'arrived' : (week === 3 ? 'absent' : 'arrived'),  // Add some test attendance data
            note: ''
          })),
          homework: [],
          test: { marks: [] }
        });
      }
      return weeklyData;
    };

    // Year 6 Classes
    const y6Class1 = await Class.create({
      name: generateClassName('Sarah', 'Y6', 1, '16:00', 90),
      year: 'Y6',
      teacher: teacherSarah._id,
      classroom: classrooms[0]._id,
      term: term4._id,
      progress: y6Progress._id,
      schedule: [{
        dayOfWeek: 1, // Monday
        startTime: '16:00',
        duration: 90
      }],
      students: [
        { student: studentsByYear.Y6[0]._id, joinedWeek: 1, schoolTestResults: '85% on school algebra test' },
        { student: studentsByYear.Y6[1]._id, joinedWeek: 1, schoolTestResults: '' }
      ],
      weeklyData: initWeeklyData(10, [
        { student: studentsByYear.Y6[0]._id },
        { student: studentsByYear.Y6[1]._id }
      ]),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${y6Class1.name}`);

    // Year 7 Classes
    const y7Class1 = await Class.create({
      name: generateClassName('Jessica', 'Y7', 2, '17:00', 90),
      year: 'Y7',
      teacher: teacherJessica._id,
      classroom: classrooms[1]._id,
      term: term4._id,
      schedule: [{
        dayOfWeek: 2, // Tuesday
        startTime: '17:00',
        duration: 90
      }],
      students: [
        { student: studentsByYear.Y7[0]._id, joinedWeek: 1, schoolTestResults: '' },
        { student: studentsByYear.Y7[1]._id, joinedWeek: 1, schoolTestResults: '92% on fractions test' }
      ],
      weeklyData: initWeeklyData(10, [
        { student: studentsByYear.Y7[0]._id },
        { student: studentsByYear.Y7[1]._id }
      ]),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${y7Class1.name}`);

    // NEW Monday Y7 Class with 10+ students
    const y7StudentsList = studentsByYear.Y7.slice(0, 12).map(s => ({ student: s._id }));
    const y7Class2 = await Class.create({
      name: generateClassName('Michael', 'Y7', 1, '10:00', 90),
      year: 'Y7',
      teacher: teacherMichael._id,
      classroom: classrooms[4]._id,
      term: term4._id,
      schedule: [{
        dayOfWeek: 1, // Monday
        startTime: '10:00',
        duration: 90
      }],
      students: studentsByYear.Y7.slice(0, 12).map((s, idx) => ({
        student: s._id,
        joinedWeek: 1,
        schoolTestResults: idx % 3 === 0 ? `${75 + idx * 2}% entry test` : ''
      })),
      weeklyData: initWeeklyData(10, y7StudentsList),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${y7Class2.name}`);

    // Year 8 Classes
    const y8Class1 = await Class.create({
      name: generateClassName('Sarah', 'Y8', 5, '19:00', 120),
      year: 'Y8',
      teacher: teacherSarah._id,
      classroom: classrooms[0]._id,
      term: term4._id,
      progress: y8Progress._id,
      schedule: [{
        dayOfWeek: 5, // Friday
        startTime: '19:00',
        duration: 120
      }],
      students: [
        { student: studentsByYear.Y8[0]._id, joinedWeek: 1, schoolTestResults: '' },
        { student: studentsByYear.Y8[1]._id, joinedWeek: 1, schoolTestResults: '88% geometry test' },
        { student: studentsByYear.Y8[2]._id, joinedWeek: 2, schoolTestResults: '' }
      ],
      weeklyData: initWeeklyData(10, [
        { student: studentsByYear.Y8[0]._id },
        { student: studentsByYear.Y8[1]._id },
        { student: studentsByYear.Y8[2]._id }
      ]),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${y8Class1.name}`);

    const y8Class2 = await Class.create({
      name: generateClassName('Michael', 'Y8', 6, '09:00', 120),
      year: 'Y8',
      teacher: teacherMichael._id,
      classroom: classrooms[4]._id,
      term: term4._id,
      progress: y8Progress._id,
      schedule: [{
        dayOfWeek: 6, // Saturday
        startTime: '09:00',
        duration: 120
      }],
      students: [],
      weeklyData: initWeeklyData(10, []),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${y8Class2.name}`);

    // Year 9 Classes
    const y9Class1 = await Class.create({
      name: generateClassName('Michael', 'Y9', 3, '18:00', 120),
      year: 'Y9',
      teacher: teacherMichael._id,
      classroom: classrooms[2]._id,
      term: term4._id,
      schedule: [{
        dayOfWeek: 3, // Wednesday
        startTime: '18:00',
        duration: 120
      }],
      students: [
        { student: studentsByYear.Y9[0]._id, joinedWeek: 1, schoolTestResults: '95% mid-term exam' },
        { student: studentsByYear.Y9[1]._id, joinedWeek: 1, schoolTestResults: '' }
      ],
      weeklyData: initWeeklyData(10, [
        { student: studentsByYear.Y9[0]._id },
        { student: studentsByYear.Y9[1]._id }
      ]),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${y9Class1.name}`);

    // NEW Monday Y9 Class with 10+ students
    const y9StudentsList = studentsByYear.Y9.slice(0, 12).map(s => ({ student: s._id }));
    const y9Class2 = await Class.create({
      name: generateClassName('Sarah', 'Y9', 1, '14:00', 120),
      year: 'Y9',
      teacher: teacherSarah._id,
      classroom: classrooms[3]._id,
      term: term4._id,
      schedule: [{
        dayOfWeek: 1, // Monday
        startTime: '14:00',
        duration: 120
      }],
      students: studentsByYear.Y9.slice(0, 12).map((s, idx) => ({
        student: s._id,
        joinedWeek: 1,
        schoolTestResults: idx % 2 === 0 ? `${80 + idx * 2}% assessment` : ''
      })),
      weeklyData: initWeeklyData(10, y9StudentsList),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${y9Class2.name}`);

    // Year 10 Classes
    const y10Class1 = await Class.create({
      name: generateClassName('Sarah', 'Y10', 6, '14:00', 120),
      year: 'Y10',
      teacher: teacherSarah._id,
      classroom: classrooms[1]._id,
      term: term4._id,
      progress: y10Progress._id,
      schedule: [{
        dayOfWeek: 6, // Saturday
        startTime: '14:00',
        duration: 120
      }],
      students: [
        { student: studentsByYear.Y10[0]._id, joinedWeek: 1, schoolTestResults: 'Olympiad qualifier' },
        { student: studentsByYear.Y10[1]._id, joinedWeek: 1, schoolTestResults: '' },
        { student: studentsByYear.Y10[2]._id, joinedWeek: 1, schoolTestResults: '' }
      ],
      weeklyData: initWeeklyData(10, [
        { student: studentsByYear.Y10[0]._id },
        { student: studentsByYear.Y10[1]._id },
        { student: studentsByYear.Y10[2]._id }
      ]),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${y10Class1.name}`);

    const y10Class2 = await Class.create({
      name: generateClassName('Jessica', 'Y10', 4, '17:00', 120),
      year: 'Y10',
      teacher: teacherJessica._id,
      classroom: classrooms[3]._id,
      term: term4._id,
      progress: y10Progress._id,
      schedule: [{
        dayOfWeek: 4, // Thursday
        startTime: '17:00',
        duration: 120
      }],
      students: [],
      weeklyData: initWeeklyData(10, []),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${y10Class2.name}`);

    // Year 11 Classes
    const y11Class1 = await Class.create({
      name: generateClassName('Sarah', 'Y11', 0, '14:00', 120),
      year: 'Y11',
      teacher: teacherSarah._id,
      classroom: classrooms[5]._id,
      term: term4._id,
      schedule: [{
        dayOfWeek: 0, // Sunday
        startTime: '14:00',
        duration: 120
      }],
      students: [
        { student: studentsByYear.Y11[0]._id, joinedWeek: 1, schoolTestResults: '91% year 11 mid-term' },
        { student: studentsByYear.Y11[1]._id, joinedWeek: 1, schoolTestResults: '97% calculus quiz' }
      ],
      weeklyData: initWeeklyData(10, [
        { student: studentsByYear.Y11[0]._id },
        { student: studentsByYear.Y11[1]._id }
      ]),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${y11Class1.name}`);

    // NEW Monday Y11 Class with 10+ students
    const y11StudentsList = studentsByYear.Y11.slice(0, 12).map(s => ({ student: s._id }));
    const y11Class2 = await Class.create({
      name: generateClassName('Jessica', 'Y11', 1, '18:00', 120),
      year: 'Y11',
      teacher: teacherJessica._id,
      classroom: classrooms[2]._id,
      term: term4._id,
      schedule: [{
        dayOfWeek: 1, // Monday
        startTime: '18:00',
        duration: 120
      }],
      students: studentsByYear.Y11.slice(0, 12).map((s, idx) => ({
        student: s._id,
        joinedWeek: 1,
        schoolTestResults: idx % 3 === 0 ? `${85 + idx}% prelim test` : ''
      })),
      weeklyData: initWeeklyData(10, y11StudentsList),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${y11Class2.name}`);

    // Year 12 Classes
    const y12Class1 = await Class.create({
      name: generateClassName('Sarah', 'Y12', 0, '10:00', 150),
      year: 'Y12',
      teacher: teacherSarah._id,
      classroom: classrooms[2]._id,
      term: term4._id,
      progress: y12Progress._id,
      schedule: [{
        dayOfWeek: 0, // Sunday
        startTime: '10:00',
        duration: 150
      }],
      students: [
        { student: studentsByYear.Y12[0]._id, joinedWeek: 1, schoolTestResults: 'Trial HSC: 89%' },
        { student: studentsByYear.Y12[1]._id, joinedWeek: 1, schoolTestResults: 'Trial HSC 3U: 93%, 4U: 91%' }
      ],
      weeklyData: initWeeklyData(10, [
        { student: studentsByYear.Y12[0]._id },
        { student: studentsByYear.Y12[1]._id }
      ]),
      copyToNextTerm: false,
      isActive: true
    });
    console.log(`  - ${y12Class1.name}`);

    const y12Class2 = await Class.create({
      name: generateClassName('Michael', 'Y12', 6, '17:00', 150),
      year: 'Y12',
      teacher: teacherMichael._id,
      classroom: classrooms[4]._id,
      term: term4._id,
      progress: y12Progress._id,
      schedule: [{
        dayOfWeek: 6, // Saturday
        startTime: '17:00',
        duration: 150
      }],
      students: [],
      weeklyData: initWeeklyData(10, []),
      copyToNextTerm: false,
      isActive: true
    });
    console.log(`  - ${y12Class2.name}`);

    // Extension Classes
    const y12_3uClass = await Class.create({
      name: generateClassName('Sarah', 'Y12 3U', 6, '11:00', 120),
      year: 'Y12 3U',
      teacher: teacherSarah._id,
      classroom: classrooms[3]._id,
      term: term4._id,
      schedule: [{
        dayOfWeek: 6, // Saturday
        startTime: '11:00',
        duration: 120
      }],
      students: [
        { student: studentsByYear['Y12 3U'][0]._id, joinedWeek: 1, schoolTestResults: '88% Ext 1 trial' }
      ],
      weeklyData: initWeeklyData(10, [
        { student: studentsByYear['Y12 3U'][0]._id }
      ]),
      copyToNextTerm: false,
      isActive: true
    });
    console.log(`  - ${y12_3uClass.name}`);

    const y12_4uClass = await Class.create({
      name: generateClassName('Sarah', 'Y12 4U', 0, '16:00', 120),
      year: 'Y12 4U',
      teacher: teacherSarah._id,
      classroom: classrooms[5]._id,
      term: term4._id,
      schedule: [{
        dayOfWeek: 0, // Sunday
        startTime: '16:00',
        duration: 120
      }],
      students: [
        { student: studentsByYear['Y12 4U'][0]._id, joinedWeek: 1, schoolTestResults: '94% Ext 2 trial, state rank contender' }
      ],
      weeklyData: initWeeklyData(10, [
        { student: studentsByYear['Y12 4U'][0]._id }
      ]),
      copyToNextTerm: false,
      isActive: true
    });
    console.log(`  - ${y12_4uClass.name}`);

    // Extra classes for TODAY (Wednesday) for testing attendance
    const todayY7Class = await Class.create({
      name: generateClassName('Jessica', 'Y7', 3, '10:00', 90),
      year: 'Y7',
      teacher: teacherJessica._id,
      classroom: classrooms[1]._id,
      term: term4._id,
      schedule: [{
        dayOfWeek: 3, // Wednesday (TODAY)
        startTime: '10:00',
        duration: 90
      }],
      students: [
        { student: studentsByYear.Y7[0]._id, joinedWeek: 1, schoolTestResults: '88% entry test' },
        { student: studentsByYear.Y7[1]._id, joinedWeek: 1, schoolTestResults: '92% entry test' }
      ],
      weeklyData: initWeeklyData(10, [
        { student: studentsByYear.Y7[0]._id },
        { student: studentsByYear.Y7[1]._id }
      ]),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${todayY7Class.name} [TODAY]`);

    // Build student list safely
    const todayY8Students = [];
    const todayY8WeeklyStudents = [];
    if (studentsByYear.Y8[1]) {
      todayY8Students.push({ student: studentsByYear.Y8[1]._id, joinedWeek: 1, schoolTestResults: '85%' });
      todayY8WeeklyStudents.push({ student: studentsByYear.Y8[1]._id });
    }
    if (studentsByYear.Y8[2]) {
      todayY8Students.push({ student: studentsByYear.Y8[2]._id, joinedWeek: 1, schoolTestResults: '90%' });
      todayY8WeeklyStudents.push({ student: studentsByYear.Y8[2]._id });
    }

    const todayY8Class = await Class.create({
      name: generateClassName('Michael', 'Y8', 3, '14:00', 120),
      year: 'Y8',
      teacher: teacherMichael._id,
      classroom: classrooms[2]._id,
      term: term4._id,
      schedule: [{
        dayOfWeek: 3, // Wednesday (TODAY)
        startTime: '14:00',
        duration: 120
      }],
      students: todayY8Students,
      weeklyData: initWeeklyData(10, todayY8WeeklyStudents),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${todayY8Class.name} [TODAY]`);

    // Build Y11 student list safely
    const todayY11Students = [];
    const todayY11WeeklyStudents = [];
    if (studentsByYear.Y11 && studentsByYear.Y11[0]) {
      todayY11Students.push({ student: studentsByYear.Y11[0]._id, joinedWeek: 1, schoolTestResults: '93% prelim exam' });
      todayY11WeeklyStudents.push({ student: studentsByYear.Y11[0]._id });
    }
    if (studentsByYear.Y11 && studentsByYear.Y11[1]) {
      todayY11Students.push({ student: studentsByYear.Y11[1]._id, joinedWeek: 1, schoolTestResults: '88% prelim exam' });
      todayY11WeeklyStudents.push({ student: studentsByYear.Y11[1]._id });
    }

    const todayY11Class = await Class.create({
      name: generateClassName('Sarah', 'Y11', 3, '16:30', 120),
      year: 'Y11',
      teacher: teacherSarah._id,
      classroom: classrooms[4]._id,
      term: term4._id,
      schedule: [{
        dayOfWeek: 3, // Wednesday (TODAY)
        startTime: '16:30',
        duration: 120
      }],
      students: todayY11Students,
      weeklyData: initWeeklyData(10, todayY11WeeklyStudents),
      copyToNextTerm: true,
      isActive: true
    });
    console.log(`  - ${todayY11Class.name} [TODAY]`);

    // Inactive class (archived)
    const inactiveClass = await Class.create({
      name: generateClassName('Sarah', 'Y9', 1, '18:00', 120),
      year: 'Y9',
      teacher: teacherSarah._id,
      classroom: classrooms[0]._id,
      term: term4._id,
      schedule: [{
        dayOfWeek: 1,
        startTime: '18:00',
        duration: 120
      }],
      students: [],
      weeklyData: [],
      copyToNextTerm: false,
      isActive: false
    });
    console.log(`  - ${inactiveClass.name} [Inactive]`);

    // Create Followups
    console.log('\n📋 Creating followups...');
    const followups = await Followup.insertMany([
      {
        issue: 'Update Year 9 curriculum for Term 2',
        solution: '',
        dueDate: new Date('2025-02-15'),
        isCompleted: false,
        createdBy: adminUser._id
      },
      {
        issue: 'Order new textbooks for Year 10',
        solution: 'Ordered from MathBooks Ltd',
        dueDate: new Date('2025-01-30'),
        isCompleted: true,
        completedAt: new Date('2025-01-25'),
        createdBy: adminUser._id
      },
      {
        issue: 'Review student progress reports',
        solution: '',
        dueDate: new Date('2025-02-01'),
        isCompleted: false,
        createdBy: adminUser._id
      },
      {
        issue: 'Schedule parent-teacher meetings',
        solution: '',
        dueDate: new Date('2025-02-10'),
        isCompleted: false,
        createdBy: adminUser._id
      },
      {
        issue: 'Contact John Smith about attendance',
        solution: '',
        dueDate: new Date('2025-01-31'),
        isCompleted: false,
        createdBy: teacherSarah._id
      },
      {
        issue: 'Prepare HSC practice papers',
        solution: '',
        dueDate: new Date('2025-02-20'),
        isCompleted: false,
        createdBy: teacherSarah._id
      },
      {
        issue: 'Fix broken projector in Room B',
        solution: 'Technician scheduled for Jan 29',
        dueDate: new Date('2025-01-29'),
        isCompleted: true,
        completedAt: new Date('2025-01-28'),
        createdBy: adminUser._id
      },
      {
        issue: 'Update website with new term dates',
        solution: '',
        dueDate: new Date('2025-02-05'),
        isCompleted: false,
        createdBy: adminUser._id
      }
    ]);
    console.log(`  - Created ${followups.length} followups`);

    // Create Detention Slots
    console.log('\n⏰ Creating detention slots...');
    const detentionSlots = [];
    const detentionRoom = classrooms.find(c => c.name === 'Detention Room');

    // Create detention slots for TODAY (for testing)
    const today = new Date();
    const todaySlot = await DetentionSlot.create({
      date: today,
      startTime: '15:00',
      endTime: '16:00',
      classroom: detentionRoom._id,
      capacity: detentionRoom.capacity,
      bookedCount: 0,
      createdBy: adminUser._id
    });
    detentionSlots.push(todaySlot);

    const todaySlot2 = await DetentionSlot.create({
      date: today,
      startTime: '16:00',
      endTime: '17:00',
      classroom: detentionRoom._id,
      capacity: detentionRoom.capacity,
      bookedCount: 0,
      createdBy: adminUser._id
    });
    detentionSlots.push(todaySlot2);

    // Create detention slots for next 2 weeks (Mon, Wed, Fri)
    const startDate = new Date('2025-02-03');
    for (let i = 0; i < 14; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dayOfWeek = currentDate.getDay();
      // Only Mon (1), Wed (3), Fri (5)
      if ([1, 3, 5].includes(dayOfWeek)) {
        const slot = await DetentionSlot.create({
          date: currentDate,
          startTime: '16:00',
          endTime: '17:00',
          classroom: detentionRoom._id,
          capacity: detentionRoom.capacity,
          bookedCount: 0,
          createdBy: adminUser._id
        });
        detentionSlots.push(slot);
      }
    }
    console.log(`  - Created ${detentionSlots.length} detention slots (including ${2} for TODAY)`);

    // Create some Detention records (class-based detentions)
    console.log('\n🚨 Creating detention records...');
    const detentions = [];

    // Create detention for Y8 student - assigned but not yet booked
    if (studentsByYear.Y8.length > 0 && y8Class1) {
      const detention1 = await Detention.create({
        class: y8Class1._id,
        student: studentsByYear.Y8[0]._id,
        week: 3,
        reason: 'Late to class 3 times',
        status: 'assigned',
        assignedBy: teacherSarah._id
      });
      detentions.push(detention1);
    }

    // Create detention for Y9 student - booked to a slot
    if (studentsByYear.Y9.length > 0 && y9Class1) {
      const detention2 = await Detention.create({
        class: y9Class1._id,
        student: studentsByYear.Y9[1]._id,
        week: 5,
        reason: 'Incomplete homework assignments',
        status: 'booked',
        bookedSlot: detentionSlots[1]._id,
        assignedBy: teacherMichael._id
      });
      detentions.push(detention2);

      // Update detention slot booked count
      detentionSlots[1].bookedCount = 1;
      await detentionSlots[1].save();
    }

    // Create detention for Y10 student - booked
    if (studentsByYear.Y10.length > 1 && y10Class1) {
      const detention3 = await Detention.create({
        class: y10Class1._id,
        student: studentsByYear.Y10[1]._id,
        week: 4,
        reason: 'Disruptive behavior in class',
        status: 'booked',
        bookedSlot: detentionSlots[0]._id,
        assignedBy: teacherSarah._id
      });
      detentions.push(detention3);

      detentionSlots[0].bookedCount = 1;
      await detentionSlots[0].save();
    }

    // Create a completed detention
    if (studentsByYear.Y8.length > 1 && y8Class1) {
      const completedDetention = await Detention.create({
        class: y8Class1._id,
        student: studentsByYear.Y8[1]._id,
        week: 2,
        reason: 'Missing homework',
        status: 'completed',
        bookedSlot: detentionSlots[detentionSlots.length - 1]._id,
        completionStatus: 'complete',
        assignedBy: teacherSarah._id
      });
      detentions.push(completedDetention);
    }

    // Create detentions for TODAY (for testing admin homepage)
    if (studentsByYear.Y7.length > 0 && todayY7Class) {
      const todayDetention1 = await Detention.create({
        class: todayY7Class._id,
        student: studentsByYear.Y7[0]._id,
        week: 5,
        reason: 'Talking during class',
        status: 'booked',
        bookedSlot: todaySlot._id,
        assignedBy: teacherJessica._id
      });
      detentions.push(todayDetention1);
      todaySlot.bookedCount = 1;
      await todaySlot.save();
    }

    if (studentsByYear.Y8.length > 2 && todayY8Class) {
      const todayDetention2 = await Detention.create({
        class: todayY8Class._id,
        student: studentsByYear.Y8[2]._id,
        week: 5,
        reason: 'Late homework submission',
        status: 'booked',
        bookedSlot: todaySlot._id,
        assignedBy: teacherMichael._id
      });
      detentions.push(todayDetention2);
      todaySlot.bookedCount = 2;
      await todaySlot.save();
    }

    if (studentsByYear.Y11.length > 1 && todayY11Class) {
      const todayDetention3 = await Detention.create({
        class: todayY11Class._id,
        student: studentsByYear.Y11[1]._id,
        week: 5,
        reason: 'Disrupting class',
        status: 'booked',
        bookedSlot: todaySlot2._id,
        assignedBy: teacherSarah._id
      });
      detentions.push(todayDetention3);
      todaySlot2.bookedCount = 1;
      await todaySlot2.save();
    }

    console.log(`  - Created ${detentions.length} detention records (including ${3} for TODAY)`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`👥 Users: ${createdUsers.length} total`);
    console.log(`   - Admins: ${createdUsers.filter(u => u.isAdmin && !u.isTeacher).length}`);
    console.log(`   - Teachers: ${createdUsers.filter(u => u.isTeacher).length}`);
    console.log(`   - Students: ${createdUsers.filter(u => u.isStudent).length} (${students.length} active)`);
    console.log(`📅 Terms: ${terms.length}`);
    console.log(`🏫 Classrooms: ${classrooms.length} (${classrooms.filter(c => c.isActive).length} active)`);
    console.log(`📚 Topics: ${topics.length} (across all year levels)`);
    console.log(`📝 Tests: ${tests.length}`);
    console.log(`📈 Progress Templates: 4 (Y6, Y8, Y10, Y12)`);
    console.log(`👨‍🏫 Classes: 17 (16 active, 1 inactive) - 4 classes happening TODAY (Wed)`);
    console.log(`📋 Followups: ${followups.length} (${followups.filter(f => !f.isCompleted).length} pending)`);
    console.log(`⏰ Detention Slots: ${detentionSlots.length} - 2 slots for TODAY`);
    console.log(`🚨 Detentions: ${detentions.length} (${detentions.filter(d => d.status === 'booked').length} booked, ${detentions.filter(d => d.status === 'completed').length} completed) - 3 for TODAY`);
    console.log('='.repeat(60));
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('='.repeat(60));
    console.log('\n👑 Admin Account:');
    console.log('  Email: admin@kmc.com');
    console.log('  Password: Kurt2389');
    console.log('\n👨‍🏫 Teacher/Admin Account (Recommended for Testing):');
    console.log('  Email: sarah@kmc.com');
    console.log('  Password: Teacher123');
    console.log('\n👨‍🏫 Other Teachers:');
    console.log('  Email: michael.chen@kmc.com | Password: Teacher123');
    console.log('  Email: jessica.lee@kmc.com | Password: Teacher123');
    console.log('\n👨‍🎓 Student Accounts (Sample):');
    console.log('  Y6: sophie.taylor@student.com | Password: Student123');
    console.log('  Y8: john.smith@student.com | Password: Student123');
    console.log('  Y10: emily.chen@student.com | Password: Student123');
    console.log('  Y12: david.lee@student.com | Password: Student123');
    console.log('  Y12 4U: sophia.martin@student.com | Password: Student123');
    console.log('\n💡 All student accounts use password: Student123');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
