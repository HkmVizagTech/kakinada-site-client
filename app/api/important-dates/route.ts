import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const res = await axios.get(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080"}/important-dates`, { withCredentials: true });
  return NextResponse.json(res.data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await axios.post(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080"}/important-dates`, body, { withCredentials: true });
    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error("API important-dates POST error:", err.response?.data || err.message);
    return new NextResponse(JSON.stringify({ error: err.response?.data || err.message }), { status: 500 });
  }
}
