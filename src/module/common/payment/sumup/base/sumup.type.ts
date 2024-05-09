export interface SumUpCountryDetail {
  currency: string;
  en_name: string;
  iso_code: string;
  native_name: string;
}
export interface SumUpTimeoffsetDetail {
  dst: string | number | boolean;
  offset: string | number | boolean;
  post_code: string;
}

export interface SumUpAddress {
  address_line1: string;
  address_line2: string;
  city: string;
  country: string;
  post_code: string | number;
  region_id: string | number;
  region_name: string;
}

export interface SumUpMerchantAddress extends SumUpAddress {
  compstring: string;
  country_details: SumUpCountryDetail;
  first_name: string;
  landline: string | number | boolean;
  last_name: string;
  region_code: string | number | boolean;
  state_id: string | number | boolean;
  timeoffset_details: SumUpTimeoffsetDetail;
}

export interface SumUpPersonalAddress extends SumUpMerchantAddress {
  company: string;
}

export interface SumUpPermission {
  create_moto_payments: string;
  create_referral: string;
  full_transaction_history_view: string;
  refund_transactions: string;
}

export interface SumUpAppSetting {
  advanced_mode: string;
  barcode_scanner: string;
  cash_payment: string | number;
  checkout_preference: string;
  expected_max_transaction_amount: string | number;
  include_vat: string | number | boolean;
  manual_entry: string | number | boolean;
  manual_entry_tutorial: string | number | boolean;
  mobile_payment: string | number | boolean;
  mobile_payment_tutorial: string | number | boolean;
  reader_payment: string | number | boolean;
  referral: string | number | boolean;
  tax_enabled: string | number | boolean;
  terminal_mode_tutorial: string | number | boolean;
  tip_rates: string[];
  tipping: string | number | boolean;
}

export interface SumUpBusinessOwner {
  date_of_birth: string;
  first_name: string;
  landline: string;
  last_name: string;
  mobile_phone: string;
  ownership: string;
}

export interface SumUpBankAccount {
  account_category: string;
  account_holder_name: string;
  account_number: string | number | boolean;
  account_type: string;
  bank_code: string;
  bank_name: string;
  branch_code: string;
  created_at: string;
  iban: string | number | boolean;
  primary: string | number | boolean;
  status: string;
  swift: string;
}

export interface SumUpBusiness {
  address: SumUpAddress;
  business_name: string;
  compstring_registration_number: string | number | boolean;
  email: string;
  vat_id: string;
  website: string;
}
export interface SumUpLegalType {
  description: string;
  full_description: string;
  id: string | number;
  sole_trader: string | number | boolean;
}

export interface SumUpProfile {
  address: SumUpMerchantAddress;
  bank_accounts: SumUpBankAccount[];
  business_owners: SumUpBusinessOwner[];
  compstring_name: string;
  compstring_registration_number: string | number;
  country: string;
  doing_business_as: SumUpBusiness;
  extdev: string | number | boolean;
  legal_type: SumUpLegalType;
  locale: string;
  merchant_category_code: string;
  merchant_code: string;
  mobile_phone: string;
  nature_and_purpose: string;
  payout_zone_migrated: string;
  permanent_certificate_access_code: string;
  settings: SumUpSetting;
  vat_id: string;
  vat_rates: SumUpVatRate;
  website: string;
}

export interface SumUpVatRate {
  country: string;
  description: string;
  id: string;
  ordering: string;
  rate: string;
}

export interface SumUpMerchantAccount {
  account: {
    type: string;
    username: string;
  };
  app_settings: SumUpAppSetting;
  details_submitted: boolean;
  is_migrated_payleven_br: boolean;
  merchant_profile: SumUpProfile;
  operators: [
    {
      username: string;
    },
  ];
  permissions: SumUpPermission;
  personal_profile: {
    address: SumUpMerchantAddress;
    complete: string;
    date_of_birth: string;
    first_name: string;
    last_name: string;
    mobile_phone: string;
  };
}

export enum SumUpTransactionType {
  ECOM = 'ECOM',
  RECURRING = 'RECURRING',
  BOLETO = 'BOLETO',
}

export enum SumUpEntryMode {
  BOLETO = 'BOLETO',
  CUSTOMER_ENTRY = 'CUSTOMER_ENTRY',
}

