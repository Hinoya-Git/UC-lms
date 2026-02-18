
import { Student, Course, SchoolEvent, Classroom, GateTap, Notification, CourseBlock } from './types';

export const UC_LOGO = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8_3vD4pEunwVvP-j4o8_Yq-X9w0W_p-n8-A&s";

export const MOCK_STUDENT: Student = {
  id: "2023-10492",
  name: "Alex Sterling",
  email: "alex.sterling@university.edu",
  major: "Computer Science & Artificial Intelligence",
  year: 3,
  gpa: 3.85,
  avatar: "https://picsum.photos/seed/alex/200/200",
  bio: "Passionate about machine learning and building accessible AI tools for students. Currently exploring quantum computing and its applications in data science.",
  birthdate: "2002-05-14",
  isOnline: true
};

const createBlocks = (year: number): CourseBlock[] => [
  { id: `b1-${Math.random()}`, section: `${year}A`, schedule: "Mon/Wed 08:00 AM - 09:30 AM", instructor: "Dr. Elena Vance", capacity: 40, enrolled: 38 },
  { id: `b2-${Math.random()}`, section: `${year}B`, schedule: "Tue/Thu 10:00 AM - 11:30 AM", instructor: "TBA", capacity: 40, enrolled: 12 },
  { id: `b3-${Math.random()}`, section: `${year}F`, schedule: "Mon/Wed 01:00 PM - 02:30 PM", instructor: "Prof. Silas Thorne", capacity: 40, enrolled: 40 }
];

export const MOCK_COURSES: Course[] = [
  { 
    id: "1", code: "CS301", name: "Data Structures & Algorithms", instructor: "Dr. Elena Vance", credits: 4, room: "U302", 
    pricePerUnit: 1550, description: "Advanced concepts in algorithms and complex data structures. Focuses on efficiency and practical implementation.",
    blocks: createBlocks(3),
    detailedInstructor: {
      name: "Dr. Elena Vance",
      email: "elena.vance@uc.edu.ph",
      photo: "https://i.pravatar.cc/150?u=elena",
      bio: "Ph.D. in Theoretical Computer Science. 15 years of industry experience in distributed systems."
    },
    modules: [
      { id: 'm1', title: 'Introduction to Big O', content: 'Big O notation is used to describe the complexity of an algorithm...' },
      { id: 'm2', title: 'Linked Lists & Stacks', content: 'A linked list is a linear collection of data elements...' }
    ],
    assignments: [
      { id: 'a1', title: 'Complexity Lab', status: 'submitted', score: 95, dueDate: '2024-03-20', type: 'file', submissionDate: '2024-03-18' },
      { id: 'a2', title: 'Recursive Sorts', status: 'near-due', dueDate: '2024-05-30', type: 'text' },
      { id: 'att', title: 'Daily Attendance', status: 'none', dueDate: 'Daily', type: 'text' }
    ],
    meetUrl: "https://meet.google.com/abc-defg-hij"
  },
  { 
    id: "2", code: "AI202", name: "Introduction to Machine Learning", instructor: "Prof. Silas Thorne", credits: 3, room: "U601", 
    pricePerUnit: 1800, description: "Fundamentals of predictive modeling and neural networks. Covers regression, classification, and clustering techniques.",
    blocks: createBlocks(2),
    detailedInstructor: {
      name: "Prof. Silas Thorne",
      email: "silas.thorne@uc.edu.ph",
      photo: "https://i.pravatar.cc/150?u=silas",
      bio: "Senior AI Researcher specializing in Neural Networks and Deep Learning."
    },
    modules: [
      { id: 'm1', title: 'Linear Regression', content: 'Linear regression is a linear approach to modeling the relationship...' }
    ],
    assignments: [
      { id: 'a1', title: 'Dataset Cleaning', status: 'missed', dueDate: '2024-04-01', type: 'file' }
    ],
    meetUrl: "https://zoom.us/j/123456789"
  },
  { id: "3", code: "MATH210", name: "Linear Algebra", instructor: "Dr. Sarah Chen", credits: 3, room: "M101", pricePerUnit: 1400, description: "Matrix theory and vector spaces for scientific computing.", blocks: createBlocks(2) },
  { id: "4", code: "HUM101", name: "Philosophy of Mind", instructor: "Prof. Julian Grey", credits: 3, room: "F201", pricePerUnit: 1200, description: "Exploring the nature of consciousness and cognitive theories.", blocks: createBlocks(1) },
  { id: "5", code: "PHYS201", name: "Quantum Mechanics I", instructor: "Dr. Robert Oppen", credits: 4, room: "S405", pricePerUnit: 1650, description: "Introduction to wave functions and quantum states.", blocks: createBlocks(2) }
];

