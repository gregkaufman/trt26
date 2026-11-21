/* Keeps the trip app opening with no signal. Pages: network first (4 s), then cache. Other files: cache first, refresh in the background. */
const C='trt26-v7';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./voice.js'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
 if(e.request.method!=='GET'||u.origin!==location.origin)return;
 if(e.request.mode==='navigate'){e.respondWith(caches.open(C).then(async c=>{
  const net=fetch(e.request).then(r=>{if(r&&r.ok)c.put('./index.html',r.clone());return r});
  const timeout=new Promise(res=>setTimeout(res,4000));
  try{const r=await Promise.race([net,timeout]);if(r)return r}catch(_){}
  return (await c.match('./index.html'))||net}));return}
 e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(e.request,{ignoreSearch:true});
  const net=fetch(e.request).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);
  return hit||net}))});
