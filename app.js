const $=id=>document.getElementById(id);
let api=localStorage.getItem("as_admin_api")||"https://premiumuserpanel4.netlify.app";$("api").value=api;
const ADMIN="/.netlify/functions/admin";
function base(v){return String(v||"").trim().replace(/\/+$/,"")}
function msg(x,ok=false){$("msg").textContent=x;$("msg").style.color=ok?"#50ff72":"#ffd35c"}
async function call(action,extra={}){
 const r=await fetch(ADMIN+"?action="+encodeURIComponent(action),{
  method:"POST",headers:{"Content-Type":"application/json"},
  body:JSON.stringify({userApi:base($("api").value),password:$("pass").value,...extra})
 });
 const raw=await r.text();let d;
 try{d=JSON.parse(raw)}catch{throw new Error("Admin Function returned non-JSON ("+r.status+")")}
 if(!r.ok||d.ok===false)throw new Error(d.error||"Request failed");
 return d;
}
$("save").onclick=()=>{const v=base($("api").value);if(!/^https?:\/\//i.test(v))return msg("Invalid URL");localStorage.setItem("as_admin_api",v);msg("API URL saved",true)};
async function refresh(){const d=await call("adminStatus");$("status").textContent=d.active?"● CONNECTED • ACTIVE KEY":"● CONNECTED • NO ACTIVE KEY";$("key").textContent=d.key||"NO ACTIVE KEY";$("short").value=d.shortLink||"";$("controls").hidden=false}
$("login").onclick=async()=>{try{await refresh();msg("Connected successfully",true)}catch(e){$("status").textContent="● CONNECTION FAILED";msg(e.message)}};
$("gen").onclick=async()=>{try{const d=await call("generate",{duration:Number($("num").value),unit:$("unit").value});$("key").textContent=d.key;msg("New key generated",true);await refresh()}catch(e){msg(e.message)}};
$("copy").onclick=async()=>{const k=$("key").textContent;if(!k||k==="NO ACTIVE KEY")return msg("No active key");await navigator.clipboard.writeText(k);msg("Key copied",true)};
$("reset").onclick=async()=>{if(!confirm("Reset/revoke current key?"))return;try{await call("reset");await refresh();msg("Key revoked",true)}catch(e){msg(e.message)}};
$("saveShort").onclick=async()=>{try{const d=await call("setShortLink",{shortLink:$("short").value});$("short").value=d.shortLink;msg("Short link saved",true)}catch(e){msg(e.message)}};
