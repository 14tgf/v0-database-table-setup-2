export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  fullDescription?: string;
  features: string[];
  range?: string;
  acceleration?: string;
  charging?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  transmission?: string;
  drive?: string;
  seating?: string;
  display?: string;
  topSpeed?: string;
  images?: string[];
  purchasePrice?: number;
  leasePrice?: number;
  leaseTerms?: string;
  financePrice?: number;
  variants?: Array<{ name: string; price: number }>;
}

// Replaced with empty array - database-ready
export const PRODUCTS: Product[] = [];
