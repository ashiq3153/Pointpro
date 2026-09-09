import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok",{headers:cors});
  try {
    const auth=req.headers.get("Authorization");
    if(!auth) throw new Error("Unauthorized");
    const url=Deno.env.get("SUPABASE_URL")!;
    const anon=Deno.env.get("SUPABASE_ANON_KEY")!;
    const client=createClient(url,anon,{global:{headers:{Authorization:auth}}});
    const {data:{user},error}=await client.auth.getUser();
    if(error||!user) throw new Error("Unauthorized");

    const {data:session}=await client.from("mining_sessions").select("id").eq("user_id",user.id).eq("status","active").order("started_at",{ascending:false}).limit(1).maybeSingle();
    if(!session) return new Response(JSON.stringify({error:"No active mining session"}),{status:409,headers:{...cors,"Content-Type":"application/json"}});

    const {data,error:resultError}=await client.rpc("settle_mining",{p_session_id:session.id});
    if(resultError) throw resultError;

    return new Response(JSON.stringify(data),{headers:{...cors,"Content-Type":"application/json"}});
  } catch(e) {
    return new Response(JSON.stringify({error:String(e)}),{status:500,headers:{...cors,"Content-Type":"application/json"}});
  }
});