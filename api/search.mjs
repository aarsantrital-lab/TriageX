// Optional, bring-your-own-key search relay. It never uses a server-side provider key.
const ALLOWED_PROVIDERS = new Set(['tavily', 'exa']);
const MAX_BODY = 12000;
const MAX_QUERY = 4000;
function cors(request) {
  const origin = request.headers.get('origin');
  const host = new URL(request.url).origin;
  const configured = (process.env.TRIAGEX_ALLOWED_ORIGINS || 'https://aarsantrital-lab.github.io').split(',').map(x => x.trim()).filter(Boolean);
  const headers = new Headers({ 'Cache-Control': 'no-store', 'Vary': 'Origin', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Search-Key' });
  if (origin && (origin === host || configured.includes(origin))) headers.set('Access-Control-Allow-Origin', origin);
  return { origin, permitted: !origin || origin === host || configured.includes(origin), headers };
}
function json(data, status, headers) {
  const h = new Headers(headers); h.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), {status, headers:h});
}
export default { async fetch(request) {
  const {permitted,headers} = cors(request);
  if (!permitted) return json({error:'Origin not allowed.'},403,headers);
  if (request.method === 'OPTIONS') return new Response(null,{status:204,headers});
  if (request.method !== 'POST') return json({error:'Only POST is supported.'},405,headers);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({error:'Expected JSON.'},415,headers);
  const key = request.headers.get('x-search-key') || '';
  if (!key || key.length > 2048 || /[\r\n]/.test(key)) return json({error:'Provide a valid search key.'},400,headers);
  let raw, data;
  try { raw = await request.text(); if (raw.length > MAX_BODY) return json({error:'Request too large.'},413,headers); data=JSON.parse(raw); }
  catch { return json({error:'Invalid JSON.'},400,headers); }
  const provider=data?.provider, query=typeof data?.query==='string'?data.query.trim():'';
  if (!ALLOWED_PROVIDERS.has(provider) || !query || query.length>MAX_QUERY) return json({error:'Unsupported provider or invalid query.'},400,headers);
  const upstream=provider==='tavily'?'https://api.tavily.com/search':'https://api.exa.ai/search';
  const upstreamHeaders={'Content-Type':'application/json'};
  const body=provider==='tavily'?{api_key:key,query,search_depth:'basic',max_results:5}:{query,numResults:5,contents:{text:{maxCharacters:1500}}};
  if(provider==='exa')upstreamHeaders['x-api-key']=key;
  try {
    const response=await fetch(upstream,{method:'POST',headers:upstreamHeaders,body:JSON.stringify(body),signal:AbortSignal.timeout(25000)});
    if(!response.ok) return json({error:`Search provider returned HTTP ${response.status}.`},response.status>=400&&response.status<600?response.status:502,headers);
    const data=await response.json();
    if(!Array.isArray(data.results)) return json({error:'Search provider returned an unexpected response.'},502,headers);
    return json({results:data.results.slice(0,5).map(x=>({title:String(x.title||'').slice(0,500),url:String(x.url||'').slice(0,3000),content:String(x.content||x.text||'').slice(0,5000)}))},200,headers);
  } catch { return json({error:'Search provider could not be reached.'},502,headers); }
}};
