import { integrate } from "@/src/lib/integrationService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await integrate("ERP", "/erp/orders");
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
