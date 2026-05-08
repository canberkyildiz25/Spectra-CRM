// User/Customer Types
export interface ICustomer {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  status: 'prospect' | 'customer' | 'inactive';
  source?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Opportunity/Deal Types
export interface IOpportunity {
  _id?: string;
  title: string;
  customerId: string;
  amount: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate?: Date;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Task Types
export interface ITask {
  _id?: string;
  title: string;
  description?: string;
  assignedTo: string;
  relatedTo: {
    type: 'customer' | 'opportunity' | 'general';
    id?: string;
  };
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// User/Auth Types
export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: IUser;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
