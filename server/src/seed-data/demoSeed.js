// server/src/seed-data/demoSeed.js

// ---- STAFF ----
export const SEED_STAFF = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@groundfloorinteriors.co.za",
    role: "Senior Interior Designer",
    department: "Design",
    status: "active",
    join_date: "2022-02-01",
    phone: "0823456789",
    location: "Ballito, KwaZulu-Natal, South Africa",
    projects_active: 3, // e.g. Modern Penthouse Renovation, Family Home Makeover, Guest Bedroom Suite
    avatar_url: null,
  },
  {
    name: "Michael Chen",
    email: "michael.chen@groundfloorinteriors.co.za",
    role: "Project Manager",
    department: "Project Management",
    status: "active",
    join_date: "2021-09-15",
    phone: "0712345678",
    location: "Umhlanga, KwaZulu-Natal, South Africa",
    projects_active: 4, // all four seeded projects
    avatar_url: null,
  },
  {
    name: "Emma Rodriguez",
    email: "emma.rodriguez@groundfloorinteriors.co.za",
    role: "Interior Designer",
    department: "Design",
    status: "active",
    join_date: "2023-06-01",
    phone: "0734567890",
    location: "Salt Rock, KwaZulu-Natal, South Africa",
    projects_active: 2, // e.g. Boutique Hotel Lobby, Family Home Makeover
    avatar_url: null,
  },
  {
    name: "David Thompson",
    email: "david.thompson@groundfloorinteriors.co.za",
    role: "Draughtsman",
    department: "Technical & Draughting",
    status: "active",
    join_date: "2020-11-10",
    phone: "0722345678",
    location: "Durban North, KwaZulu-Natal, South Africa",
    projects_active: 1, // e.g. Corporate Office Refresh
    avatar_url: null,
  },
  {
    name: "Lisa Park",
    email: "lisa.park@groundfloorinteriors.co.za",
    role: "Admin / Support",
    department: "Admin & Support",
    status: "active",
    join_date: "2025-01-01",
    phone: "0329461234",
    location: "Ballito, KwaZulu-Natal, South Africa",
    projects_active: 4, // admin involved on all projects
    avatar_url: null,
  },
];

// ---- DASHBOARD ----
export const SEED_DASHBOARD_RECENT_ACTIVITY = [
  {
    id: 1,
    type: "task",
    title: "Living room 3D renders completed",
    user: "Sarah Johnson",
    time: "2 hours ago",
    priority: "high",
  },
  {
    id: 2,
    type: "file",
    title: "Material samples uploaded",
    user: "Michael Chen",
    time: "4 hours ago",
    priority: "medium",
  },
  {
    id: 3,
    type: "message",
    title: "Client approved kitchen design",
    user: "Emma Rodriguez",
    time: "6 hours ago",
    priority: "high",
  },
  {
    id: 4,
    type: "calendar",
    title: "Site visit scheduled",
    user: "David Thompson",
    time: "1 day ago",
    priority: "low",
  },
];

export const SEED_DASHBOARD_PROJECT_SUMMARY = [
  {
    name: "Modern Penthouse Renovation",
    client: "The Richardsons",
    progress: 75,
    status: "On Track",
    deadline: "Apr 15, 2025",
  },
  {
    name: "Boutique Hotel Lobby",
    client: "Luxe Hotels Group",
    progress: 45,
    status: "At Risk",
    deadline: "Jun 30, 2025",
  },
  {
    name: "Family Home Makeover",
    client: "The Johnsons",
    progress: 90,
    status: "Almost Done",
    deadline: "Mar 10, 2025",
  },
];

