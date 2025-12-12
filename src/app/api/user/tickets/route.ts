// app/api/support/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnectionHandlers";
import supportTicketModel from "@/models/support.model";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const newTicket = await supportTicketModel.create(body);
    console.log("New ticket is:", newTicket);

    return NextResponse.json(
      { message: "Ticket submitted", ticket: newTicket },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
