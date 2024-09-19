// pages/api/auth/register.js
import { NextResponse } from 'next/server';
import { hashPassword } from '@/services/password';  // Utility function to hash the password
import { putItem } from '@/lib/dynamodb';     // DynamoDB utility function for adding user

export async function POST(request) {
  try {
    const body = await request.json();  // Parse JSON body

    // Extract fields from request body
    const { firstName, lastName, email, phone, password, userType } = body;

    // Validate the required fields
    if (!firstName || !lastName || !email || !phone || !password || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await hashPassword(password);

    // Create the user object
    const newUser = {
      pk: `USER#${email}`,  // Partition key
      sk: `USER#${email}`,  // Sort key
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      userType,  // 'admin' or 'vendor'
      createdAt: new Date().toISOString(),
    };

    // Add the user to the DynamoDB table
    const result = await putItem(newUser);

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
