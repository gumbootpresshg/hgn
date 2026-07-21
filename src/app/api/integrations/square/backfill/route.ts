import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const roles = new Set(["admin","administrator","publisher","editor","newsroom","super_admin","superadmin"]);
const apiVersion = "2026-07-15";

type Json = Record<string, any>;

function money(value: any){ return Number(value?.amount || 0) / 100; }
function isoDay(value: string){ return new Date(`${value}T00:00:00.000Z`).toISOString(); }
function addMonth(date: Date){ return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth()+1, 1)); }
function monthKey(date: Date){ return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,"0")}`; }

async function jsonFetch(url:string, init:RequestInit){
  const response = await fetch(url,{...init,cache:"no-store"});
  const body = await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(body?.errors?.[0]?.detail || body?.message || `Request failed (${response.status})`);
  return body;
}

export async function POST(req:NextRequest){
  try{
    const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,"");
    const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
    const square=process.env.SQUARE_ACCESS_TOKEN;
    const location=process.env.SQUARE_LOCATION_ID;
    if(!supabaseUrl||!anon||!service) return NextResponse.json({error:"Supabase server settings are incomplete."},{status:500});
    if(!square||!location) return NextResponse.json({error:"Square is not configured."},{status:503});

    const auth=req.headers.get("authorization")||"";
    const token=auth.startsWith("Bearer ")?auth.slice(7).trim():"";
    if(!token) return NextResponse.json({error:"Login required."},{status:401});
    const user=await jsonFetch(`${supabaseUrl}/auth/v1/user`,{headers:{apikey:anon,Authorization:`Bearer ${token}`}});
    const profiles=await jsonFetch(`${supabaseUrl}/rest/v1/hgn_profiles?select=account_type,is_admin,can_access_publisher_tools,admin_role&user_id=eq.${user.id}&limit=5`,{headers:{apikey:anon,Authorization:`Bearer ${token}`}});
    const allowed=Array.isArray(profiles)&&profiles.some((x:Json)=>x.is_admin===true||x.can_access_publisher_tools===true||roles.has(String(x.account_type||"").toLowerCase())||roles.has(String(x.admin_role||"").toLowerCase()));
    if(!allowed) return NextResponse.json({error:"Publisher access required."},{status:403});

    const input=await req.json().catch(()=>({}));
    const startDate=String(input.startDate||"");
    const endDate=String(input.endDate||"");
    const period=String(input.period||"");
    if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(endDate)||!/^\d{4}-\d{2}$/.test(period)) return NextResponse.json({error:"Start date, end date and month are required."},{status:400});

    const periodStart=new Date(`${period}-01T00:00:00.000Z`);
    const requestedStart=new Date(isoDay(startDate));
    const requestedEnd=new Date(isoDay(endDate));
    const begin=new Date(Math.max(periodStart.getTime(),requestedStart.getTime()));
    const next=addMonth(periodStart);
    const endExclusive=new Date(Math.min(next.getTime(),requestedEnd.getTime()+86400000));
    if(begin>=endExclusive) return NextResponse.json({period,skipped:true,payments:0,invoices:0,orders:0,customers:0});

    const base=process.env.SQUARE_ENVIRONMENT==="sandbox"?"https://connect.squareupsandbox.com":"https://connect.squareup.com";
    const squareHeaders={Authorization:`Bearer ${square}`,"Content-Type":"application/json","Square-Version":apiVersion};
    const dbHeaders={apikey:service,Authorization:`Bearer ${service}`,"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"};
    const upsert=async(table:string,rows:Json[],conflict:string)=>{ if(!rows.length) return; await jsonFetch(`${supabaseUrl}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflict)}`,{method:"POST",headers:dbHeaders,body:JSON.stringify(rows)}); };

    let paymentCount=0, invoiceCount=0, orderCount=0, customerCount=0;
    let cursor="";
    do{
      const url=new URL(`${base}/v2/payments`);
      url.searchParams.set("location_id",location);url.searchParams.set("begin_time",begin.toISOString());url.searchParams.set("end_time",endExclusive.toISOString());url.searchParams.set("sort_order","ASC");url.searchParams.set("limit","100");if(cursor)url.searchParams.set("cursor",cursor);
      const body=await jsonFetch(url.toString(),{headers:squareHeaders});
      const rows=(body.payments||[]).map((x:Json)=>{const fees=(x.processing_fee||[]).reduce((n:number,f:Json)=>n+Number(f.amount_money?.amount||0),0);return {provider:"square",external_id:String(x.id),transaction_date:x.created_at||null,payer_name:x.buyer_email_address||null,payer_email:x.buyer_email_address||null,transaction_type:x.source_type||"payment",status:x.status||null,description:x.note||x.statement_description_identifier||null,gross_amount:money(x.amount_money),fee_amount:fees/100,net_amount:(Number(x.amount_money?.amount||0)-fees)/100,currency:x.amount_money?.currency||"CAD",imported_from:"square_full_backfill",raw_data:x};});
      await upsert("hgn_external_transactions",rows,"provider,external_id"); paymentCount+=rows.length; cursor=body.cursor||"";
    }while(cursor);

    cursor="";
    do{
      const url=new URL(`${base}/v2/invoices`);url.searchParams.set("location_id",location);url.searchParams.set("limit","100");if(cursor)url.searchParams.set("cursor",cursor);
      const body=await jsonFetch(url.toString(),{headers:squareHeaders});
      const invoices=(body.invoices||[]).filter((x:Json)=>{const d=x.created_at?new Date(x.created_at):null;return d&&d>=begin&&d<endExclusive;});
      const rows=invoices.map((x:Json)=>({square_invoice_id:String(x.id),square_order_id:x.order_id||null,square_customer_id:x.primary_recipient?.customer_id||null,invoice_number:x.invoice_number||null,title:x.title||null,status:x.status||null,location_id:x.location_id||location,invoice_date:x.invoice_date||null,due_date:x.payment_requests?.[0]?.due_date||null,amount_requested:money(x.payment_requests?.[0]?.computed_amount_money),currency:x.payment_requests?.[0]?.computed_amount_money?.currency||"CAD",raw_data:x,synced_at:new Date().toISOString()}));
      await upsert("hgn_square_invoices",rows,"square_invoice_id"); invoiceCount+=rows.length; cursor=body.cursor||"";
    }while(cursor);

    cursor="";
    do{
      const body=await jsonFetch(`${base}/v2/orders/search`,{method:"POST",headers:squareHeaders,body:JSON.stringify({location_ids:[location],cursor:cursor||undefined,limit:100,query:{filter:{date_time_filter:{created_at:{start_at:begin.toISOString(),end_at:endExclusive.toISOString()}}},sort:{sort_field:"CREATED_AT",sort_order:"ASC"}}})});
      const rows=(body.orders||[]).map((x:Json)=>({square_order_id:String(x.id),square_customer_id:x.customer_id||null,location_id:x.location_id||location,state:x.state||null,created_at_square:x.created_at||null,updated_at_square:x.updated_at||null,closed_at_square:x.closed_at||null,total_amount:money(x.total_money),total_tax:money(x.total_tax_money),total_discount:money(x.total_discount_money),currency:x.total_money?.currency||"CAD",description:(x.line_items||[]).map((i:Json)=>`${i.quantity||"1"} × ${i.name||i.variation_name||"Item"}`).join("; ")||null,raw_data:x,synced_at:new Date().toISOString()}));
      await upsert("hgn_square_orders",rows,"square_order_id"); orderCount+=rows.length; cursor=body.cursor||"";
    }while(cursor);

    cursor="";
    do{
      const body=await jsonFetch(`${base}/v2/customers/search`,{method:"POST",headers:squareHeaders,body:JSON.stringify({cursor:cursor||undefined,limit:100,query:{sort:{field:"CREATED_AT",order:"ASC"}}})});
      const rows=(body.customers||[]).map((x:Json)=>({square_customer_id:String(x.id),company_name:x.company_name||null,given_name:x.given_name||null,family_name:x.family_name||null,email_address:x.email_address||null,phone_number:x.phone_number||null,reference_id:x.reference_id||null,created_at_square:x.created_at||null,updated_at_square:x.updated_at||null,raw_data:x,synced_at:new Date().toISOString()}));
      await upsert("hgn_square_customers",rows,"square_customer_id"); customerCount+=rows.length; cursor=body.cursor||"";
    }while(cursor);

    return NextResponse.json({period:monthKey(periodStart),payments:paymentCount,invoices:invoiceCount,orders:orderCount,customers:customerCount});
  }catch(error){ return NextResponse.json({error:error instanceof Error?error.message:"Square history import failed."},{status:500}); }
}
