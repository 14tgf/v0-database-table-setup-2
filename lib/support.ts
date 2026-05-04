export interface SupportTicket {
  id: string;
  subject: string;
  category: 'Account Access' | 'Deposits' | 'Withdrawals' | 'Investments' | 'Portfolio' | 'KYC Verification' | 'Security' | 'Technical Issue' | 'Billing' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Waiting for User' | 'Resolved' | 'Closed';
  message: string;
  attachment?: string;
  createdAt: Date;
  updatedAt: Date;
  lastUpdated?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const TICKET_CATEGORIES = [
  'Account Access',
  'Deposits',
  'Withdrawals',
  'Investments',
  'Portfolio',
  'KYC Verification',
  'Security',
  'Technical Issue',
  'Billing',
  'Other',
];

export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const TICKET_STATUSES = [
  { label: 'Open', color: 'text-blue-400' },
  { label: 'In Progress', color: 'text-yellow-400' },
  { label: 'Waiting for User', color: 'text-orange-400' },
  { label: 'Resolved', color: 'text-green-400' },
  { label: 'Closed', color: 'text-gray-400' },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'How do withdrawals work?',
    answer: 'Withdrawals are processed within 1-2 business days. Your funds will be transferred to the bank account linked to your profile. Minimum withdrawal amount is $100.',
    category: 'Withdrawals',
  },
  {
    id: '2',
    question: 'How to verify my account?',
    answer: 'Visit the KYC Verification page and follow the steps. You will need to provide personal information, a government ID, address proof, and a selfie.',
    category: 'KYC Verification',
  },
  {
    id: '3',
    question: 'How do investments mature?',
    answer: 'Investments mature based on the selected investment period. You will receive notifications 7 days before maturity. Returns are automatically credited to your account.',
    category: 'Investments',
  },
  {
    id: '4',
    question: 'How to update account settings?',
    answer: 'Go to Account Settings to update your email, password, phone number, and currency preferences. Changes are applied immediately.',
    category: 'Account Access',
  },
  {
    id: '5',
    question: 'How can I secure my account?',
    answer: 'Enable two-factor authentication, use a strong password, never share your login credentials, and regularly review your account activity.',
    category: 'Security',
  },
];

export const SAMPLE_TICKETS: SupportTicket[] = [
  {
    id: 'TKT001',
    subject: 'Unable to withdraw funds',
    category: 'Withdrawals',
    priority: 'High',
    status: 'In Progress',
    message: 'I am trying to withdraw $500 but keep getting an error.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    lastUpdated: '2 hours ago',
  },
  {
    id: 'TKT002',
    subject: 'KYC verification rejected',
    category: 'KYC Verification',
    priority: 'High',
    status: 'Waiting for User',
    message: 'My KYC was rejected, but I do not know why.',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    lastUpdated: '1 day ago',
  },
  {
    id: 'TKT003',
    subject: 'Password reset not working',
    category: 'Account Access',
    priority: 'Urgent',
    status: 'Open',
    message: 'I cannot reset my password. The email is not being received.',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    lastUpdated: '30 minutes ago',
  },
  {
    id: 'TKT004',
    subject: 'Investment question',
    category: 'Investments',
    priority: 'Low',
    status: 'Resolved',
    message: 'What is the ROI for the 12-month investment plan?',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-11'),
    lastUpdated: '5 days ago',
  },
];
