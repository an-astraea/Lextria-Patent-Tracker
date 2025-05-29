import {
  BarChart3,
  FileText,
  Settings,
  User,
  Users,
  Calendar,
  CheckSquare,
  ClipboardList,
  ListChecks,
  Mailbox,
  ScrollText,
  File,
  LucideIcon,
  LayoutDashboard,
  Contact2,
  Scale,
  FileSearch2,
  FilePlus2,
  FolderKanban,
  BadgeCheck,
  AlertTriangle,
  AlertCircle,
  Clock4,
  AlertOctagon
} from "lucide-react"

import {
  Employee,
  Patent,
  PatentReminder,
  StagnantPatent,
} from "@/lib/types"

type Route = {
  label: string
  icon: LucideIcon
  color: string
}

/**
 *  Supplies data for the dashboard
 */
export const routes: Route[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "bg-green-500",
  },
  {
    label: "Patents",
    icon: FileText,
    color: "bg-violet-500",
  },
  {
    label: "Employees",
    icon: Users,
    color: "bg-sky-500",
  },
  {
    label: "Clients",
    icon: Contact2,
    color: "bg-orange-500",
  },
  {
    label: "FER",
    icon: ScrollText,
    color: "bg-yellow-500",
  },
  {
    label: "Forms",
    icon: File,
    color: "bg-pink-500",
  },
  {
    label: "Approvals",
    icon: CheckSquare,
    color: "bg-blue-500",
  },
  {
    label: "Calendar",
    icon: Calendar,
    color: "bg-rose-500",
  },
  {
    label: "Settings",
    icon: Settings,
    color: "bg-gray-500",
  },
]

/**
 *  Supplies data for the reminders section
 */
type Reminder = {
  title: string
  description: string
  variant: "default" | "destructive" | "warning" | "success"
}

export const reminders: Reminder[] = [
  {
    title: "Patent application deadline approaching",
    description: "The deadline for patent application #12345 is in 7 days.",
    variant: "warning",
  },
  {
    title: "Follow up with client",
    description: "Send a follow-up email to client regarding additional information.",
    variant: "default",
  },
  {
    title: "Payment overdue",
    description: "Payment for invoice #67890 is overdue. Contact client immediately.",
    variant: "destructive",
  },
  {
    title: "Draft ready for review",
    description: "Draft for patent #54321 is ready for review. Assign a reviewer.",
    variant: "success",
  },
]

/**
 *  Supplies data for the timeline section
 */
type TimelineItem = {
  title: string
  date: string
  description: string
  status: "complete" | "pending" | "overdue"
}

export const timelineData: TimelineItem[] = [
  {
    title: "Patent application filed",
    date: "2024-03-15",
    description: "Patent application #12345 has been successfully filed.",
    status: "complete",
  },
  {
    title: "Drafting in progress",
    date: "2024-03-22",
    description: "Drafting for patent #54321 is currently in progress.",
    status: "pending",
  },
  {
    title: "Client meeting",
    date: "2024-03-29",
    description: "Scheduled meeting with client to discuss patent details.",
    status: "overdue",
  },
  {
    title: "Review completed",
    date: "2024-04-05",
    description: "Review for patent #98765 has been completed.",
    status: "complete",
  },
]

/**
 *  Supplies data for the mock patents
 */
