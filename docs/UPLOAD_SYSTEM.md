# Universal File Upload System with Email Attachments

This system allows users to securely upload files which are automatically attached to admin notification emails. Files are processed temporarily and never permanently stored.

## Key Features

- **Temporary Processing**: Files exist only during upload → email sending → immediate cleanup
- **Email Attachments**: Files are attached directly to Resend emails (admin inbox)
- **Multiple File Support**: Upload up to 5 files per submission
- **File Validation**: 
  - Allowed: PNG, JPG, JPEG, WEBP, PDF
  - Blocked: EXE, ZIP, JS, HTML, SVG, PHP, BAT, executables
  - Max 5MB per file
- **Secure Naming**: Filenames are sanitized and timestamped
- **TypeScript**: Full type safety throughout
- **Error Handling**: Comprehensive validation and error messages

## Architecture

### Utilities

1. **`lib/upload/file-validator.ts`**
   - File type validation (MIME types)
   - Dangerous file detection
   - Filename sanitization
   - Size validation

2. **`lib/upload/file-processor.ts`**
   - Convert File objects to buffers
   - Create file summaries for emails
   - Handle multiple files

3. **`lib/upload/email-attachments.ts`**
   - Send emails with Resend attachments
   - Send to both primary and secondary admin
   - Handle email errors gracefully

4. **`lib/upload/templates.ts`**
   - Admin notification email templates
   - Specialized templates per upload type:
     - Deposit proof
     - KYC verification
     - Gift card proof
     - Crypto proof
     - Generic documents

### API Route

**`app/api/upload/files/route.ts`**
- Handles multipart/form-data uploads
- Validates authentication (JWT)
- Processes files and sends emails
- Returns success/error responses
- Files deleted after email sent (no storage)

### Components

1. **`components/upload/file-upload.tsx`** - Base upload component
   - Drag & drop support
   - File validation UI
   - Upload progress
   - Success/error states

2. **`components/upload/index.tsx`** - Preset upload components
   - `DepositProofUpload` - For deposit proofs
   - `KYCUpload` - For KYC documents
   - `GiftCardUpload` - For gift card proofs
   - `CryptoProofUpload` - For crypto proofs
   - `DocumentUpload` - For generic documents

## Usage Examples

### Example 1: Deposit Proof Upload

```tsx
import { DepositProofUpload } from '@/components/upload';

export function DepositForm() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');

  return (
    <div className="space-y-4">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <select value={method} onChange={(e) => setMethod(e.target.value)}>
        <option>Bank Transfer</option>
        <option>PayPal</option>
        <option>Crypto</option>
      </select>

      <DepositProofUpload
        amount={amount}
        method={method}
        onUploadComplete={(success, message) => {
          if (success) {
            console.log('Deposit proof sent to admin');
            // Show success message
          } else {
            console.error('Upload failed:', message);
          }
        }}
      />
    </div>
  );
}
```

### Example 2: KYC Verification Upload

```tsx
import { KYCUpload } from '@/components/upload';

export function KYCVerification() {
  return (
    <div className="space-y-4">
      <h2>KYC Verification</h2>
      <p>Upload your identity verification documents</p>
      
      <KYCUpload
        onUploadComplete={(success, message) => {
          if (success) {
            // Mark KYC as submitted
          }
        }}
      />
    </div>
  );
}
```

### Example 3: Custom Document Upload

```tsx
import { DocumentUpload } from '@/components/upload';

export function CustomForm() {
  return (
    <DocumentUpload
      documentType="Contract"
      description="Upload your signed contract"
      onUploadComplete={(success) => {
        if (success) {
          // Process after upload
        }
      }}
    />
  );
}
```

### Example 4: Direct Component Usage

```tsx
import { FileUploadComponent } from '@/components/upload/file-upload';

export function CustomUpload() {
  return (
    <FileUploadComponent
      uploadType="crypto-proof"
      maxFiles={3}
      maxSizeMB={5}
      description="Upload blockchain transaction proof"
      additionalData={{
        amount: '1000',
        cryptoType: 'BTC',
      }}
      onUploadComplete={(success, message) => {
        console.log(success ? 'Success!' : 'Error: ' + message);
      }}
    />
  );
}
```