// ---- CLIENTS ----
export const SEED_CLIENTS = [
  {
    id: 1,
    name: "The Richardsons",
    contactPerson: "Margaret Richardson",
    email: "margaret@richardsonfamily.com",
    phone: "0821112233",
    address:
      "12 Zimbali Drive, Zimbali Estate, Ballito, 4420, KwaZulu-Natal, South Africa",
    company: "Private Residence",
    status: "Active",
    totalProjects: 2,
    currentProjects: 1,
    totalValue: "R185,000",
    joinDate: "2024-08-15",
    lastContact: "2025-03-01",
    notes:
      "High-end residential client in Ballito. Appreciates modern luxury design. Very detail-oriented and involved in the process.",
    industry: "Private Client",
    website: "",
  },
  {
    id: 2,
    name: "Luxe Hotels Group",
    contactPerson: "James Mitchell",
    email: "james.mitchell@luxehotels.co.za",
    phone: "0315556677",
    address:
      "1 Lagoon Drive, Umhlanga Rocks, 4320, KwaZulu-Natal, South Africa",
    company: "Luxe Hotels Group",
    status: "Active",
    totalProjects: 3,
    currentProjects: 2,
    totalValue: "R450,000",
    joinDate: "2024-11-20",
    lastContact: "2025-02-28",
    notes:
      "Premium hospitality client in Umhlanga. Focus on creating memorable guest experiences. Quick decision making.",
    industry: "Hospitality",
    website: "www.luxehotels.co.za",
  },
  {
    id: 3,
    name: "The Johnson Family",
    contactPerson: "Robert Johnson",
    email: "rjohnson@email.com",
    phone: "0832223344",
    address:
      "4 Hillside Road, Salt Rock, 4391, KwaZulu-Natal, South Africa",
    company: "Private Residence",
    status: "Completed",
    totalProjects: 1,
    currentProjects: 0,
    totalValue: "R75,000",
    joinDate: "2024-09-10",
    lastContact: "2025-01-15",
    notes:
      "Family-focused design project in Salt Rock. Emphasized functionality and child safety. Very satisfied with results.",
    industry: "Private Client",
    website: "",
  },
  {
    id: 4,
    name: "Metropolitan Office Complex",
    contactPerson: "Sarah Davis",
    email: "sarah.davis@metrooffice.co.za",
    phone: "0313014455",
    address:
      "95 KE Masinga Road, Durban, 4001, KwaZulu-Natal, South Africa",
    company: "Metropolitan Office Complex",
    status: "Prospect",
    totalProjects: 0,
    currentProjects: 0,
    totalValue: "R0",
    joinDate: "2025-02-20",
    lastContact: "2025-02-25",
    notes:
      "Large commercial client in Durban CBD. Looking for a complete office space redesign. Potential for multiple floors.",
    industry: "Commercial",
    website: "www.metrooffice.co.za",
  },
];

export const SEED_CLIENT_PROJECT_HISTORY = [
  {
    id: 1,
    clientId: 1,
    name: "Modern Penthouse Renovation",
    status: "In Progress",
    value: "R125,000",
    startDate: "2025-01-15",
    endDate: "2025-04-30",
    description:
      "Complete penthouse renovation with modern luxury finishes.",
  },
  {
    id: 2,
    clientId: 1,
    name: "Guest Bedroom Suite",
    status: "Completed",
    value: "R60,000",
    startDate: "2024-08-15",
    endDate: "2024-12-20",
    description: "Full guest bedroom and ensuite bathroom design.",
  },
  {
    id: 3,
    clientId: 2,
    name: "Boutique Hotel Lobby",
    status: "In Progress",
    value: "R280,000",
    startDate: "2024-12-01",
    endDate: "2025-05-15",
    description: "Luxury hotel lobby and reception area design.",
  },
];

export const SEED_CLIENT_COMMUNICATIONS = [
  {
    id: 1,
    clientId: 1,
    type: "Email",
    subject: "Penthouse Renovation - 3D Renders Ready",
    date: "2025-03-01",
    summary:
      "Sent latest 3D renders and material selections for review.",
  },
  {
    id: 2,
    clientId: 1,
    type: "Call",
    subject: "Design Consultation",
    date: "2025-01-15",
    summary:
      "Initial consultation, space assessment, and design preferences discussion.",
  },
  {
    id: 3,
    clientId: 2,
    type: "Meeting",
    subject: "Hotel Lobby Concept Presentation",
    date: "2025-02-28",
    summary:
      "In-person presentation of lobby design concepts and material palette.",
  },
];

// ---- PROJECTS ----
export const SEED_PROJECTS = [
  {
    // Modern Penthouse Renovation (Ballito / Zimbali)
    name: "Modern Penthouse Renovation",
    clientName: "The Richardsons",
    type: "Residential - High-End",
    rawStatus: "In Progress",
    progress: 75,
    budgetString: "R85,000",
    start_date: "2025-07-15",
    end_date: "2025-10-30",
    location: "Zimbali Estate, Ballito, KwaZulu-Natal, South Africa",
    description:
      "Complete interior renovation of a coastal penthouse with modern luxury design, custom millwork, and smart home integration.",
  },
  {
    // Boutique Hotel Lobby (Umhlanga)
    name: "Boutique Hotel Lobby",
    clientName: "Luxe Hotels Group",
    type: "Commercial - Hospitality",
    rawStatus: "Design Phase",
    progress: 35,
    budgetString: "R125,000",
    start_date: "2025-08-01",
    end_date: "2025-12-15",
    location: "Umhlanga Rocks, KwaZulu-Natal, South Africa",
    description:
      "Complete renovation of a hotel lobby, reception area, and guest lounge spaces with a modern boutique aesthetic.",
  },
  {
    // Family Home Makeover (Salt Rock)
    name: "Family Home Makeover",
    clientName: "The Johnson Family",
    type: "Residential - Family",
    rawStatus: "Material Selection",
    progress: 60,
    budgetString: "R55,000",
    start_date: "2025-07-20",
    end_date: "2025-11-10",
    location: "Salt Rock, KwaZulu-Natal, South Africa",
    description:
      "Open-concept living space renovation with a modern coastal aesthetic, custom built-ins, and kid-friendly materials.",
  },
  {
    // Corporate Office Refresh (Durban CBD)
    name: "Corporate Office Refresh",
    clientName: "Metropolitan Office Complex",
    type: "Commercial - Office",
    rawStatus: "Planning",
    progress: 20,
    budgetString: "R95,000",
    start_date: "2025-08-15",
    end_date: "2026-01-30",
    location: "Durban CBD, KwaZulu-Natal, South Africa",
    description:
      "Modern office space design with collaborative work areas, biophilic elements, and flexible meeting spaces.",
  },
];

