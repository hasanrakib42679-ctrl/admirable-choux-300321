const H={"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST,OPTIONS"};
const out=(s,d)=>new Response(JSON.stringify(d),{status:s,headers:H});
const PASSWORD=process.env.ADMIN_PASSWORD||"ANAMUL";
export default async function handler(req){
 if(req.method==="OPTIONS")return new Response("",{status:204,headers:H});
 if(req.method!=="POST")return out(405,{ok:false,error:"POST required"});
 try{
  const b=await req.json();
  if(String(b.password||"")!==PASSWORD)return out(401,{ok:false,error:"Wrong admin password"});
  const api=String(b.userApi||"").trim().replace(/\/+$/,"");
  if(!/^https?:\/\//i.test(api))return out(400,{ok:false,error:"Invalid User Panel URL"});
  const action=new URL(req.url).searchParams.get("action")||"adminStatus";
  const allowed=["adminStatus","generate","reset","setShortLink"];
  if(!allowed.includes(action))return out(400,{ok:false,error:"Unknown action"});
  const r=await fetch(api+"/.netlify/functions/api?action="+encodeURIComponent(action),{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({password:PASSWORD,duration:b.duration,unit:b.unit,shortLink:b.shortLink})
  });
  const raw=await r.text();let d;
  try{d=JSON.parse(raw)}catch{return out(502,{ok:false,error:"User API returned non-JSON ("+r.status+")"})}
  return out(r.status,d);
 }catch(e){return out(500,{ok:false,error:e?.message||"Admin server error"})}
}
