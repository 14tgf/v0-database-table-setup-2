// Payment configuration types and defaults
// This will eventually be replaced with database calls

export interface CryptoConfig {
  btc_address: string;
  eth_address: string;
  usdt_trc20: string;
  usdt_erc20: string;
}

export interface PayPalConfig {
  email: string;
}

export interface BankConfig {
  bank_name: string;
  account_name: string;
  account_number: string;
  swift_code: string;
  country: string;
}

export interface PaymentMethod {
  type: 'crypto' | 'paypal' | 'bank';
  status: 'active' | 'inactive';
  config: CryptoConfig | PayPalConfig | BankConfig;
  updated_at?: string;
}

export interface PaymentMethodsData {
  crypto: PaymentMethod & { config: CryptoConfig };
  paypal: PaymentMethod & { config: PayPalConfig };
  bank: PaymentMethod & { config: BankConfig };
}

// Default configuration (mock data)
export const DEFAULT_PAYMENT_CONFIG: PaymentMethodsData = {
  crypto: {
    type: 'crypto',
    status: 'active',
    config: {
      btc_address: '1A1z7agoat5dVvS4VKQwVAjkPHDMxLB1xh',
      eth_address: '0x742d35Cc6634C0532925a3b844Bc96e6E6f2d2c5',
      usdt_trc20: 'TQn9jFiarHd1mwf3vqyJ1n7wHBYkQVcVj7',
      usdt_erc20: '0x742d35Cc6634C0532925a3b844Bc96e6E6f2d2c5',
    },
    updated_at: new Date().toISOString(),
  },
  paypal: {
    type: 'paypal',
    status: 'active',
    config: {
      email: 'business@xholding.com',
    },
    updated_at: new Date().toISOString(),
  },
  bank: {
    type: 'bank',
    status: 'active',
    config: {
      bank_name: 'International Business Bank',
      account_name: 'X Holding Inc',
      account_number: 'DE89370400440532013000',
      swift_code: 'COBADEMDEM',
      country: 'Germany',
    },
    updated_at: new Date().toISOString(),
  },
};

// Get all payment methods - Fetch from database
export async function getPaymentMethods(): Promise<PaymentMethodsData> {
  try {
    console.log('[v0] PAYMENT CONFIG - Fetching payment methods from database');
    
    const response = await fetch('/api/admin/payments/fetch', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('[v0] PAYMENT CONFIG - API response status:', response.status);

    if (!response.ok) {
      console.warn('[v0] PAYMENT CONFIG - Failed to fetch from API, using defaults:', response.status);
      return DEFAULT_PAYMENT_CONFIG;
    }

    const result = await response.json();
    console.log('[v0] PAYMENT CONFIG - Fetched payment methods:', result);

    if (!result.success || !result.data) {
      console.warn('[v0] PAYMENT CONFIG - Invalid response format, using defaults');
      return DEFAULT_PAYMENT_CONFIG;
    }

    // Build the PaymentMethodsData from database response
    const methods: PaymentMethodsData = { ...DEFAULT_PAYMENT_CONFIG };

    // Update with database values if available
    if (result.data.crypto) {
      methods.crypto = result.data.crypto;
    }
    if (result.data.paypal) {
      methods.paypal = result.data.paypal;
    }
    if (result.data.bank) {
      methods.bank = result.data.bank;
    }

    console.log('[v0] PAYMENT CONFIG - Merged methods:', methods);
    return methods;
  } catch (error) {
    console.error('[v0] PAYMENT CONFIG - Error fetching payment methods:', error);
    return DEFAULT_PAYMENT_CONFIG;
  }
}

// Update crypto config
export async function updateCryptoConfig(config: Partial<CryptoConfig>): Promise<PaymentMethod> {
  // TODO: Replace with database call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        type: 'crypto',
        status: 'active',
        config: { ...DEFAULT_PAYMENT_CONFIG.crypto.config, ...config },
        updated_at: new Date().toISOString(),
      });
    }, 300);
  });
}

// Update PayPal config
export async function updatePayPalConfig(config: Partial<PayPalConfig>): Promise<PaymentMethod> {
  // TODO: Replace with database call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        type: 'paypal',
        status: 'active',
        config: { ...DEFAULT_PAYMENT_CONFIG.paypal.config, ...config },
        updated_at: new Date().toISOString(),
      });
    }, 300);
  });
}

// Update bank config
export async function updateBankConfig(config: Partial<BankConfig>): Promise<PaymentMethod> {
  // TODO: Replace with database call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        type: 'bank',
        status: 'active',
        config: { ...DEFAULT_PAYMENT_CONFIG.bank.config, ...config },
        updated_at: new Date().toISOString(),
      });
    }, 300);
  });
}

// Toggle payment method status
export async function togglePaymentMethod(type: 'crypto' | 'paypal' | 'bank'): Promise<PaymentMethod> {
  // TODO: Replace with database call
  const methods = DEFAULT_PAYMENT_CONFIG;
  const current = methods[type];
  const newStatus = current.status === 'active' ? 'inactive' : 'active';

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...current,
        status: newStatus,
        updated_at: new Date().toISOString(),
      });
    }, 300);
  });
}
