import { createHash } from "node:crypto";

function decode(value:string){return value.replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/&lt;/gi,"<").replace(/&gt;/gi,">")}
function one(value:string|undefined|null){return decode(String(value||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim())}
function match(html:string,re:RegExp){return one(html.match(re)?.[1])}
function collectJsonLd(html:string){const out:any[]=[];for(const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{const parsed=JSON.parse(m[1]);if(Array.isArray(parsed))out.push(...parsed);else if(parsed?.['@graph'])out.push(...parsed['@graph']);else out.push(parsed)}catch{}}return out}
function firstBusiness(nodes:any[]){return nodes.find(x=>{const t=x?.['@type'];const a=Array.isArray(t)?t:[t];return a.some((v:string)=>['LocalBusiness','TouristAttraction','Museum','Campground','Hospital','Airport','GovernmentOffice','Organization','Park'].includes(v))})}
export function parseGuideSource(html:string,url:string){
 const nodes=collectJsonLd(html);const entity=firstBusiness(nodes)||{};
 const title=one(entity.name)||match(html,/<title[^>]*>([\s\S]*?)<\/title>/i);
 const description=one(entity.description)||match(html,/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']*)/i)||match(html,/<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["'](?:description|og:description)["']/i);
 const phone=one(entity.telephone)||match(html,/(?:tel:|Telephone[^0-9+]*)(\+?1?[\s().-]*\d{3}[\s().-]*\d{3}[\s.-]*\d{4})/i);
 const address=typeof entity.address==='string'?one(entity.address):one([entity.address?.streetAddress,entity.address?.addressLocality,entity.address?.addressRegion,entity.address?.postalCode].filter(Boolean).join(', '));
 const hours=Array.isArray(entity.openingHours)?entity.openingHours.join('; '):one(entity.openingHours||entity.openingHoursSpecification?.map?.((x:any)=>`${[].concat(x.dayOfWeek||[]).map((d:string)=>d.split('/').pop()).join(', ')} ${x.opens||''}-${x.closes||''}`).join('; '));
 const canonical=match(html,/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)||url;
 const text=one(html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')).slice(0,1800);
 const hash=createHash('sha256').update(JSON.stringify({title,description,phone,address,hours,text})).digest('hex');
 return {title,description,phone,address,hours,canonical,text,hash};
}
