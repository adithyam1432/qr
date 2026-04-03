export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface EmergencyProfile {
  uid: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
  allergies: string[];
  medications: string[];
  medicalHistory: string;
  firstAidInstructions?: string;
  emergencyContacts: EmergencyContact[];
  isPublic?: boolean;
  updatedAt: string;
}