export const mockPatents: Patent[] = [
  {
    id: "1",
    tracking_id: "PT001",
    patent_applicant: "ABC Corp",
    client_id: "CL001",
    application_no: "APP001",
    date_of_filing: "2024-01-01",
    patent_title: "Innovative Widget",
    applicant_addr: "123 Main St, Anytown",
    inventor_ph_no: "+15551234567",
    inventor_email: "inventor@example.com",
    ps_drafting_status: 1,
    ps_drafter_assgn: "EMP002",
    ps_drafter_deadline: "2024-02-01",
    ps_review_draft_status: 0,
    ps_filing_status: 0,
    ps_filer_assgn: "EMP003",
    ps_filer_deadline: "2024-03-01",
    ps_review_file_status: 0,
    ps_completion_status: 0,
    cs_drafting_status: 1,
    cs_drafter_assgn: "EMP004",
    cs_drafter_deadline: "2024-04-01",
    cs_review_draft_status: 0,
    cs_filing_status: 0,
    cs_filer_assgn: "EMP005",
    cs_filer_deadline: "2024-05-01",
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 0,
    form_1: true,
    form_2: false,
    form_3: true,
    form_4: false,
    form_5: true,
    form_6: false,
    form_7: true,
    form_7a: false,
    form_8: true,
    form_8a: false,
    form_9: true,
    form_9a: false,
    completed: false,
    withdrawn: false,
  },
  {
    id: "2",
    tracking_id: "PT002",
    patent_applicant: "XYZ Ltd",
    client_id: "CL002",
    application_no: "APP002",
    date_of_filing: "2024-02-15",
    patent_title: "Advanced Gadget",
    applicant_addr: "456 Oak St, Othertown",
    inventor_ph_no: "+15559876543",
    inventor_email: "inventor2@example.com",
    ps_drafting_status: 0,
    ps_drafter_assgn: "EMP001",
    ps_drafter_deadline: "2024-03-15",
    ps_review_draft_status: 1,
    ps_filing_status: 0,
    ps_filer_assgn: "EMP004",
    ps_filer_deadline: "2024-04-15",
    ps_review_file_status: 0,
    ps_completion_status: 0,
    cs_drafting_status: 0,
    cs_drafter_assgn: "EMP003",
    cs_drafter_deadline: "2024-05-15",
    cs_review_draft_status: 1,
    cs_filing_status: 0,
    cs_filer_assgn: "EMP002",
    cs_filer_deadline: "2024-06-15",
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 0,
    form_1: false,
    form_2: true,
    form_3: false,
    form_4: true,
    form_5: false,
    form_6: true,
    form_7: false,
    form_7a: true,
    form_8: false,
    form_8a: true,
    form_9: false,
    form_9a: true,
    completed: false,
    withdrawn: false,
  },
  {
    id: "3",
    tracking_id: "PT003",
    patent_applicant: "Tech Solutions",
    client_id: "CL003",
    application_no: "APP003",
    date_of_filing: "2024-03-01",
    patent_title: "Digital Platform",
    applicant_addr: "789 Pine St, Hilltop",
    inventor_ph_no: "+15555555555",
    inventor_email: "inventor3@example.com",
    ps_drafting_status: 0,
    ps_drafter_assgn: "EMP005",
    ps_drafter_deadline: "2024-04-01",
    ps_review_draft_status: 0,
    ps_filing_status: 1,
    ps_filer_assgn: "EMP001",
    ps_filer_deadline: "2024-05-01",
    ps_review_file_status: 0,
    ps_completion_status: 0,
    cs_drafting_status: 0,
    cs_drafter_assgn: "EMP002",
    cs_drafter_deadline: "2024-06-01",
    cs_review_draft_status: 0,
    cs_filing_status: 1,
    cs_filer_assgn: "EMP003",
    cs_filer_deadline: "2024-07-01",
    cs_review_file_status: 0,
    cs_completion_status: 0,
    fer_status: 0,
    form_1: true,
    form_2: true,
    form_3: true,
    form_4: true,
    form_5: true,
    form_6: true,
    form_7: true,
    form_7a: true,
    form_8: true,
    form_8a: true,
    form_9: true,
    form_9a: true,
    completed: false,
    withdrawn: false,
  },
]

/**
 *  Supplies data for the mock employees
 */
export const mockEmployees: Employee[] = [
  {
    id: "1",
    emp_id: "EMP001",
    full_name: "John Smith",
    email: "john@company.com",
    ph_no: "+1234567890",
    role: "admin",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    emp_id: "EMP002",
    full_name: "Jane Doe",
    email: "jane@company.com",
    ph_no: "+1234567891",
    role: "drafter",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    emp_id: "EMP003",
    full_name: "Mike Johnson",
    email: "mike@company.com",
    ph_no: "+1234567892",
    role: "reviewer", // Changed from 'filer' to 'reviewer'
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "4",
    emp_id: "EMP004",
    full_name: "Sarah Wilson",
    email: "sarah@company.com",
    ph_no: "+1234567893",
    role: "admin", // Changed from 'filer' to 'admin'
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "5",
    emp_id: "EMP005",
    full_name: "Robert Brown",
    email: "robert@company.com",
    ph_no: "+1234567894",
    role: "drafter",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

/**
 *  Supplies data for the mock reminders
 */
export const mockReminders: PatentReminder[] = [
  {
    id: "reminder1",
    patent_id: "1",
    reminder_type: "stage_stagnant",
    stage_name: "Drafting",
    days_stagnant: 15,
    created_at: "2024-03-01T12:00:00Z",
    patent: mockPatents[0],
  },
  {
    id: "reminder2",
    patent_id: "2",
    reminder_type: "follow_up_needed",
    stage_name: "Filing",
    days_stagnant: 30,
    created_at: "2024-02-15T08:00:00Z",
    patent: mockPatents[1],
  },
  {
    id: "reminder3",
    patent_id: "3",
    reminder_type: "unresponsive",
    stage_name: "Review",
    days_stagnant: 60,
    created_at: "2024-01-01T18:00:00Z",
    patent: mockPatents[2],
  },
]

/**
 *  Supplies data for the mock stagnant patents
 */
export const mockStagnantPatents: StagnantPatent[] = [
  {
    patent: mockPatents[0],
    days_stagnant: 15,
    current_stage: "Drafting",
    reminders: [mockReminders[0]],
  },
  {
    patent: mockPatents[1],
    days_stagnant: 30,
    current_stage: "Filing",
    reminders: [mockReminders[1]],
  },
  {
    patent: mockPatents[2],
    days_stagnant: 60,
    current_stage: "Review",
    reminders: [mockReminders[2]],
  },
]
