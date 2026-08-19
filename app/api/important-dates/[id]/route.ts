import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: any) {
  const params = context?.params || {};
  const res = await axios.get(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080"}/important-dates/${params.id}`, { withCredentials: true });
  return NextResponse.json(res.data);
}

export async function PUT(request: NextRequest, context: any) {
  const params = context?.params || {};
  const body = await request.json();
  const res = await axios.put(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080"}/important-dates/${params.id}`, body, { withCredentials: true });
  return NextResponse.json(res.data);
}

export async function DELETE(request: NextRequest, context: any) {
  const params = context?.params || {};
  const res = await axios.delete(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080"}/important-dates/${params.id}`, { withCredentials: true });
  return NextResponse.json(res.data);
}
