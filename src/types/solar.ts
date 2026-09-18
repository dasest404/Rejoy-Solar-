export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'Sales Manager'
  | 'Sales Executive'
  | 'Site Survey Engineer'
  | 'Civil Team'
  | 'Structure Team'
  | 'Installation Team'
  | 'Electrical Team'
  | 'Project Manager'
  | 'Accountant'
  | 'HR Manager'
  | 'Service Manager'
  | 'Technician'
  | 'Customer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  department?: string;
  designation?: string;
  customerId?: string; // If customer role
  assignedProjects?: string[];
}

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'SITE SURVEY'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export interface Lead {
  id: string;
  customerName: string;
  companyName?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  solarCapacityKw: number;
  estimatedValue: number;
  source: 'Website' | 'Referral' | 'Exhibition' | 'Direct Call' | 'Agent' | string;
  assignedSalespersonId?: string;
  assignedSalespersonName?: string;
  assignedToId?: string;
  assignedToName?: string;
  status: LeadStatus;
  notes: string;
  nextFollowUpDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export type CustomerType = 'Industrial' | 'Commercial' | 'Residential' | 'Agricultural';
export type CustomerStatus = 'ACTIVE' | 'COMPLETED' | 'ON HOLD' | 'CANCELLED';

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  customerType: CustomerType;
  phone: string;
  email: string;
  siteAddress: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  electricityConsumerNo?: string;
  sanctionedLoadKw?: number;
  status: CustomerStatus;
  activeProjectId?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkflowStageKey =
  | 'site_survey'
  | 'customer_confirmation'
  | 'structure_fabrication'
  | 'civil_work'
  | 'lightning_arrestor'
  | 'cdc_earthing'
  | 'earthing_pits'
  | 'solar_installation'
  | 'inverter_installation'
  | 'meter_synchronisation'
  | 'inverter_wifi_pairing'
  | 'acdb_dcdb_fixing'
  | 'ac_side_electrical'
  | 'final_verification'
  | 'final_handover'
  | 'service_amc';

export type StageStatus =
  | 'NOT STARTED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN PROGRESS'
  | 'WAITING'
  | 'SUBMITTED'
  | 'UNDER REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'OVERDUE';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ChecklistItem {
  id: string;
  title: string;
  label?: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface PhotoAttachment {
  id: string;
  url: string;
  caption: string;
  type?: 'BEFORE' | 'DURING' | 'AFTER' | 'DOCUMENT';
  uploadedAt: string;
  uploadedBy: string;
  gpsCoordinates?: string;
  gps?: {
    latitude: number;
    longitude: number;
    locationName?: string;
  };
}

export interface StageDocument {
  id: string;
  name: string;
  url: string;
  fileType: string;
  sizeMb: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface StageActivity {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details?: string;
}

export interface ProjectStage {
  id: string;
  stageKey: WorkflowStageKey;
  title: string;
  order: number;
  department: string;
  assignedRole: UserRole;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  assignedToName?: string;
  status: StageStatus;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  completedDate?: string;
  checklist: ChecklistItem[];
  photos: PhotoAttachment[];
  documents: StageDocument[];
  gpsLocation?: {
    latitude: number;
    longitude: number;
    locationName: string;
    capturedAt: string;
  };
  comments?: string;
  description?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalDate?: string;
  approvalRemarks?: string;
  rejectionReason?: string;
  activities: StageActivity[];
}

export type ProjectStatus =
  | 'PLANNING'
  | 'SURVEY'
  | 'DESIGN & APPROVALS'
  | 'CIVIL & STRUCTURE'
  | 'INSTALLATION'
  | 'TESTING & COMMISSIONING'
  | 'HANDOVER'
  | 'COMPLETED'
  | 'DELAYED'
  | 'ON HOLD';

export interface SolarProject {
  id: string;
  projectCode: string;
  customerId: string;
  customerName: string;
  title: string;
  capacityKw: number;
  totalValue: number;
  status: ProjectStatus;
  currentStageKey: WorkflowStageKey;
  completionPercentage: number;
  projectManagerId: string;
  projectManagerName: string;
  siteAddress: string;
  city: string;
  location?: string;
  inverterModel?: string;
  panelModel?: string;
  structureType?: string;
  progressPercentage?: number;
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  stages: ProjectStage[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSurveyData {
  id: string;
  projectId: string;
  customerId: string;
  engineerId: string;
  engineerName: string;
  surveyDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  siteAddress: string;
  gps: {
    latitude: number;
    longitude: number;
    locationName: string;
  };
  roofType: 'RCC Flat' | 'Metal Sheet Tin' | 'Tiled Roof' | 'Ground Mount';
  roofAreaSqFt: number;
  shadowFreeAreaSqFt: number;
  shadowObstacles: string;
  electricityBillNumber: string;
  monthlyAverageConsumptionUnits: number;
  sanctionedLoadKw: number;
  tariffRatePerUnit: number;
  existingStructureCondition: string;
  recommendedCapacityKw: number;
  feasibilityScore: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'NOT FEASIBLE';
  photos: PhotoAttachment[];
  notes: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface QuotationItem {
  id: string;
  category: 'Panels' | 'Inverter' | 'Structure' | 'Civil Work' | 'Electrical' | 'Installation' | 'Net Metering' | 'Other';
  description: string;
  makeModel: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  projectId?: string;
  capacityKw: number;
  ratePerWp?: number;
  baseAmount?: number;
  taxAmount?: number;
  validTill?: string;
  panelBrand?: string;
  inverterBrand?: string;
  structureType?: string;
  items?: QuotationItem[];
  subtotal?: number;
  discountAmount?: number;
  gstPercent?: number;
  gstAmount?: number;
  totalAmount: number;
  paymentTerms?: string;
  warrantyDetails?: string;
  termsAndConditions?: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  validUntil?: string;
  createdAt: string;
  acceptedAt?: string;
}

export type PaymentMilestoneType = 'Advance' | 'Civil/Structure' | 'Installation' | 'Testing/Commissioning' | 'Final Handover';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  projectId: string;
  customerId: string;
  customerName: string;
  milestone: PaymentMilestoneType;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  paymentMode?: 'Bank NEFT/RTGS' | 'UPI' | 'Cheque' | 'Credit Card' | 'Cash';
  transactionReference?: string;
  notes?: string;
  tallySyncStatus: 'NOT SYNCED' | 'SYNCING' | 'SYNCED' | 'FAILED';
  tallyReference?: string;
}

export interface ExpenseRecord {
  id: string;
  expenseNumber: string;
  projectId?: string;
  projectCode?: string;
  vendorName: string;
  category: 'Material - Solar Panels' | 'Material - Inverter' | 'Material - Cables & BOS' | 'Civil Raw Materials' | 'Structure Steel' | 'Labor & Contractors' | 'Transport & Logistics' | 'Travel & Food' | 'Government Permits' | 'Tools & Safety';
  amount: number;
  date: string;
  paymentMode: string;
  referenceNo: string;
  notes: string;
  receiptUrl?: string;
  approvedBy?: string;
  tallySyncStatus: 'NOT SYNCED' | 'SYNCING' | 'SYNCED' | 'FAILED';
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  photoUrl: string;
  department: 'Management' | 'Sales' | 'Engineering' | 'Civil' | 'Structure' | 'Electrical' | 'Operations' | 'Finance' | 'HR' | 'Service' | 'Installation';
  designation: string;
  phone: string;
  email: string;
  joiningDate: string;
  salaryMonthly: number;
  status: 'ACTIVE' | 'ON LEAVE' | 'IN FIELD' | 'TERMINATED';
  currentSiteLocation?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  gpsCheckIn?: {
    latitude: number;
    longitude: number;
    locationName: string;
  };
  checkInGps?: string | {
    latitude: number;
    longitude: number;
    locationName: string;
  };
  siteLocation?: string;
  gpsCheckOut?: {
    latitude: number;
    longitude: number;
    locationName: string;
  };
  siteProjectId?: string;
  siteProjectTitle?: string;
  status: 'PRESENT' | 'LATE' | 'HALF DAY' | 'FIELD VISIT' | 'ABSENT';
}

export interface AdditionalExpenseItem {
  id: string;
  description: string;
  amount: number;
}

export interface DeductionItem {
  id: string;
  description: string;
  amount: number;
}

export interface Payslip {
  id: string;
  payslipNumber: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  month: string; // e.g. "September 2026"
  generatedDate: string;
  
  // Fixed earnings (pre-filled from employee record, read-only)
  baseSalary: number;
  
  // Variable earnings
  overtimeType: 'CALCULATED' | 'DIRECT';
  overtimeHours?: number;
  overtimeRatePerHour?: number;
  overtimeAmount: number;
  
  additionalExpenses: AdditionalExpenseItem[];
  totalAdditionalExpenses: number;
  
  // Deductions
  deductions: DeductionItem[];
  totalDeductions: number;
  
  // Calculations
  grossEarnings: number; // baseSalary + overtimeAmount + totalAdditionalExpenses
  netPay: number; // grossEarnings - totalDeductions
  
  status: 'DRAFT' | 'GENERATED' | 'PAID';
  paymentDate?: string;
  paymentMode?: 'NEFT/RTGS Bank Transfer' | 'Cheque' | 'Cash' | 'UPI';
  bankReferenceNo?: string;
  notes?: string;
}

export type HolidayType =
  | 'NATIONAL'
  | 'REGIONAL'
  | 'FESTIVAL'
  | 'COMPANY'
  | 'OPTIONAL';

export interface HolidayRecord {
  id: string;
  name: string;
  date: string; // ISO date: YYYY-MM-DD
  type: HolidayType;
  description?: string;
  isOptional: boolean;
  applicableDepartments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface ServiceTicket {
  id: string;
  ticketId: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectTitle?: string;
  issue: string;
  category: string;
  priority: Priority;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  assignedToName?: string;
  status: 'OPEN' | 'ASSIGNED' | 'VISIT SCHEDULED' | 'IN PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdDate?: string;
  createdAt?: string;
  scheduledDate?: string;
  visitScheduledDate?: string;
  resolvedDate?: string;
  notes?: string;
  photos?: PhotoAttachment[];
}

export interface AMCContract {
  id: string;
  amcCode: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectTitle: string;
  planName: 'Gold Preventive (4 Visits/Yr)' | 'Silver Essential (2 Visits/Yr)' | 'Platinum Comprehensive (Monthly)';
  startDate: string;
  endDate: string;
  renewalDate: string;
  annualAmount: number;
  visitsCompleted: number;
  totalVisits: number;
  status: 'ACTIVE' | 'EXPIRED' | 'UPCOMING RENEWAL';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  timestamp: string;
  read: boolean;
  linkType?: 'PROJECT' | 'LEAD' | 'PAYMENT' | 'SERVICE' | 'SURVEY';
  linkId?: string;
  customerId?: string;
  projectId?: string;
  projectName?: string;
}

export interface SystemSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyGst: string;
  logoUrl?: string;
  currencySymbol: string;
  taxRatePercent: number;
  tallyServerUrl: string;
  tallyCompany: string;
  tallyStatus: 'NOT CONFIGURED' | 'CONFIGURED' | 'CONNECTED';
  whatsAppStatus: 'NOT CONFIGURED' | 'SANDBOX_READY' | 'CONNECTED';
  whatsAppApiKey?: string;
  whatsAppPhoneNumberId?: string;
  whatsAppPhoneId?: string;
}