// ---- TASKS ----
export const SEED_TASKS = [
  {
    title: "Create living room 3D renders",
    description:
      "Develop photorealistic 3D renders for the main living area",
    assignee: "Sarah Johnson",
    projectName: "Modern Penthouse Renovation",
    rawStatus: "In Progress",
    rawPriority: "High",
    due_date: "2025-03-10",
  },
  {
    title: "Source custom furniture pieces",
    description:
      "Find and quote custom dining table and chairs from local artisans",
    assignee: "Michael Chen",
    projectName: "Family Home Makeover",
    rawStatus: "Todo",
    rawPriority: "Medium",
    due_date: "2025-03-05",
  },
  {
    title: "Present color palette options",
    description:
      "Prepare presentation with 3 color scheme options for client review",
    assignee: "Emma Rodriguez",
    projectName: "Boutique Hotel Lobby",
    rawStatus: "In Review",
    rawPriority: "High",
    due_date: "2025-03-08",
  },
  {
    title: "Finalize bathroom tile selection",
    description:
      "Complete tile selection for master and guest bathrooms",
    assignee: "David Thompson",
    projectName: "Modern Penthouse Renovation",
    rawStatus: "Done",
    rawPriority: "High",
    due_date: "2025-03-01",
  },
];

// ---- EVENTS ----
export const SEED_EVENTS = [
  {
    // id: 1 in CalendarView
    title: "Client Design Consultation",
    date: "2025-03-05", // March 5, 2025
    type: "meeting",
    projectName: "Modern Penthouse Renovation",
    attendees: ["Sarah Johnson", "Michael Chen", "Emma Rodriguez"],
    time: "10:00", // 10:00 AM
  },
  {
    // id: 2
    title: "3D Render Review",
    date: "2025-03-10",
    type: "review",
    projectName: "Modern Penthouse Renovation",
    attendees: ["Sarah Johnson", "David Thompson"],
    time: "14:00", // 2:00 PM
  },
  {
    // id: 3
    title: "Material Selection Presentation",
    date: "2025-03-15",
    type: "presentation",
    projectName: "Boutique Hotel Lobby",
    attendees: ["Emma Rodriguez", "Sarah Johnson"],
    time: "11:00",
  },
  {
    // id: 4
    title: "Site Measurement Visit",
    date: "2025-03-08",
    type: "planning",
    projectName: "Family Home Makeover",
    attendees: ["Michael Chen", "David Thompson", "Lisa Park"],
    time: "09:00",
  },
  {
    // id: 5
    title: "Installation Completion",
    date: "2025-03-20",
    type: "deadline",
    projectName: "Modern Penthouse Renovation",
    attendees: [],
    time: "17:00", // End of day
  },
];

