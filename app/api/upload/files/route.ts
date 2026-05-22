import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { processFilesForEmail } from '@/lib/upload/file-processor';
import { sendEmailToAdminWithAttachments } from '@/lib/upload/email-attachments';
import {
  depositProofAdminTemplate,
  kycVerificationAdminTemplate,
  giftCardProofAdminTemplate,
  cryptoProofAdminTemplate,
  userDocumentAdminTemplate,
} from '@/lib/upload/templates';
import { RESEND_CONFIG } from '@/lib/email/resend';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');

export async function POST(request: NextRequest) {
  console.log('[v0] UPLOAD API - Request received');

  try {
    // Verify authentication
    const cookie = request.cookies.get('auth_token')?.value;
    if (!cookie) {
      console.error('[v0] UPLOAD API - No auth token found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT
    let userId: string;
    let userEmail: string = '';
    try {
      const { payload } = await jwtVerify(cookie, JWT_SECRET);
      userId = payload.sub as string;
      userEmail = (payload as any).email || '';
      console.log('[v0] UPLOAD API - User verified:', userId);
    } catch (error) {
      console.error('[v0] UPLOAD API - JWT verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Parse form data
    console.log('[v0] UPLOAD API - Parsing form data');
    const formData = await request.formData();

    const uploadType = formData.get('uploadType') as string;
    const files = formData.getAll('files') as File[];

    console.log('[v0] UPLOAD API - Upload type:', uploadType, 'Files:', files.length);

    if (!uploadType) {
      return NextResponse.json(
        { error: 'Upload type is required' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Process files
    console.log('[v0] UPLOAD API - Processing files');
    const processedFiles = await processFilesForEmail(files);

    if (processedFiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid files to upload' },
        { status: 400 }
      );
    }

    // Prepare attachments
    const attachments = processedFiles.map(f => ({
      filename: f.sanitizedName,
      content: f.buffer,
    }));

    const fileInfo = processedFiles.map(f => ({
      name: f.originalName,
      size: `${(f.size / 1024).toFixed(2)} KB`,
    }));

    const timestamp = new Date().toLocaleString();

    // Send email based on upload type
    let emailSubject = 'New Upload';
    let emailHtml = '';

    console.log('[v0] UPLOAD API - Building email for upload type:', uploadType);

    switch (uploadType) {
      case 'deposit-proof':
        const depositAmount = formData.get('amount') as string;
        const depositMethod = formData.get('method') as string;
        emailSubject = `New Deposit Proof - $${depositAmount} via ${depositMethod}`;
        emailHtml = depositProofAdminTemplate({
          userId,
          amount: depositAmount || '0',
          method: depositMethod || 'Unknown',
          userEmail,
          timestamp,
          files: fileInfo,
        });
        break;

      case 'kyc-verification':
        emailSubject = 'New KYC Verification Documents';
        emailHtml = kycVerificationAdminTemplate({
          userId,
          userEmail,
          timestamp,
          files: fileInfo,
        });
        break;

      case 'gift-card-proof':
        const giftcardAmount = formData.get('amount') as string;
        emailSubject = `New Gift Card Proof - $${giftcardAmount}`;
        emailHtml = giftCardProofAdminTemplate({
          userId,
          amount: giftcardAmount || '0',
          userEmail,
          timestamp,
          files: fileInfo,
        });
        break;

      case 'crypto-proof':
        const cryptoAmount = formData.get('amount') as string;
        const cryptoType = formData.get('cryptoType') as string;
        emailSubject = `New Crypto Proof - ${cryptoType} ($${cryptoAmount})`;
        emailHtml = cryptoProofAdminTemplate({
          userId,
          amount: cryptoAmount || '0',
          cryptoType: cryptoType || 'Unknown',
          userEmail,
          timestamp,
          files: fileInfo,
        });
        break;

      case 'document':
        const documentType = formData.get('documentType') as string;
        const description = formData.get('description') as string;
        emailSubject = `New Document Upload - ${documentType}`;
        emailHtml = userDocumentAdminTemplate({
          userId,
          documentType: documentType || 'Unknown',
          userEmail,
          description: description || undefined,
          timestamp,
          files: fileInfo,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid upload type' },
          { status: 400 }
        );
    }

    // Send email with attachments
    console.log('[v0] UPLOAD API - Sending email with attachments');
    const emailResult = await sendEmailToAdminWithAttachments({
      subject: emailSubject,
      html: emailHtml,
      attachments,
    });

    if (!emailResult.success) {
      console.error('[v0] UPLOAD API - Email sending failed:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send email notification' },
        { status: 500 }
      );
    }

    console.log('[v0] UPLOAD API - Upload and email sent successfully');

    // Return success - files are NOT stored, only emailed
    return NextResponse.json(
      {
        success: true,
        message: 'Files uploaded and sent to admin for review',
        uploadType,
        filesProcessed: processedFiles.length,
        emailId: emailResult.id,
      },
      { status: 200 }
    );

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[v0] UPLOAD API - Error:', errorMsg);
    return NextResponse.json(
      { error: `Upload failed: ${errorMsg}` },
      { status: 500 }
    );
  }
}
