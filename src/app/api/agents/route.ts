// app/api/agents/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import Agent from '@/models/agent.model';

export async function POST(request: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const { name } = await request.json();

    // Validate the data
    if (!name) {
      return NextResponse.json({ message: "Agent name is required" }, { status: 400 });
    }

    // Create a new agent
    const newAgent = new Agent({ name });

    // Save the agent to the database
    await newAgent.save();

    // Return the newly created agent as response
    return NextResponse.json(newAgent, { status: 201 });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json({ message: "Failed to create agent" }, { status: 500 });
  }
}
export async function GET(request: Request) {
    try {
      // Connect to the database
      await dbConnect();
  
      // Fetch all agents from the database
      const agents = await Agent.find();
  
      // Return the list of agents as a response
      return NextResponse.json(agents, { status: 200 });
    } catch (error) {
      console.error("Error fetching agents:", error);
      return NextResponse.json({ message: "Failed to fetch agents" }, { status: 500 });
    }
  }