// app/api/onboard-vendor/route.js
import { v4 as uuidv4 } from 'uuid';
import { putItem } from '@/services/external/dynamo/wrapper';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateJwtToken } from '@/services/utils/token';

const JWT_SECRET = process.env.JWT_SECRET || 'stringwhichisasecretforoutnew3plsystem'; // Replace with secure key

export async function POST(req) {
  try {
    const { companyName, companyNumber, phone, email } = await req.json();
    let vendorId = null;
    if (process.env.APP_ENV === 'staging') {
      vendorId = crypto.createHash('md5').update(`${companyName}${companyNumber}${email}-staging`).digest('hex').slice(0, 8);

    } else {
      vendorId = crypto.createHash('md5').update(`${companyName}${companyNumber}${email}`).digest('hex').slice(0, 8);
    }
    //`VENDOR#${uuidv4()}`;
    const tokenPayload = {
      vendorId: vendorId,
      companyName: companyName,
      companyNumber: companyNumber
    };
    const apiKey = generateJwtToken(vendorId, companyNumber);//uuidv4();

    const vendorData = {
      pk: `VENDOR#${vendorId}`,
      sk: `VENDOR#${vendorId}`,
      entity_type: 'Vendor',
      vendor_id: vendorId,
      company_name: companyName,
      company_number: companyNumber,
      phone: phone,
      email: email,
      api_key: apiKey,
      status: 'inactive',
    };

    const result = await putItem(vendorData);

    if (result.success) {
      return NextResponse.json({ vendorId, apiKey });
    } else {
      return NextResponse.json({ error: 'Failed to onboard vendor' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to onboard vendor' }, { status: 500 });
  }
}
