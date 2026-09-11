import { createClient } from "@supabase/supabase-js";
import { guidePlaces as fallbackPlaces, type GuidePlace } from "@/lib/guide-places";

export async function getPublishedGuidePlaces(): Promise<GuidePlace[]> {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key) return fallbackPlaces;
  const supabase=createClient(url,key,{auth:{persistSession:false}});
  const {data,error}=await supabase.from("hgn_guide_places").select("slug,name,category,community,latitude,longitude,description,address,phone,website,hours,amenities,caution,featured").eq("published",true).order("featured",{ascending:false}).order("name");
  if(error||!data?.length) return fallbackPlaces;
  return data.map((row:any)=>({id:row.slug,name:row.name,category:row.category,community:row.community,latitude:Number(row.latitude||0),longitude:Number(row.longitude||0),description:row.description||"",address:row.address||undefined,phone:row.phone||undefined,website:row.website||undefined,hours:row.hours||undefined,amenities:Array.isArray(row.amenities)?row.amenities:[],caution:row.caution||undefined,featured:Boolean(row.featured)})) as GuidePlace[];
}
