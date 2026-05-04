# Currency System Implementation Guide

## Overview
The application now has a fully functional global currency system. When users select a currency in the Account Settings, all monetary values across the entire website automatically update to display in that currency.

## How It Works

### 1. Currency Provider (`app/providers/currency-provider.tsx`)
- **Global State Management**: Manages the selected currency across the entire app
- **Persistence**: Saves currency preference to localStorage
- **Event System**: Dispatches custom events when currency changes
- **SSR Compatible**: Has fallback values for server-side rendering

```typescript
const { selectedCurrency, setSelectedCurrency } = useCurrency();
```

### 2. Currency Formatter Hook (`hooks/useCurrencyFormatter.ts`)
- **Main Hook**: `useCurrencyFormatter()` provides formatting functions
- **Features**:
  - `format(amount)` - Formats numbers as currency in the selected currency
  - `symbol` - Returns the currency symbol (e.g., $, €, £)
  - `currency` - Returns the selected currency code (e.g., USD, EUR)
- **Reactivity**: Automatically updates when currency changes via event listener

### 3. Currency Display Components (`components/currency-display.tsx`)
- **CurrencyDisplay**: Shows formatted currency value with optional label
- **CurrencySymbolDisplay**: Shows just the currency symbol

### 4. Currency Library (`lib/currency.ts`)
- **CURRENCIES Array**: Defines 10 supported currencies with codes, symbols, and names
- **formatCurrency()**: Uses Intl.NumberFormat for proper localization
- **getCurrencySymbol()**: Returns symbol for any currency code

## Updated Components

### Dashboard
- **Balance Card** (`components/dashboard/balance-card.tsx`)
  - Now uses `useCurrencyFormatter()` to format user balance
  - Updates instantly when currency selection changes

- **Stat Cards** (`components/dashboard/stat-card.tsx`)
  - Portfolio Value, Investments, Stock Holdings all format dynamically
  - Accepts both numeric values (formatted as currency) and string values

### Inventory
- **Product Cards** (`components/inventory/product-card.tsx`)
  - Car prices now display in selected currency
  - Uses `format(product.price)` for dynamic formatting

### Account Settings
- **Currency Selector** (`components/account/currency-selector.tsx`)
  - Location: At the end of the account page
  - Shows all 10 available currencies
  - Searchable dropdown by code, name, or symbol
  - Persists selection to localStorage

## Supported Currencies
1. USD - US Dollar ($)
2. EUR - Euro (€)
3. GBP - British Pound (£)
4. NGN - Nigerian Naira (₦)
5. CAD - Canadian Dollar (C$)
6. AUD - Australian Dollar (A$)
7. JPY - Japanese Yen (¥) *[Displays without decimals]*
8. CHF - Swiss Franc (CHF)
9. AED - UAE Dirham (د.إ)
10. ZAR - South African Rand (R)

## Usage Examples

### In Client Components
```typescript
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';

export function MyComponent() {
  const { format, symbol, currency } = useCurrencyFormatter();
  
  return (
    <div>
      <p>Balance: {format(1000)}</p>
      <p>Symbol: {symbol}</p>
      <p>Currency: {currency}</p>
    </div>
  );
}
```

### Using Currency Display Component
```typescript
import { CurrencyDisplay } from '@/components/currency-display';

export function WalletPage() {
  return (
    <CurrencyDisplay 
      amount={5000} 
      label="Available Balance"
    />
  );
}
```

## How Currency Changes Work

1. **User selects currency** in Account Settings dropdown
2. **Currency Provider** updates `selectedCurrency` state
3. **localStorage** is updated with new preference
4. **Custom event** (`currencyChanged`) is dispatched globally
5. **useCurrencyFormatter hook** listens for the event via `window.addEventListener()`
6. **All components** using the hook automatically re-render with new currency
7. **Values update** across Dashboard, Inventory, and all monetary displays

## Data Flow

```
Account Currency Selector (UI)
    ↓
setSelectedCurrency()
    ↓
CurrencyProvider State + localStorage
    ↓
window.dispatchEvent('currencyChanged')
    ↓
useCurrencyFormatter listener
    ↓
Force component re-render
    ↓
All monetary values update globally
```

## Default Currency
- **USD** is the default currency
- Automatically loaded on first visit
- Persists across sessions via localStorage

## Localization
- Uses browser's `Intl.NumberFormat` API for proper locale formatting
- Japanese Yen (JPY) displays without decimal places
- All other currencies display with 2 decimal places
- Automatically handles currency symbols and number formatting based on locale