// ---- FILES ----
export const SEED_FILES = [
  {
    name: "Living_Room_3D_Render_v3.blend",
    type: "design",
    sizeLabel: "18.4 MB",
    sizeBytes: 18.4 * 1024 * 1024, // rough conversion
    projectName: "Modern Penthouse Renovation",
    uploadedBy: "Sarah Johnson",
    uploadDate: "2025-03-02",
    version: "3.0",
    status: "Latest",
    description:
      "Final living room 3D render with lighting adjustments.",
  },
  {
    name: "Material_Specifications.pdf",
    type: "document",
    sizeLabel: "4.2 MB",
    sizeBytes: 4.2 * 1024 * 1024,
    projectName: "Modern Penthouse Renovation",
    uploadedBy: "Michael Chen",
    uploadDate: "2025-02-28",
    version: "2.1",
    status: "Latest",
    description:
      "Complete material specifications and supplier details.",
  },
  {
    name: "Color_Palette_Guide.pdf",
    type: "document",
    sizeLabel: "6.7 MB",
    sizeBytes: 6.7 * 1024 * 1024,
    projectName: "Boutique Hotel Lobby",
    uploadedBy: "Emma Rodriguez",
    uploadDate: "2025-03-01",
    version: "1.0",
    status: "Latest",
    description:
      "Comprehensive color palette and material guide.",
  },
  {
    name: "Floor_Plan_Draft.dwg",
    type: "design",
    sizeLabel: "3.2 MB",
    sizeBytes: 3.2 * 1024 * 1024,
    projectName: "Family Home Makeover",
    uploadedBy: "David Thompson",
    uploadDate: "2025-02-25",
    version: "1.5",
    status: "Archived",
    description:
      "Initial floor plan layout - superseded by v2.0.",
  },
  {
    name: "Design_Walkthrough.mp4",
    type: "video",
    sizeLabel: "67.8 MB",
    sizeBytes: 67.8 * 1024 * 1024,
    projectName: "Modern Penthouse Renovation",
    uploadedBy: "Lisa Park",
    uploadDate: "2025-03-03",
    version: "1.0",
    status: "Latest",
    description:
      "Virtual walkthrough for client presentation.",
  },
  {
    name: "Furniture_Catalog.zip",
    type: "archive",
    sizeLabel: "45.4 MB",
    sizeBytes: 45.4 * 1024 * 1024,
    projectName: "Boutique Hotel Lobby",
    uploadedBy: "Lisa Park",
    uploadDate: "2025-02-29",
    version: "1.2",
    status: "Latest",
    description:
      "Complete furniture catalog with dimensions and pricing.",
  },
];

// --- MESSAGES  ---
export const SEED_MESSAGE_CHANNELS = [
  {
    id: 1,
    name: "general",
    type: "public",
    description: "General team discussions",
    unreadCount: 3,
    lastMessage: "Great work on the 3D renders!",
    lastActivity: "2 hours ago",
  },
  {
    id: 2,
    name: "penthouse-renovation",
    type: "project",
    description: "Modern Penthouse Renovation project",
    unreadCount: 7,
    lastMessage: "Client approved the material samples",
    lastActivity: "30 mins ago",
  },
  {
    id: 3,
    name: "hotel-lobby",
    type: "project",
    description: "Boutique Hotel Lobby design team",
    unreadCount: 2,
    lastMessage: "Site visit scheduled for tomorrow",
    lastActivity: "1 hour ago",
  },
  {
    id: 4,
    name: "design-team",
    type: "team",
    description: "Interior design team discussions",
    unreadCount: 0,
    lastMessage: "New furniture catalog uploaded",
    lastActivity: "3 hours ago",
  },
];

export const SEED_MESSAGES = [
  {
    id: 1,
    channelId: 1,
    user: "Sarah Johnson",
    message:
      "Hey team! I've just uploaded the latest living room 3D renders to the files section. Would love to get everyone's feedback before we present to the Richardsons tomorrow.",
    timestamp: "10:30 AM",
    date: "Today",
    isOwn: false,
  },
  {
    id: 2,
    channelId: 1,
    user: "Michael Chen",
    message:
      "Looks stunning! The new lighting really highlights the feature wall beautifully. Just one suggestion - maybe we could adjust the accent lighting behind the sofa for more warmth?",
    timestamp: "10:35 AM",
    date: "Today",
    isOwn: false,
  },
  {
    id: 3,
    channelId: 1,
    user: "You",
    message:
      "Great point Michael! I'll adjust the lighting temperature right now. Sarah, should I also update the material textures to match the latest samples we received?",
    timestamp: "10:37 AM",
    date: "Today",
    isOwn: true,
  },
  {
    id: 4,
    channelId: 1,
    user: "Emma Rodriguez",
    message:
      "Perfect timing! I was just reviewing the material palette. Yes, the new marble samples have a slightly different veining pattern that should be reflected in the renders.",
    timestamp: "10:40 AM",
    date: "Today",
    isOwn: false,
  },
  {
    id: 5,
    channelId: 1,
    user: "David Thompson",
    message:
      "Excellent work everyone! ✨ The Richardsons are going to be thrilled. I've also prepared the material specification sheets to accompany the presentation.",
    timestamp: "10:45 AM",
    date: "Today",
    isOwn: false,
  },
];

export const SEED_MESSAGE_TEAM_MEMBERS = [
  { name: "Sarah Johnson", status: "online", role: "Senior Interior Designer" },
  { name: "Michael Chen", status: "online", role: "Project Manager" },
  { name: "Emma Rodriguez", status: "away", role: "Interior Designer" },
  { name: "David Thompson", status: "online", role: "Draughtsman" },
  { name: "Lisa Park", status: "online", role: "Admin / Support" },
];
