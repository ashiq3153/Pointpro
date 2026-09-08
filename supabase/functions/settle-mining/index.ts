import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok",{headers:cors});
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:{...cors,"Content-Type":"application/json"}});

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const adminKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anon, {global:{headers:{Authorization:auth}}});
    const {data:{user},error:userError}=await userClient.auth.getUser();
    if(userError || !user) return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:{...cors,"Content-Type":"application/json"}});

    const admin=createClient(url,adminKey);
    const {data:session,error:sessionError}=await admin.from("mining_sessions").select("id,user_id,started_at,stopped_at,rate,boost_multiplier,status").eq("user_id",user.id).eq("status","active").order("started_at",{ascending:false}).limit(1).maybeSingle();
    if(sessionError) throw sessionError;
    if(!session) return new Response(JSON.stringify({error:"No active mining session"}),{status:409,headers:{...cors,"Content-Type":"application/json"}});

    const now=Date.now();
    const start=new Date(session.started_at).getTime();
    const elapsed=Math.max(0,Math.min((now-start)/1000,86400));
    const rate=Number(session.rate)||0;
    const multiplier=Number(session.boost_multiplier)||1;
    const amount=elapsed*rate*multiplier;

    const {data:balance,error:balanceError}=await admin.from("balances").select("available,lifetime_earned").eq("user_id",user.id).single();
    if(balanceError) throw balanceError;

    const {error:txError}=await admin.from("transactions").insert({user_id:user.id,type:"mining",amount,status:"completed",reference_id:session.id,metadata:{elapsed_seconds:elapsed,rate,multiplier}});
    if(txError) throw txError;

    const {error:updateError}=await admin.from("balances").update({available:Number(balance.available)+amount,lifetime_earned:Number(balance.lifetime_earned)+amount,updated_at:new Date().toISOString()}).eq("user_id",user.id);
    if(updateError) throw updateError;

    const {error:stopError}=await admin.from("mining_sessions").update({status:"stopped",stopped_at:new Date().toISOString()}).eq("id",session.id);
    if(stopError) throw stopError;

    return new Response(JSON.stringify({settled:amount,seconds:elapsed,rate,multiplier}),{headers:{...cors,"Content-Type":"application/json"}});
  } catch(e) {
    return new Response(JSON.stringify({error:String(e)}),{status:500,headers:{...cors,"Content-Type":"application/json"}});
  }
});