export enum SumUpTransactionStatus {
  SUCCESSFUL = 'SUCCESSFUL',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export enum SumUpCheckoutStatus {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  PAID = 'PAID',
}

export enum SumUpPaymentStatus {
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
}

export enum SumUpPaymentType {
  PAYOUT = 'PAYOUT',
  CHARGE_BACK_DEDUCTION = 'CHARGE_BACK_DEDUCTION',
  REFUND_DEDUCTION = 'REFUND_DEDUCTION',
  DD_RETURN_DEDUCTION = 'DD_RETURN_DEDUCTION',
  BALANCE_DEDUCTION = 'BALANCE_DEDUCTION',
}

export interface SumUpTransaction {
  amount: number;
  currency: string;
  id: string;
  installments_count: number;
  payment_type: SumUpTransactionType;
  status: SumUpTransactionStatus;
  timestamp: string;
  transaction_code: string;
  auth_code: string;
  entry_mode: SumUpEntryMode;
  internal_id: number;
  merchant_code: string;
  tip_amount: number;
  vat_amount: number;
}

export interface SumUpCheckout {
  amount: number;
  checkout_reference: string;
  currency: string;
  customer_id: string;
  date: string;
  description: string;
  id: string;
  merchant_code: string;
  pay_to_email: string;
  return_url: string;
  status: SumUpCheckoutStatus;
  transactions: SumUpTransaction[];
  valid_until: string;
  mandate?: {
    merchant_code: string;
    status: string;
    type: string;
  };
  merchant_name?: string;
  payment_instrument?: {
    token: string;
  };
  redirect_url?: string;
  transaction_code?: string;
  transaction_id?: string;
}

export interface PersonalAddress {
  city: string;
  country: string;
  line1: string;
  line2: string;
  postal_code: string;
  state: string;
}

export interface PersonalDetail {
  address: PersonalAddress;
  birthdate: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface SumUpCustomer {
  customer_id: string;
  personal_details: PersonalDetail;
}

export interface SumUpPaymentInstrument {
  active: boolean;
  card: {
    last_4_digits: string;
    type: string;
  };
  created_at: string;
  mandate: {
    merchant_code: string;
    status: string;
    type: string;
  };
  token: string;
  type: string;
}

export interface SumUpMerchantProfile {
  address: SumUpPersonalAddress;
  bank_accounts: SumUpBankAccount[];
  business_owners: SumUpBusinessOwner[];
  company_name: string;
  company_registration_number: string;
  country: string;
  doing_business_as: SumUpBusiness;
  extdev: string;
  legal_type: SumUpLegalType;
  locale: string;
  merchant_category_code: string;
  merchant_code: string;
  mobile_phone: string;
  nature_and_purpose: string;
  payout_zone_migrated: null;
  permanent_certificate_access_code: string;
  settings: SumUpSetting;
  vat_id: string;
  vat_rates: SumUpVatRate;
  website: string;
}

export interface SumUpSetting {
  adyen_company: string;
  adyen_merchant_code: string;
  adyen_password: string;
  adyen_user: string;
  daily_payout_email: string;
  gross_settlement: string;
  monthly_payout_email: string;
  moto_payment: string;
  payout_instrument: string;
  payout_on_demand: string;
  payout_on_demand_available: string;
  payout_period: string;
  payout_type: string;
  printers_enabled: string;
  stone_merchant_code: string;
  tax_enabled: string;
}

export interface SumUpPersonalProfile {
  address: SumUpPersonalAddress;
  complete: string;
  date_of_birth: string;
  first_name: string;
  last_name: string;
  mobile_phone: string;
}

export interface SumUpSubAccount {
  created_at: string;
  disabled: false;
  id: number;
  permissions: SumUpPermission;
  updated_at: string;
  username: string;
}

export interface SumUpPayout {
  amount: number;
  currency: string;
  date: string;
  fee: number;
  id: number;
  reference: string;
  status: SumUpPaymentStatus;
  transaction_code: string;
  type: SumUpPaymentType;
}

export interface SumUpCard {
  cvv: string;
  expiry_month: string;
  expiry_year: string;
  last_4_digits: string;
  name: string;
  number: string;
  type: string;
  zip_code: string;
}

export interface SumUpEvent {
  amount: number;
  deducted_amount: null;
  deducted_fee_amount: null;
  fee_amount: string;
  id: string;
  installment_number: string;
  status: string;
  timestamp: string;
  transaction_id: string;
  type: string;
}

export interface SumUpProduct {
  name: string;
  price: number;
  price_with_vat: number;
  quantity: number;
  single_vat_amount: number;
  total_price: number;
  total_with_vat: number;
  vat_amount: number;
  vat_rate: string;
}

export interface SumUpTransactionEvent {
  amount: number;
  date: string;
  due_date: string;
  event_type: string;
  id: string;
  installment_number: string;
  status: string;
  timestamp: string;
}

export interface SumUpTransactionDetail {
  amount: number;
  currency: string;
  id: string;
  installments_count: number;
  payment_type: string;
  status: string;
  timestamp: string;
  transaction_code: string;
  auth_code: string;
  entry_mode: string;
  internal_id: number;
  merchant_code: string;
  tip_amount: number;
  vat_amount: number;
  payout_plan: string;
  payouts_received: string;
  payouts_total: string;
  product_summary: string;
  card: SumUpCard;
  events: SumUpEvent[];
  horizontal_accuracy: string;
  lat: string;
  links: string[];
  local_time: string;
  location: {
    horizontal_accuracy: string;
    lat: string;
    lon: string;
  };
  lon: string;
  payout_type: string;
  products: SumUpProduct[];
  simple_payment_type: string;
  simple_status: string;
  tax_enabled: string;
  transaction_events: SumUpTransactionEvent[];
  username: string;
  vat_rates: SumUpVatRate[];
  verification_method: string;
}
