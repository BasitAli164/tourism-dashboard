import { NextResponse,NextRequest } from 'next/server';
import userModel from '@/models/user.model';
import dbConnect from '@/utils/dbConnectionHandlers';
export async function POST(req:NextRequest) {
    try {
      // Ensure database connection
      await dbConnect();
  
      // Parse the request body
      const { name, email } = await req.json();
  
      // Check if both name and email are provided
      if (!name || !email) {
        return new Response(
          JSON.stringify({ message: "Name and email are required." }),
          { status: 400 }
        );
      }
  
      // Create a new user in the database
      const user = new userModel({ name, email });
      await user.save();
  
      // Return the created user as a response
      return new Response(
        JSON.stringify({ message: "User created successfully", user }),
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response(
        JSON.stringify({ message: "Server error" }),
        { status: 500 }
      );
    }
  }