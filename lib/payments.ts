export type PaymentMethod = 'crypto' | 'paypal' | 'giftcard' | 'bank';
export type CryptoType = 'BTC' | 'USDT' | 'ETH';
export type GiftCardType = 'physical' | 'egiftcard';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface CryptoDeposit {
  id: string;
  userId: string;
  cryptoType: CryptoType;
  amount: number;
  walletAddress: string;
  proofImage?: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayPalDeposit {
  id: string;
  userId: string;
  email: string;
  amount: number;
  transactionReference: string;
  receiptImage?: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhysicalGiftCard {
  id: string;
  userId: string;
  brand: string;
  amount: number;
  frontImage: string;
  backImage: string;
  notes?: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface EGiftCard {
  id: string;
  userId: string;
  brand: string;
  amount: number;
  ePin: string;
  receiptImage?: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CryptoWithdrawal {
  id: string;
  userId: string;
  cryptoType: CryptoType;
  amount: number;
  walletAddress: string;
  network: string;
  notes?: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayPalWithdrawal {
  id: string;
  userId: string;
  email: string;
  amount: number;
  notes?: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankTransfer {
  id: string;
  userId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban?: string;
  swiftBic?: string;
  country: string;
  amount: number;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutOrder {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  subtotal: number;
  fees: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const CRYPTO_NETWORKS = {
  BTC: { name: 'Bitcoin', confirmTime: '10-30 mins', minDeposit: 0.001 },
  USDT: { name: 'Tether', confirmTime: '5-15 mins', minDeposit: 10 },
  ETH: { name: 'Ethereum', confirmTime: '5-15 mins', minDeposit: 0.01 },
};

export const GIFTCARD_BRANDS = [
  'Visa', 'Mastercard', 'Amazon', 'Apple', 'Steam',
  'Google Play', 'Sephora', 'Best Buy', 'Walmart', 'Target',
  'Netflix', 'Spotify', 'Xbox', 'PlayStation', 'Nintendo'
];

export const PAYMENT_METHODS = [
  { id: 'crypto', label: 'Cryptocurrency', icon: 'Bitcoin' },
  { id: 'paypal', label: 'PayPal', icon: 'PaypalIcon' },
  { id: 'giftcard', label: 'Gift Card', icon: 'Gift' },
  { id: 'bank', label: 'Bank Transfer', icon: 'Banknote' },
];