export const MOCK_EVENTS: SchoolEvent[] = [
  { id: "e1", title: "Fall Career Fair", date: "2024-10-15", type: "Social", description: "Meet with top industry recruiters at the Main Gym." },
  { id: "e2", title: "Midterm Examinations", date: "2024-10-21", type: "Academic", description: "First batch of mid-semester evaluations." },
  { id: "e3", title: "Homecoming Weekend", date: "2024-11-02", type: "Social", description: "Alumni meetups and the annual varsity game." },
  { id: "e4", title: "Thanksgiving Break", date: "2024-11-25", type: "Holiday", description: "University closed for one week." }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Assignment Missed', message: 'You missed the deadline for "Data Structures Lab 4". Please contact Dr. Vance.', type: 'assignment', timestamp: '2 hours ago', read: false },
  { id: 'n2', title: 'New Assignment', message: 'Prof. Silas Thorne added "ML Project Phase 1" to AI202.', type: 'assignment', timestamp: '5 hours ago', read: false },
  { id: 'n3', title: 'Class Suspension', message: 'All classes suspended tomorrow due to the University Charter Day celebration.', type: 'suspension', timestamp: '1 day ago', read: false },
  { id: 'n4', title: 'Upcoming Event', message: 'Don\'t forget: The Fall Career Fair starts tomorrow at 9:00 AM.', type: 'event', timestamp: '1 day ago', read: true },
  { id: 'n5', title: 'Maintenance Notice', message: 'The EduNexus portal will undergo brief maintenance tonight at 11 PM.', type: 'system', timestamp: '2 days ago', read: true }
];

const generateClassrooms = (): Classroom[] => {
  const rooms: Classroom[] = [];
  const buildings = [
    { letter: 'U', floors: 10, roomsPerFloor: 6, codeFormat: (f: number, r: number) => `${f}${r.toString().padStart(2, '0')}` },
    { letter: 'M', floors: 4, roomsPerFloor: 7, codeFormat: (f: number, r: number) => `${f}${r.toString().padStart(2, '0')}` },
    { letter: 'N', floors: 10, roomsPerFloor: 6, codeFormat: (f: number, r: number) => `${f}${r.toString().padStart(3, '0')}` },
    { letter: 'S', floors: 6, roomsPerFloor: 9, codeFormat: (f: number, r: number) => `${f}${r.toString().padStart(2, '0')}` },
    { letter: 'G', floors: 5, roomsPerFloor: 6, codeFormat: (f: number, r: number) => `${f}${r.toString().padStart(2, '0')}` },
    { letter: 'F', floors: 10, roomsPerFloor: 6, codeFormat: (f: number, r: number) => `${f}${r.toString().padStart(2, '0')}` }
  ];

  const randomInstructors = ["Dr. Elena Vance", "Prof. Silas Thorne", "Dr. Sarah Chen", "Prof. Julian Grey", "Dr. Robert Oppen"];
  const randomCourses = ["CS301", "AI202", "MATH210", "HUM101", "PHYS201"];
  const randomEvents = ["Student Council Meeting", "Faculty Seminar", "Research Workshop", "Art Club Exhibition"];

  buildings.forEach(b => {
    for (let f = 1; f <= b.floors; f++) {
      for (let r = 1; r <= b.roomsPerFloor; r++) {
        const roomNum = b.codeFormat(f, r);
        const statusRand = Math.random();
        
        let status: 'Available' | 'In Use' | 'Cleaning' = 'Available';
        if (statusRand > 0.7) status = 'In Use';
        else if (statusRand > 0.5) status = 'Cleaning';

        let currentActivity;
        if (status === 'In Use') {
          const isEvent = Math.random() > 0.7;
          if (isEvent) {
            currentActivity = {
              type: 'event' as const,
              name: randomEvents[Math.floor(Math.random() * randomEvents.length)],
              timeRange: "10:30 AM - 12:00 PM"
            };
          } else {
            currentActivity = {
              type: 'class' as const,
              name: randomCourses[Math.floor(Math.random() * randomCourses.length)],
              instructor: randomInstructors[Math.floor(Math.random() * randomInstructors.length)],
              timeRange: "09:00 AM - 10:30 AM"
            };
          }
        }

        rooms.push({
          id: `${b.letter}-${roomNum}`,
          roomNumber: `${b.letter}${roomNum}`,
          building: `${b.letter} Building`,
          status: status,
          currentActivity: currentActivity,
          nextClass: status === 'Available' ? `${Math.floor(Math.random() * 12) + 1}:00 PM` : undefined
        });
      }
    }
  });

  return rooms;
};

export const MOCK_CLASSROOMS: Classroom[] = generateClassrooms();

export const MOCK_TAPS: GateTap[] = [
  { id: "t1", location: "Main Library Gate", timestamp: "2024-05-20 08:30 AM", status: "In" },
  { id: "t2", location: "Main Library Gate", timestamp: "2024-05-20 11:45 AM", status: "Out" },
  { id: "t3", location: "Main Library Gate", timestamp: "2024-05-20 01:15 PM", status: "In" },
  { id: "t4", location: "Main Library Gate", timestamp: "2024-05-20 04:30 PM", status: "Out" },
  { id: "t5", location: "Dormitory South", timestamp: "2024-05-20 09:15 PM", status: "In" },
  { id: "t6", location: "Computer Science Dept", timestamp: "2024-05-20 01:55 PM", status: "In" },
  { id: "t7", location: "University Gymnasium", timestamp: "2024-05-20 05:00 PM", status: "In" },
  { id: "t8", location: "Main Library Gate", timestamp: "2024-05-21 09:00 AM", status: "In" }
];