## How It Works (Flow Diagram)

```
User selects files
        ↓
Client validation (size, type)
        ↓
User clicks "Upload"
        ↓
Files converted to FormData
        ↓
POST /api/upload/files
        ↓
Server JWT verification
        ↓
Server file validation
        ↓
File → Buffer conversion
        ↓
Resend API: send email + attachments
        ↓
Buffers discarded (NO storage)
        ↓
Success response to client
        ↓
Admin receives email with files attached
```

## Email Format

Admin receives beautifully formatted emails with:
- User information
- Upload details (amount, method, type, etc.)
- Timestamp
- Files listed (with sizes)
- Direct action link to admin dashboard
- **All files as downloadable email attachments** in inbox

## Environment Variables Required

```env
# Already configured in your project:
RESEND_API_KEY=your_resend_key
JWT_SECRET=your_jwt_secret

# Email configuration (from lib/email/resend.ts):
# RESEND_CONFIG.adminEmail: cedoe70@gmail.com
# RESEND_CONFIG.adminEmailSecondary: 615tazzzy@gmail.com
# RESEND_CONFIG.fromEmail: "X-holdings" <noreply@web3trusts.online>
```

## Security Features

✅ File type validation (MIME + extension)
✅ Dangerous file rejection (EXE, ZIP, JS, HTML, etc.)
✅ File size limits (5MB default)
✅ JWT authentication required
✅ Filename sanitization (prevent path traversal)
✅ Temporary processing only (no database storage)
✅ Timestamped filenames (prevent overwrites)

## File Types Supported

**Allowed:**
- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- WebP (`.webp`)
- PDF (`.pdf`)

**Blocked (Dangerous):**
- Executables: `.exe`, `.bat`, `.cmd`, `.com`, `.msi`
- Archives: `.zip`, `.rar`, `.7z`, `.gz`, `.tar`
- Scripts: `.js`, `.vbs`, `.php`, `.py`, `.sh`
- Images: `.svg`, `.svgz`
- Other: `.html`, `.htm`, `.asp`, `.aspx`, and more

## Limits

- Max 5 files per upload (configurable)
- Max 5MB per file (configurable)
- Immediate deletion after email sent
- No database storage

## Integration with Existing Forms

Replace Supabase storage with this system in your existing forms:

**Before (Supabase Storage):**
```tsx
// Upload to storage bucket
const { url } = await uploadImageToSupabase(file);
// Store URL in database
await submitDeposit({ proof_url: url });
```

**After (Email Attachments):**
```tsx
// Files automatically emailed to admin
<DepositProofUpload amount={amount} method={method} />
// Only store submission in database, not files
await submitDeposit({ status: 'pending' });
```

## Troubleshooting

**Files not received:**
- Check admin email (cedoe70@gmail.com and 615tazzzy@gmail.com)
- Check spam/promotions folder
- Verify RESEND_API_KEY environment variable
- Check server logs for errors

**Upload fails:**
- File exceeds 5MB
- Invalid file type (only PNG, JPG, WEBP, PDF allowed)
- Not authenticated (check JWT token)
- Dangerous file type detected

**Server errors:**
- Check logs at `/api/upload/files`
- Verify JWT_SECRET matches auth token
- Ensure Resend API key is valid

## API Response Format

**Success:**
```json
{
  "success": true,
  "message": "Files uploaded and sent to admin for review",
  "uploadType": "deposit-proof",
  "filesProcessed": 2,
  "emailId": "email_abc123"
}
```

**Error:**
```json
{
  "error": "Maximum 5 files allowed"
}
```

## Future Enhancements

- Rate limiting per user
- Virus scanning integration
- File preview in emails
- User receipt emails
- Upload analytics
- Retry logic for failed emails
