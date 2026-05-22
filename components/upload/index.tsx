'use client';

import { FileUploadComponent } from './file-upload';

export function DepositProofUpload({
  amount,
  method,
  onUploadComplete,
}: {
  amount: string;
  method: string;
  onUploadComplete?: (success: boolean, message?: string) => void;
}) {
  return (
    <FileUploadComponent
      uploadType="deposit-proof"
      onUploadComplete={onUploadComplete}
      maxFiles={3}
      maxSizeMB={5}
      description="Upload proof of deposit (bank transfer screenshot, receipt, etc.)"
      additionalData={{
        amount,
        method,
      }}
    />
  );
}

export function KYCUpload({
  onUploadComplete,
}: {
  onUploadComplete?: (success: boolean, message?: string) => void;
}) {
  return (
    <FileUploadComponent
      uploadType="kyc-verification"
      onUploadComplete={onUploadComplete}
      maxFiles={5}
      maxSizeMB={5}
      description="Upload your KYC verification documents (ID, passport, proof of address, etc.)"
      multiple={true}
    />
  );
}

export function GiftCardUpload({
  amount,
  onUploadComplete,
}: {
  amount: string;
  onUploadComplete?: (success: boolean, message?: string) => void;
}) {
  return (
    <FileUploadComponent
      uploadType="gift-card-proof"
      onUploadComplete={onUploadComplete}
      maxFiles={3}
      maxSizeMB={5}
      description="Upload gift card proof (screenshot, photo of card, receipt)"
      additionalData={{
        amount,
      }}
    />
  );
}

export function CryptoProofUpload({
  amount,
  cryptoType,
  onUploadComplete,
}: {
  amount: string;
  cryptoType: string;
  onUploadComplete?: (success: boolean, message?: string) => void;
}) {
  return (
    <FileUploadComponent
      uploadType="crypto-proof"
      onUploadComplete={onUploadComplete}
      maxFiles={3}
      maxSizeMB={5}
      description="Upload crypto transaction proof (blockchain screenshot, wallet confirmation)"
      additionalData={{
        amount,
        cryptoType,
      }}
    />
  );
}

export function DocumentUpload({
  documentType,
  description,
  onUploadComplete,
}: {
  documentType: string;
  description?: string;
  onUploadComplete?: (success: boolean, message?: string) => void;
}) {
  return (
    <FileUploadComponent
      uploadType="document"
      onUploadComplete={onUploadComplete}
      maxFiles={5}
      maxSizeMB={5}
      description={description || 'Upload your documents'}
      additionalData={{
        documentType,
      }}
    />
  );
}
