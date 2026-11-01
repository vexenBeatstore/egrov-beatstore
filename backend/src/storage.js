export async function signedDownload(env,path,bucket,expires=90){
 const base=env.SUPABASE_URL.replace(/\/$/,"");
 const res=await fetch(`${base}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${path.split("/").map(encodeURIComponent).join("/")}`,{method:"POST",headers:{"apikey":env.SUPABASE_SECRET_KEY,"Authorization":`Bearer ${env.SUPABASE_SECRET_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({expiresIn:expires})});
 if(!res.ok)throw new Error("Storage signing failed");
 const data=await res.json();return `${base}/storage/v1${data.signedURL}`;
}
