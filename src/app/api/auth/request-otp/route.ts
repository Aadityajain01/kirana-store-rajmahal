import { NextRequest, NextResponse } from 'next/server';
import { generateOTP } from '@/lib/auth/otp';

export async function POST(req: NextRequest) {
  try {
    const { mobile } = await req.json();

    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please provide a valid 10-digit mobile number.',
            requestId: `req_${Date.now()}`,
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    const code = generateOTP(mobile);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully (Use 123456 in demo/dev mode)',
      // We include the code in dev response for seamless testing
      devCode: code,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: {
          code: 'SERVER_ERROR',
          message: err.message || 'Failed to send OTP.',
          requestId: `req_${Date.now()}`,
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
