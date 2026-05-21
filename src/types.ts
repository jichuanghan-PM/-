export interface SurveyAnswer {
  focusSector: string;           // Key concern / Sector (e.g., Chip, Bio-Pharm, SaaS, Manufacture)
  concernLevel: "Assets" | "Finance" | "Legal" | "Risk" | "All"; // Primary area
  aiRequirement: boolean;        // Whether AI features are enabled
  isConfigured: boolean;         // Setup completed flag
  surveyRole: "PM" | "Director" | "Legal" | "Advisor"; // Role playing
  hasCompletedSurvey: boolean;   // Survey sequence finished
}

export interface ChecklistItem {
  id: string;
  category: "资产和负债情况" | "经营和财务情况" | "法律关系" | "机会与潜在风险";
  title: string;
  description: string;
  importance: "高" | "中" | "低";
  status: "未开始" | "收集资料中" | "已收集待审计" | "已审核";
  assignee: string;
  sourceDocs: string[]; // Materials necessary to verify this item
  meetingNotes?: string; // Meeting/interview records log
  uploadedDocs?: string[]; // Logged document names
}

export interface DDProject {
  id: string;
  companyName: string;
  industry: string;
  targetAmount: string; // Intent investment amount
  leadPM: string;
  status: "立项中" | "现场尽调中" | "报告撰写中" | "投决会审核" | "已归档";
  completeness: number; // calculated progresspercentage
  riskLevel: "低" | "中" | "高";
  description: string;
  financialSummary?: string;
  coreAssets?: string;
  coreLiabilities?: string;
  checklists: ChecklistItem[];
}

export interface ArchivedDoc {
  id: string;
  projectId: string;
  fileName: string;
  category: "资产负债" | "经营财务" | "法律合规" | "风控与报告" | "其他";
  uploadDate: string;
  uploader: string;
  size: string;
  isVerified: boolean;
  notes?: string;
}

export interface BAComment {
  id: string;
  role: "user" | "ba";
  content: string;
  timestamp: string;
}
