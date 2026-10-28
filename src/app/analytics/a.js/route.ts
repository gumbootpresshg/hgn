export const runtime = "nodejs";
// A local, cookieless page-view recorder. It deliberately does not fetch a
// third-party script or send identifiers off-site.
export async function GET() {
  const script = `(()=>{if(window.__hgnPageAnalytics||navigator.doNotTrack==='1'||navigator.globalPrivacyControl)return;window.__hgnPageAnalytics=true;let previous='';const record=()=>{const path=location.pathname;if(path===previous||/\\/(admin|account|api|signin|signout|callback)(\\/|$|-)/i.test(path))return;previous=path;const body=JSON.stringify({eventType:'page_view',pagePath:path,source:'site'});try{if(navigator.sendBeacon){navigator.sendBeacon('/api/analytics/record',new Blob([body],{type:'application/json'}));return}}catch{}fetch('/api/analytics/record',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{})};for(const method of ['pushState','replaceState']){const original=history[method];history[method]=function(...args){const result=original.apply(this,args);record();return result}}addEventListener('popstate',record);if(document.visibilityState==='visible')record();else document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')record()})})();`;
  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
