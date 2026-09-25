import { NextResponse } from "next/server";
import { publicNewsletterSignupConfig } from "@/lib/newsletters/products";
export const runtime = "nodejs";
export async function GET(){ return NextResponse.json(await publicNewsletterSignupConfig()); }
