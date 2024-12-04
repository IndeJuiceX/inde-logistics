import { NextResponse } from 'next/server';
import { hashPassword } from '@/services/utils/password';  // Utility function to hash the password
import { saveUser } from '@/services/data/user';     // DynamoDB utility function for adding user

export async function POST(request, { params }) {
  try {
    const vendorId = params.vendor_id; // Get vendorId from URL parameters

    const body = await request.json();  // Parse JSON body

    // Extract fields from request body
    const { firstName, lastName, email, phone, password } = body;

    // Validate the required fields
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await hashPassword(password);

    // Create the user object
    const newUser = {
      pk: `USER#${email}`,  // Partition key
      sk: `USER#${email}`,  // Sort key
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password: hashedPassword,
      user_type: 'vendor',  // Fixed user type for vendor users
      vendor_id: vendorId,       // Vendor ID from the URL parameter
      entity_type: 'User',       // Additional attribute to indicate the entity type
      created_at: new Date().toISOString(),
    };

    // Add the user to the DynamoDB table
    const result = await saveUser(newUser);

    if (result.success) {
      return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in registering user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}