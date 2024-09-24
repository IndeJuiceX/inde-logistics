// app/api/onboard-vendor/route.js
import { v4 as uuidv4 } from 'uuid';
import { putItem } from '@/lib/dynamodb';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateJwtToken } from '@/services/Helper';

const JWT_SECRET = process.env.JWT_SECRET || 'stringwhichisasecretforoutnew3plsystem'; // Replace with secure key

export async function POST(req) {
  try {
    const { companyName, companyNumber, phone, email, shippingCode } = await req.json();

    const vendorId = crypto.createHash('md5').update(`${companyName}${companyNumber}${email}`).digest('hex').slice(0, 8);
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
      shipping_code: shippingCode,
      api_key: apiKey,
      status: 'Active',
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
