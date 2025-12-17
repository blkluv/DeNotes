type SimpleAdvisorNote = {
  cid: string;
  meetingTitle: string;
  meetingDate: string;
  clientName: string;
  advisorName: string;
  
  // Core content
  summary: string;
  recommendations: string[];
  disclosures: string[];
  nextSteps: string[];
  
  // Compliance
  complianceRule: 'FINRA_2111' | 'SEC_REG_BI' | 'FIDUCIARY' | 'OTHER';
  complianceSatisfied: boolean;
  
  // Signatures
  advisorSigned: boolean;
  clientAcknowledged: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Status
  status: 'draft' | 'signed' | 'archived';
};

export default SimpleAdvisorNote;