export function requestIP(req){
  // Cloudflare supplies the original client address; XFF also includes AWS gateway hops.
  // If unavailable, leave it unknown rather than mislabel a proxy as a visitor.
  const raw=(req.headers.get('cf-connecting-ip')||'').trim();
  if(/^\d{1,3}(\.\d{1,3}){3}$/.test(raw)&&raw.split('.').every(n=>+n<=255))return raw;
  if(raw.includes(':')&&/^[a-f0-9:]{3,45}$/i.test(raw)){try{new URL('http://['+raw+']/');return raw;}catch{}}
  return null;
}
export function visit(body,req){
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if(!uuid.test(body.id||'')||!uuid.test(body.visitor||''))throw Error('Invalid visit identity');
  if(typeof body.path!=='string'||body.path.length>300||!/^\/(?!\/)[^?#\s]*$/.test(body.path)||/admin|site-stats|privacy/i.test(body.path))throw Error('Invalid page');
  let referrer='';try{const u=new URL(body.referrer);if(['http:','https:'].includes(u.protocol))referrer=u.hostname.slice(0,200);}catch{}
  const ua=req.headers.get('user-agent')||'';
  const browser=/Edg\//.test(ua)?'Edge':/Firefox\//.test(ua)?'Firefox':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'Other';
  const device=/iPad|Tablet/i.test(ua)?'Tablet':/Mobile|Android|iPhone/i.test(ua)?'Mobile':'Desktop';
  return {id:body.id,path:body.path,referrer,browser,device,ip:requestIP(req)};
}
