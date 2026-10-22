export interface User {
  id: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Loan {
  id: string;
  userId: string;
  friendName: string;
  amount: string;
  dueDate: string;
  status: "PENDING" | "REPAID";
  isOverdue: boolean;
  repaidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Summary {
  totalLent: string;
  totalRepaid: string;
  overdueAmount: string;
  currency: string;
}

export interface ApiError {
  code: string;
  message: string;
}
