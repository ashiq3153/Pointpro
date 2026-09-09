"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, ChevronRight, CircleHelp, Copy, Gift, Home as HomeIcon, ListChecks, Share2, ShieldCheck, Sparkles, UserRound, Users, WalletCards, Zap, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Play, Pause, CheckCircle2, TrendingUp, BarChart3, Menu, Mail, LockKeyhole, LogIn, UserPlus, LogOut } from "lucide-react";

type Tab = "home" | "mine" | "tasks" | "wallet" | "profile";
const SPEED=0.00124;
const APP_URL="https://pointpro-one.vercel.app";
const REFERRAL="PPUSER";

export default function PointProApp(){
 const [tab,setTab]=useState<Tab>("home"),[balance,setBalance]=useState(0),[today,setToday]=useState(0),[mining,setMining]=useState(false),[boost,setBoost]=useState(false),[toast,setToast]=useState(""),[showIntro,setShowIntro]=useState(true),[userId,setUserId]=useState<string|null>(null),[loadingData,setLoadingData]=useState(true);
 const speed=boost?SPEED*1.2:SPEED;
 const refreshBalance=async()=>{if(!userId)return;const {data}=await supabase.from("balances").select("available").eq("user_id",userId).maybeSingle();if(data)setBalance(Number(data.available)||0)};
 useEffect(()=>{let mounted=true;let unsubscribe=()=>{};(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!mounted)return;setUserId(user?.id??null);if(user){const {data}=await supabase.from("balances").select("available").eq("user_id",user.id).maybeSingle();if(mounted&&data)setBalance(Number(data.available)||0);const {data:s}=await supabase.from("mining_sessions").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();if(mounted)setMining(!!s);const {data:t}=await supabase.from("transactions").select("amount").eq("user_id",user.id).eq("type","mining").eq("status","completed").gte("created_at",new Date(new Date().setHours(0,0,0,0)).toISOString());if(mounted)setToday((t||[]).reduce((sum:any,x:any)=>sum+(Number(x.amount)||0),0))}setLoadingData(false);const sub=supabase.auth.onAuthStateChange((_event,session)=>{if(!mounted)return;setUserId(session?.user?.id??null);if(!session?.user){setBalance(0);setToday(0);setMining(false);setTab("home")}});unsubscribe=()=>sub.data.subscription.unsubscribe()})();return()=>{mounted=false;unsubscribe()}},[]);
 useEffect(()=>{if(!mining||!supabase||!userId)return;const id=window.setInterval(async()=>{const {data,error}=await supabase.functions.invoke("settle-mining");if(!error&&data?.settled){const earned=Number(data.settled)||0;if(earned>0){setBalance(v=>v+earned);setToday(v=>v+earned)}}},15000);return()=>clearInterval(id)},[mining,userId]);
 const toggleMining=async()=>{const next=!mining;if(!supabase||!userId){setMining(next);notify(next?"Mining started locally — connect Supabase to persist":"Mining paused");return}if(next){const {data, error}=await supabase.rpc("start_mining");if(error){notify(error.message?.includes("already active")?"Mining is already active":"Could not start mining");return}setMining(true);notify("Mining started")}else{const {data,error}=await supabase.rpc("stop_mining");if(error){notify("Could not save mining earnings");return}const earned=Number(data?.settled)||0;if(earned>0){setBalance(v=>v+earned);setToday(v=>v+earned)}setMining(false);notify("Mining stopped and earnings saved")}};
 useEffect(()=>{const id=window.setTimeout(()=>setShowIntro(false),2400);return()=>clearTimeout(id)},[]);
 useEffect(()=>{if(!toast)return;const id=setTimeout(()=>setToast(""),2200);return()=>clearTimeout(id)},[toast]);
 const notify=(s:string)=>setToast(s), progress=Math.min(100,Math.round(today/(SPEED*86400)*100));
 const copy=async()=>{try{await navigator.clipboard.writeText(`${APP_URL}/?ref=${REFERRAL}`);notify("Referral link copied")}catch{notify("Copy failed")}};
 const share=async()=>{const url=`${APP_URL}/?ref=${REFERRAL}`;if(navigator.share)await navigator.share({title:"PointPro",text:"Join PointPro",url});else await copy()};
 if(loadingData)return <div className="min-h-screen grid place-items-center bg-[#06101d] text-white"><div className="text-center"><img src="/pointpro-mark.svg" className="mx-auto h-16 w-16"/><p className="mt-4 text-sm text-slate-400">Loading PointPro…</p></div></div>;
 if(!userId)return <AuthScreen/>;
 return <div className="min-h-screen bg-[#f5f7fb] text-[#18243b]">
  {showIntro&&<div className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#071426]">
   <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(47,112,244,.32),transparent_38%),radial-gradient(circle_at_50%_75%,rgba(37,214,124,.14),transparent_34%)]"/>
   <div className="relative flex flex-col items-center text-center">
    <div className="intro-logo relative grid h-28 w-28 place-items-center rounded-[32px] bg-white shadow-[0_0_55px_rgba(47,112,244,.45)]">
     <img src="/pointpro-mark.svg" alt="PointPro" className="h-20 w-20"/>
     <span className="intro-ring absolute inset-[-10px] rounded-[38px] border border-white/15"/>
    </div>
    <div className="intro-title mt-7 text-[34px] font-black tracking-[-1.8px] text-white">Point<span className="text-[#25d67c]">Pro</span></div>
    <p className="intro-sub mt-2 text-sm font-medium tracking-[.22em] text-slate-400">PP COIN MINING</p>
    <div className="mt-7 h-1 w-28 overflow-hidden rounded-full bg-white/10"><div className="intro-bar h-full w-1/2 rounded-full bg-[#25d67c]"/></div>
   </div>
   <style jsx>{`
    .intro-logo{animation:introLogo .85s cubic-bezier(.2,.8,.2,1) both}.intro-ring{animation:introRing 1.5s ease-out infinite}.intro-title{animation:introText .7s .25s ease-out both}.intro-sub{animation:introText .7s .4s ease-out both}.intro-bar{animation:introBar 2s .2s ease-in-out both}
    @keyframes introLogo{0%{opacity:0;transform:scale(.55) rotate(-12deg)}70%{opacity:1;transform:scale(1.06) rotate(2deg)}100%{transform:scale(1) rotate(0)}} @keyframes introRing{0%{opacity:.8;transform:scale(.88)}100%{opacity:0;transform:scale(1.25)}} @keyframes introText{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}} @keyframes introBar{0%{transform:translateX(-120%)}100%{transform:translateX(230%)}}
   `}</style>
  </div>}

  <header className="sticky top-0 z-40 border-b border-[#e5e9f2] bg-white/95 backdrop-blur"><div className="mx-auto flex h-[70px] max-w-[680px] items-center justify-between px-5">
   <div className="flex items-center gap-2"><img src="/pointpro-mark.svg" className="h-9 w-9"/><div className="text-[25px] font-black tracking-[-1.5px]">Point<span className="text-[#25d67c]">Pro</span></div></div>
   <button onClick={()=>notify("Telegram will be connected from your bot settings")} className="flex items-center gap-2 rounded-2xl bg-[#159fe9] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(21,159,233,.2)]">✈ Telegram</button>
  </div></header>
  <main className="mx-auto max-w-[680px] px-4 pb-28 pt-5">
   {tab==="home"&&<HomePage p={{balance,today,mining,speed,progress,setMining:toggleMining,setTab,notify}}/>}
   {tab==="mine"&&<Mine p={{balance,today,mining,speed,boost,setMining:toggleMining,setBoost,notify}}/>}
   {tab==="tasks"&&<Tasks p={{mining,setMining:toggleMining,share,notify,userId,refreshBalance}}/>}
   {tab==="wallet"&&<Wallet p={{balance,today,userId,notify,refreshBalance}}/>}
   {tab==="profile"&&<Profile p={{copy,share,userId}}/>}
  </main>
  <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e3e8f1] bg-white/98 backdrop-blur"><div className="mx-auto grid max-w-[680px] grid-cols-5">
   {([["home",HomeIcon,"Home"],["mine",Zap,"Mine"],["tasks",ListChecks,"Tasks"],["wallet",WalletCards,"Wallet"],["profile",UserRound,"Profile"]] as const).map(([k,I,l])=><button key={k} onClick={()=>setTab(k)} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${tab===k?"text-[#2868ed]":"text-[#8993a6]"}`}><I size={22} strokeWidth={tab===k?2.5:2}/><span>{l}</span></button>)}
  </div></nav>
  {toast&&<div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-2xl bg-[#18243b] px-4 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
 </div>
}

function AuthScreen(){
 const [mode,setMode]=useState<"login"|"register">("login");
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [name,setName]=useState(""); const [referral,setReferral]=useState("");
 const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
 useEffect(()=>{const r=new URLSearchParams(window.location.search).get("ref");if(r)setReferral(r)},[]);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setMessage("");
  try{
   if(mode==="login"){
    const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
    if(error)throw error; setMessage("Login successful.");
   }else{
    if(password.length<6)throw new Error("Password must be at least 6 characters.");
    const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{display_name:name.trim(),referral_code:referral.trim()||null}}});
    if(error)throw error;
    if(data.session)setMessage("Account created successfully.");else setMessage("Account created. Please check your email to verify your account, then login.");
   }
  }catch(err:any){setMessage(err?.message||"Something went wrong.")}finally{setBusy(false)}
 };
 return <div className="min-h-screen bg-[#06101d] px-4 py-8 text-white"><div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[430px] items-center justify-center"><section className="w-full rounded-[30px] border border-white/10 bg-[#0b1726] p-5 shadow-[0_25px_80px_rgba(0,0,0,.4)]">
  <div className="text-center"><img src="/pointpro-mark.svg" className="mx-auto h-20 w-20"/><h1 className="mt-4 text-3xl font-black">Point<span className="text-[#25d67c]">Pro</span></h1><p className="mt-1 text-xs font-bold tracking-[.2em] text-slate-400">PP COIN MINING</p></div>
  <div className="mt-7 grid grid-cols-2 rounded-2xl bg-[#06101d] p-1"><button type="button" onClick={()=>{setMode("login");setMessage("")}} className={`rounded-xl py-3 text-sm font-bold ${mode==="login"?"bg-[#2f70f4] text-white":"text-slate-400"}`}><LogIn size={16} className="mr-1 inline"/> Login</button><button type="button" onClick={()=>{setMode("register");setMessage("")}} className={`rounded-xl py-3 text-sm font-bold ${mode==="register"?"bg-[#2f70f4] text-white":"text-slate-400"}`}><UserPlus size={16} className="mr-1 inline"/> Register</button></div>
  <form onSubmit={submit} className="mt-5 space-y-3">
   {mode==="register"&&<AuthInput icon={<UserRound size={18}/>} value={name} onChange={setName} placeholder="Full name" required/>}
   <AuthInput icon={<Mail size={18}/>} value={email} onChange={setEmail} placeholder="Email address" type="email" required/>
   <AuthInput icon={<LockKeyhole size={18}/>} value={password} onChange={setPassword} placeholder="Password (minimum 6 characters)" type="password" required/>
   {mode==="register"&&<AuthInput icon={<Gift size={18}/>} value={referral} onChange={setReferral} placeholder="Referral code (optional)"/>}
   <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25d67c] py-3.5 font-black text-[#06101d] disabled:opacity-60">{busy?"Please wait…":mode==="login"?"Login to PointPro":"Create PointPro Account"}</button>
  </form>
  {message&&<div className={`mt-4 rounded-2xl p-3 text-center text-sm ${message.toLowerCase().includes("success")||message.toLowerCase().includes("created")?"bg-[#0d3b2a] text-[#74f2ad]":"bg-[#3d1820] text-[#ff9aaa]"}`}>{message}</div>}
  <p className="mt-5 text-center text-xs leading-5 text-slate-500">Your account is secured by Supabase Authentication. Your mining data stays linked to your account.</p>
 </section></div></div>
}
function AuthInput({icon,value,onChange,placeholder,type="text",required=false}:any){return <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#06101d] px-4 py-3 text-slate-400 focus-within:border-[#2f70f4]"><span>{icon}</span><input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type} required={required}/></label>}

function HomePage({p}:any){return <div className="space-y-5">
 <div className="flex items-start justify-between"><div><p className="text-[15px] text-[#8993a6]">Welcome back 👋</p><h1 className="mt-1 text-[30px] font-black tracking-tight">My Dashboard</h1></div><button onClick={()=>p.notify("No new notifications")} className="rounded-full bg-white p-3 shadow-[0_8px_25px_rgba(31,51,86,.09)]"><Bell size={20}/></button></div>





 <section className="rounded-[30px] bg-white p-5 shadow-[0_12px_30px_rgba(31,51,86,.08)]">
  <div className="flex items-center justify-between"><div><h2 className="text-[21px] font-black">Mining Status</h2><p className="mt-0.5 text-xs text-[#8993a6]">Your miner is running in real time</p></div><span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${p.mining?"bg-[#e8fff3] text-[#20b96c]":"bg-[#f0f2f6] text-[#8993a6]"}`}>{p.mining?"● Active":"Paused"}</span></div>
  <div className="mt-5 flex items-center gap-5">
   <div className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full p-1" style={{background:`conic-gradient(#2f70f4 ${Math.max(4,p.progress)}%,#e8edf5 0)`}}>
    <div className="grid h-full w-full place-items-center rounded-full bg-white text-center"><div><Zap className={`mx-auto ${p.mining?"text-[#2f70f4]":"text-[#8993a6]"}`} size={23}/><b className="mt-1 block text-lg tabular-nums">{p.balance.toFixed(3)}</b><small className="text-[9px] text-[#8993a6]">PP COIN</small></div></div>
   </div>
   <div className="flex-1"><p className="text-sm text-[#8993a6]">Current Mining Rate</p><b className="text-2xl tabular-nums">+{p.speed.toFixed(5)} <span className="text-sm">PP/s</span></b><p className="mt-2 text-xs text-[#8993a6]">24H Progress • {p.progress}%</p></div>
  </div>
  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e8edf5]"><div className="h-full rounded-full bg-gradient-to-r from-[#2868ed] to-[#55a5ff] transition-[width] duration-700" style={{width:`${Math.max(3,p.progress)}%`}}/></div>
  <button onClick={()=>p.setMining((v:boolean)=>!v)} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white shadow-[0_10px_20px_rgba(47,112,244,.2)] ${p.mining?"bg-[#2f70f4]":"bg-[#18243b]"}`}>{p.mining?<><Pause size={17}/> Pause Mining</>:<><Play size={17}/> Start Mining</>}</button>
 </section>

 <div className="grid grid-cols-4 gap-2.5"><Quick icon={<Gift/>} label="Daily" onClick={()=>p.notify("Daily reward is ready")}/><Quick icon={<Zap/>} label="Boost" onClick={()=>p.setTab("mine")}/><Quick icon={<ListChecks/>} label="Tasks" onClick={()=>p.setTab("tasks")}/><Quick icon={<Users/>} label="Invite" onClick={()=>p.setTab("profile")}/></div>
 </div>}

function Mine({p}:any){
 const [sessionSeconds,setSessionSeconds]=useState(0);
 useEffect(()=>{if(!p.mining)return;const id=window.setInterval(()=>setSessionSeconds(v=>v+1),1000);return()=>clearInterval(id)},[p.mining]);
 const hh=String(Math.floor(sessionSeconds/3600)).padStart(2,"0");
 const mm=String(Math.floor((sessionSeconds%3600)/60)).padStart(2,"0");
 const ss=String(sessionSeconds%60).padStart(2,"0");
 return <div className="space-y-5"><Title title="Mine PP Coin" sub="Your mining control center"/>
  <section className="overflow-hidden rounded-[30px] bg-[#050d18] shadow-[0_24px_70px_rgba(5,16,30,.32)]">
   <div className="relative aspect-[16/12] w-full overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_42%,rgba(44,130,255,.24),transparent_30%),radial-gradient(circle_at_68%_75%,rgba(255,166,45,.12),transparent_28%),linear-gradient(145deg,#06101d,#0a1d31_52%,#020711)]"/>
    <div className="absolute inset-0 opacity-30" style={{backgroundImage:"linear-gradient(rgba(93,179,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(93,179,255,.08) 1px,transparent 1px)",backgroundSize:"32px 32px"}}/>
    <div className="absolute inset-x-5 bottom-8 h-28 rounded-full bg-black/70 blur-2xl"/>
    <div className="absolute left-[5%] top-[8%] z-10 h-[59%] w-[48%] rounded-[25px] border border-white/15 bg-gradient-to-br from-[#26394c] via-[#101c29] to-[#050b12] shadow-[inset_0_1px_0_rgba(255,255,255,.15),0_25px_45px_rgba(0,0,0,.55)]">
      <div className="absolute inset-2 rounded-[21px] border border-white/5"/>
      <div className="absolute left-4 right-4 top-3 flex items-center justify-between text-[7px] font-bold tracking-[.16em] text-slate-400"><span>POINTPRO MINING ENGINE</span><span className="flex items-center gap-1 text-[#38e58b]"><i className="h-1.5 w-1.5 rounded-full bg-[#38e58b] animate-pulse"/>ONLINE</span></div>
      <div className="absolute left-[10%] right-[10%] top-[16%] h-[42%] overflow-hidden rounded-[18px] border border-[#526b83] bg-[#02070d] shadow-[inset_0_0_35px_rgba(32,113,255,.24)]">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(55,157,255,.14),transparent_45%)]"/>
       <div className="absolute left-[13%] top-[22%] h-16 w-16 rounded-full border-4 border-[#2f83ff] bg-[#0a2a4b] shadow-[0_0_24px_rgba(47,131,255,.5)]"><div className="absolute inset-3 rounded-full border border-[#7bc5ff]/60 bg-[#3c9eff] shadow-[0_0_15px_#3c9eff] animate-pulse"/></div>
       <div className="absolute right-[13%] top-[22%] h-16 w-16 rounded-full border-4 border-[#2f83ff] bg-[#0a2a4b] shadow-[0_0_24px_rgba(47,131,255,.5)]"><div className="absolute inset-3 rounded-full border border-[#7bc5ff]/60 bg-[#3c9eff] shadow-[0_0_15px_#3c9eff] animate-pulse" style={{animationDelay:".35s"}}/></div>
       <div className="absolute left-[42%] top-[30%] h-10 w-[16%] rounded-full bg-[#2f83ff]/20 blur-md"/>
       <div className="absolute left-[38%] top-[42%] h-1.5 w-[24%] bg-[#64bdff] shadow-[0_0_14px_#64bdff] animate-pulse"/>
       <div className="absolute inset-x-5 bottom-4 h-1 rounded-full bg-slate-700"/>
      </div>
      <div className="absolute bottom-[8%] left-[10%] right-[10%] h-[25%] rounded-[15px] border border-[#3b5269] bg-[#07111c] shadow-[inset_0_0_18px_rgba(0,0,0,.6)]">
       <div className="px-3 pt-2 text-[7px] font-bold tracking-[.16em] text-slate-500">SYSTEM TELEMETRY</div>
       <div className="mt-2 grid grid-cols-3 gap-1 px-3 text-center"><Mini title="RATE" value={"+0.00124"}/><Mini title="NODE" value="ONLINE"/><Mini title="TEMP" value="36°C"/></div>
       <div className="absolute bottom-2 left-3 right-3 h-1 overflow-hidden rounded-full bg-slate-700"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#2f83ff] to-[#35df8a] animate-pulse"/></div>
      </div>
      <div className="absolute -left-1 top-[30%] flex flex-col gap-2">{[1,2,3,4,5].map(i=><span key={i} className="h-1 w-2 rounded-r bg-slate-400/40"/>)}</div>
    </div>
    <div className="absolute left-[44%] top-[48%] z-20 h-12 w-11 rounded-r-xl border-y border-r border-slate-500 bg-[#172534] shadow-lg"><div className="m-2 h-7 rounded bg-[#030914] shadow-[0_0_14px_rgba(47,131,255,.35)]"/></div>
    <div className="absolute left-[37%] right-[4%] top-[59%] z-10 h-[17%] rounded-[25px] border border-[#62778b] bg-gradient-to-b from-[#35495b] to-[#090f17] shadow-[0_18px_35px_rgba(0,0,0,.55)]">
      <div className="absolute inset-x-3 top-3 h-9 overflow-hidden rounded-xl border border-[#52677a] bg-[#03070c] shadow-[inset_0_0_12px_rgba(0,0,0,.8)]">
       <div className="belt absolute inset-y-0 -left-16 w-[180%]" style={{backgroundImage:"repeating-linear-gradient(90deg,transparent 0 22px,rgba(255,255,255,.18) 22px 24px,transparent 24px 48px)",animation:"belt 0.72s linear infinite"}}/>
       <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-black/45"/>
      </div>
      {[0,1,2,3].map(i=><span key={i} className="belt-light absolute bottom-1 h-2 w-2 rounded-full bg-[#f5b83d]" style={{left:(8+i*29)+"%",animationDelay:(i*.16)+"s"}}/>)}
      <div className="absolute -bottom-2 left-3 h-8 w-8 rounded-full border-2 border-slate-500 bg-[#101a25] shadow-lg"/><div className="absolute -bottom-2 right-3 h-8 w-8 rounded-full border-2 border-slate-500 bg-[#101a25] shadow-lg"/>
    </div>
    <div className="pointer-events-none absolute left-[39%] right-[4%] top-[53%] z-30 h-28 overflow-visible">
      <div className="absolute left-0 top-1 h-12 w-9 rounded-b-2xl border-x border-b border-[#8aa0b4] bg-gradient-to-b from-[#394e60] to-[#111b26] shadow-lg"><div className="mx-auto mt-3 h-4 w-3 rounded-full bg-[#ffd447] shadow-[0_0_16px_#ffd447] animate-pulse"/></div>
      {[0,1,2,3,4,5,6].map(i=><div key={i} className={"live-coin absolute grid h-10 w-10 place-items-center rounded-full border-2 border-[#fff3a6] bg-[radial-gradient(circle_at_32%_25%,#fff9c8,#ffd33d_52%,#b66a00)] text-[9px] font-black text-[#6b3d00] shadow-[0_3px_0_#8d5200,0_0_20px_rgba(255,211,61,.5),inset_0_1px_3px_rgba(255,255,255,.8)] "+(p.mining?"":"paused")} style={{animationDelay:(i*.72)+"s"}}><span className="grid h-6 w-6 place-items-center rounded-full border border-[#8d5700]/50 bg-[#ffda52]/75 shadow-inner">PP</span></div>)}
      <div className="absolute right-0 top-4 h-20 w-16 rounded-2xl border border-[#5d7185] bg-gradient-to-br from-[#263847] to-[#080e16] shadow-[0_12px_25px_rgba(0,0,0,.55)]"><div className="absolute left-2 right-2 top-2 h-2 rounded-full bg-[#ffd447]/20"/><div className="absolute bottom-2 left-2 right-2 h-12 overflow-hidden rounded-lg bg-[#050a10]"><div className="absolute bottom-0 left-1 right-1 h-5 rounded-t-xl bg-gradient-to-t from-[#c07a12] to-[#ffd95b] shadow-[0_0_15px_rgba(255,211,61,.35)]"/></div></div>
    </div>
    <div className="absolute right-[5%] top-[8%] z-20 h-[39%] w-[39%] rounded-[20px] border border-[#52677a] bg-[#07111d]/95 p-3 shadow-[0_18px_35px_rgba(0,0,0,.48)]">
      <div className="flex items-center justify-between text-[9px] font-black text-white"><span>LIVE ENGINE</span><span className="flex items-center gap-1 text-[7px] text-[#39e58b]"><i className="h-1.5 w-1.5 rounded-full bg-[#39e58b] animate-pulse"/>STABLE</span></div>
      <div className="mt-2 rounded-xl border border-slate-700 bg-[#030811] p-2"><svg viewBox="0 0 240 80" className="h-20 w-full"><path d="M4 64L28 48L48 55L70 30L91 43L113 21L136 35L158 17L182 30L205 11L236 22" fill="none" stroke="#55b6ff" strokeWidth="3" strokeDasharray="7 6"><animate attributeName="stroke-dashoffset" from="0" to="-52" dur="1.4s" repeatCount="indefinite"/></path><path d="M4 64L28 48L48 55L70 30L91 43L113 21L136 35L158 17L182 30L205 11L236 22V75H4Z" fill="#2f70f4" opacity=".08"/></svg></div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[7px]"><Mini title="SESSION" value={hh+":"+mm+":"+ss}/><Mini title="RATE" value={p.speed.toFixed(5)+" PP/s"}/></div>
    </div>
    <div className="absolute left-4 top-4 z-40 rounded-2xl border border-white/10 bg-[#071426]/90 px-3 py-2 text-white shadow-xl backdrop-blur"><div className="flex items-center gap-2 text-[10px] font-black"><span className={"h-2.5 w-2.5 rounded-full "+(p.mining?"bg-[#39e58b] animate-pulse":"bg-slate-500")}/>{p.mining?"MINING ACTIVE":"MINING PAUSED"}</div><div className="mt-1 text-sm font-black tabular-nums">+{p.speed.toFixed(5)} PP/s</div></div>
    <div className="absolute bottom-3 left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/10 bg-[#071426]/95 px-4 py-1.5 text-[10px] font-bold text-white shadow-lg"><span className={"mr-1 "+(p.mining?"text-[#39e58b]":"text-slate-500")}>●</span>{p.mining?"Coins are being collected":"Collection paused"}<span className="ml-2 text-slate-500">• Session verified</span></div>
   </div>
   <div className="grid grid-cols-3 border-t border-white/10 bg-[#07111d] px-3 py-3 text-center text-[10px]"><div><span className="block text-slate-400">Mining Rate</span><b className="text-white">+{p.speed.toFixed(5)} PP/s</b></div><div className="border-x border-white/10"><span className="block text-slate-400">Session</span><b className="text-white tabular-nums">{hh}:{mm}:{ss}</b></div><div><span className="block text-slate-400">Today</span><b className="text-[#39e58b]">+{p.today.toFixed(4)} PP</b></div></div>
  </section>
  <section className="relative overflow-hidden rounded-[28px] bg-[#071426] text-white shadow-[0_20px_55px_rgba(5,16,30,.25)]">
   <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(47,131,255,.26),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(255,190,60,.13),transparent_30%),linear-gradient(145deg,#071426,#0b2138_55%,#030914)]"/>
   <div className="relative min-h-[255px] overflow-hidden p-5">
    <div className="absolute -right-10 -top-8 h-44 w-44 rounded-full border-[18px] border-[#2f70f4]/25 bg-[#0b2a4d] shadow-[0_0_55px_rgba(47,131,255,.25)]"><div className="grid h-full place-items-center text-6xl font-black text-[#54a9ff]/60">P</div></div>
    <div className="relative z-10 max-w-[58%]"><p className="text-[26px] font-black tracking-tight">Mine PP Coin</p><p className="mt-1 text-sm text-slate-300">Turn your time into value</p></div>
    <div className="absolute right-4 top-4 z-20 rounded-2xl border border-white/15 bg-[#071426]/90 px-4 py-3 shadow-xl backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-black"><span className={`h-2.5 w-2.5 rounded-full ${p.mining?"bg-[#39e58b] animate-pulse":"bg-slate-500"}`}/>{p.mining?"Mining Active":"Mining Paused"}</div>
      <b className="mt-1 block text-lg tabular-nums">+{p.speed.toFixed(5)} PP/s</b>
    </div>
    <div className="absolute bottom-5 left-4 right-4 z-20 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-[#071426]/90 backdrop-blur">
      <div className="p-3"><span className="block text-[10px] text-slate-400">Mining Power</span><b className="mt-1 block text-sm tabular-nums">+{p.speed.toFixed(5)} PP/s</b></div>
      <div className="border-x border-white/10 p-3"><span className="block text-[10px] text-slate-400">Session Time</span><b className="mt-1 block text-sm tabular-nums">{hh}:{mm}:{ss}</b></div>
      <div className="p-3"><span className="block text-[10px] text-slate-400">Live Collection</span><b className="mt-1 block text-sm tabular-nums text-[#ffd447]">{(p.today+((sessionSeconds%15)*p.speed)).toFixed(4)} PP</b></div>
    </div>
   </div>
  </section>
  <Card title="Production Details">
   <div className="mb-4 overflow-hidden rounded-2xl bg-[#071426]">
    <div className="relative overflow-hidden">
     <video className="aspect-[16/10] w-full object-cover" src="/mining-production.mp4" autoPlay muted loop playsInline />
     <div className="pointer-events-none absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
      <div className="rounded-xl border border-white/10 bg-[#071426]/90 px-3 py-2 text-white shadow-lg backdrop-blur">
       <div className="flex items-center gap-2 text-[10px] font-black"><span className={`h-2 w-2 rounded-full ${p.mining?"bg-[#39e58b] animate-pulse":"bg-slate-500"}`}/>{p.mining?"MINING ACTIVE":"MINING PAUSED"}</div>
       <b className="mt-0.5 block text-sm tabular-nums">+{p.speed.toFixed(5)} PP/s</b>
      </div>
      <div className="rounded-xl border border-white/10 bg-[#071426]/90 px-3 py-2 text-right text-white shadow-lg backdrop-blur">
       <span className="block text-[9px] text-slate-400">LIVE COLLECTION</span>
       <b className="block text-base tabular-nums text-[#ffd447]">{(p.today+((sessionSeconds%15)*p.speed)).toFixed(4)} PP</b>
      </div>
     </div>
     <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-white/10 bg-[#071426]/90 px-3 py-2 text-[10px] text-white shadow-lg backdrop-blur">
      <span>Session {hh}:{mm}:{ss}</span><span className="text-[#39e58b]">● Live production</span>
     </div>
    </div>
   </div>
   <div className="rounded-2xl bg-[#f5f7fb] p-4">
    <div className="flex items-center justify-between"><div><b className="text-sm">Live production rate</b><p className="mt-0.5 text-xs text-[#8993a6]">Calculated from the current mining power</p></div><span className="rounded-full bg-[#e8fff3] px-3 py-1.5 text-[10px] font-black text-[#20b96c]">LIVE</span></div>
    <div className="mt-4 grid grid-cols-2 gap-2.5">
     <Prod label="Per second" value={p.speed.toFixed(5)+" PP"}/>
     <Prod label="Per minute" value={(p.speed*60).toFixed(4)+" PP"}/>
     <Prod label="Per hour" value={(p.speed*3600).toFixed(3)+" PP"}/>
     <Prod label="Per day" value={(p.speed*86400).toFixed(3)+" PP"}/>
     <Prod label="7 days" value={(p.speed*86400*7).toFixed(3)+" PP"}/>
     <Prod label="30 days" value={(p.speed*86400*30).toFixed(3)+" PP"}/>
    </div>
   </div>
   <div className="mt-3 rounded-2xl border border-[#e4e9f1] p-4">
    <div className="flex items-center justify-between"><b className="text-sm">Production formula</b><span className="text-xs font-bold text-[#2f70f4]">{p.boost?"+20% boost":"Base rate"}</span></div>
    <p className="mt-2 text-xs leading-5 text-[#66728a]">PP produced = mining rate × active time. The server remains the source of truth for credited earnings; the figures here are live production estimates for the mining UI.</p>
    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]"><MiniStat label="Base" value="+0.00124 PP/s"/><MiniStat label="Boosted" value="+0.001488 PP/s"/><MiniStat label="24H boosted" value="+128.563 PP"/></div>
   </div>
   <div className="mt-3"><Row a="Mining status" b={p.mining?"Active":"Paused"}/></div>
  </Card>
  <Card title="Boost Center"><Boost name="Energy Boost" value="+10%" active={p.boost} onClick={()=>p.setBoost(true)}/><Boost name="Super Boost" value="+20%" active={p.boost} onClick={()=>p.setBoost(true)}/></Card>
  <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_28px_rgba(31,51,86,.07)]">
   <div className="flex items-start justify-between gap-3"><div><h2 className="text-[20px] font-black">Premium Mining Plans</h2><p className="mt-1 text-xs leading-5 text-[#8993a6]">Choose extra mining power for your account.</p></div><span className="rounded-full bg-[#eef5ff] px-3 py-1.5 text-[10px] font-black text-[#2f70f4]">30 DAYS</span></div>
   <div className="mt-4 space-y-3">
    <PaidPlan name="Starter" power="+20%" price="৳199" detail="Good for getting started" onClick={()=>p.notify("Secure checkout will open here")}/>
    <PaidPlan name="Pro" power="+50%" price="৳399" detail="Most popular mining plan" popular onClick={()=>p.notify("Secure checkout will open here")}/>
    <PaidPlan name="Max" power="+100%" price="৳699" detail="Maximum available boost" onClick={()=>p.notify("Secure checkout will open here")}/>
   </div>
   <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#f5f8fc] p-3 text-[11px] leading-5 text-[#66728a]"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#25c879]"/><span>Plan selection is separate from your wallet balance. Payment checkout can be connected to your preferred payment gateway.</span></div>
  </section>
  <style jsx>{`
   @keyframes belt{to{transform:translateX(48px)}} 
   @keyframes coinMove{0%{left:-2%;top:12px;transform:translateY(-18px) scale(.25) rotate(-35deg);opacity:0}8%{opacity:1}24%{transform:translateY(0) scale(1) rotate(8deg)}55%{transform:translateY(3px) scale(1) rotate(180deg)}78%{transform:translateY(0) scale(.92) rotate(330deg)}100%{left:91%;top:24px;transform:translateY(8px) scale(.42) rotate(420deg);opacity:0}}
   .live-coin{animation:coinMove 4.6s cubic-bezier(.18,.62,.25,1) infinite}.live-coin.paused{animation-play-state:paused;opacity:.28}.belt-light{animation:lightPass .9s linear infinite}@keyframes lightPass{0%,100%{opacity:.2}50%{opacity:1;box-shadow:0 0 10px #ffd447}}
  `}</style>
 </div>
}

function Tasks({p}:any){const [tasks,setTasks]=useState<any[]>([]);const [claimed,setClaimed]=useState<Record<string,boolean>>({});const [loading,setLoading]=useState(true);useEffect(()=>{let on=true;(async()=>{if(!supabase||!p.userId){setLoading(false);return}const {data}=await supabase.from("tasks").select("id,title,description,reward,task_type").eq("active",true).order("created_at",{ascending:false});if(on)setTasks(data||[]);const {data:ut}=await supabase.from("user_tasks").select("task_id,status").eq("user_id",p.userId);if(on){const m:any={};(ut||[]).forEach((x:any)=>{m[x.task_id]=x.status==="claimed"});setClaimed(m)}setLoading(false)})();return()=>{on=false}},[p.userId]);const claim=async(t:any)=>{if(claimed[t.id])return;if(!supabase||!p.userId){p.notify("Connect your account to claim rewards");return}const {data,error}=await supabase.rpc("claim_task",{p_task_id:t.id});if(error){p.notify(error.message?.includes("already claimed")?"Task already claimed":"Reward claim failed");return}const reward=Number(data?.reward)||0;setClaimed(v=>({...v,[t.id]:true}));if(reward>0){p.refreshBalance?.();}p.notify(reward>0?("+"+reward.toFixed(2)+" PP added to your wallet"):"Task claimed successfully")};return <div className="space-y-5"><Title title="Tasks" sub="Complete tasks and earn more PP Coin."/><div className="flex gap-2 overflow-x-auto pb-1">{["All","Daily","Mining","Social"].map((x,i)=><span key={x} className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-bold ${i===0?"border-[#2f70f4] bg-[#2f70f4] text-white":"border-[#e4e8f0] bg-white text-[#8993a6]"}`}>{x}</span>)}</div><Card>{loading?<div className="p-6 text-center text-sm text-[#8993a6]">Loading tasks…</div>:tasks.length===0?<div className="p-6 text-center text-sm text-[#8993a6]">No active tasks yet</div>:tasks.map((t:any)=><Task key={t.id} icon={<Gift/>} title={t.title} text={t.description||t.task_type} button={claimed[t.id]?"Claimed":`+${Number(t.reward).toFixed(2)} PP`} onClick={()=>claim(t)}/>)}</Card></div>}

function Wallet({p}:any){
 const [tx,setTx]=useState<any[]>([]);
 const [requests,setRequests]=useState<any[]>([]);
 const [loading,setLoading]=useState(true);
 const [showWithdraw,setShowWithdraw]=useState(false);
 const [amount,setAmount]=useState("");
 const [method,setMethod]=useState<"bkash"|"nagad"|"usdt">("bkash");
 const [destination,setDestination]=useState("");
 const [busy,setBusy]=useState(false);

 const load=async()=>{
  if(!supabase||!p.userId){setLoading(false);return}
  const [{data:t},{data:r}]=await Promise.all([
   supabase.from("transactions").select("id,type,amount,status,created_at").eq("user_id",p.userId).order("created_at",{ascending:false}).limit(20),
   supabase.from("withdrawal_requests").select("id,amount,method,destination,status,created_at").eq("user_id",p.userId).order("created_at",{ascending:false}).limit(10)
  ]);
  setTx(t||[]);setRequests(r||[]);setLoading(false);
 };
 useEffect(()=>{load()},[p.userId]);

 const submitWithdrawal=async(e:React.FormEvent)=>{
  e.preventDefault();
  const value=Number(amount);
  if(!Number.isFinite(value)||value<=0){p.notify("Enter a valid withdrawal amount");return}
  if(value>Number(p.balance)){p.notify("Insufficient balance");return}
  if(destination.trim().length<5){p.notify("Enter a valid destination");return}
  setBusy(true);
  const {data,error}=await supabase.rpc("request_withdrawal",{p_amount:value,p_method:method,p_destination:destination.trim()});
  setBusy(false);
  if(error){p.notify(error.message||"Withdrawal request failed");return}
  setAmount("");setDestination("");setShowWithdraw(false);
  await p.refreshBalance?.();await load();
  p.notify("Withdrawal request submitted");
 };

 return <div className="space-y-5">
  <Title title="Wallet" sub="Manage your PP Coin securely."/>
  <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2f70f4] to-[#174bc8] p-6 text-white shadow-[0_15px_35px_rgba(47,112,244,.2)]">
   <p className="text-sm font-bold text-blue-100">POINTPRO WALLET</p>
   <b className="mt-2 block text-4xl">{p.balance.toFixed(6)} PP</b>
   <p className="mt-1 text-sm text-blue-100">Available balance for withdrawal</p>
   <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
    <div><b className="block text-base">{p.balance.toFixed(3)}</b>Available</div>
    <div><b className="block text-base">{p.today.toFixed(3)}</b>Today</div>
    <div><b className="block text-base">{requests.length}</b>Withdrawals</div>
   </div>
  </section>

  <div className="grid grid-cols-4 gap-2.5">
   <WalletAction icon={<ArrowDownToLine/>} label="Receive" onClick={()=>p.notify("Receive will be enabled after wallet setup")}/>
   <WalletAction icon={<ArrowUpFromLine/>} label="Send" onClick={()=>p.notify("Send is disabled for security")}/>
   <WalletAction icon={<ArrowLeftRight/>} label="Exchange" onClick={()=>p.notify("Exchange is not enabled yet")}/>
   <WalletAction icon={<ArrowUpFromLine/>} label="Withdraw" onClick={()=>setShowWithdraw(true)}/>
  </div>

  {showWithdraw&&<section className="rounded-[28px] border border-[#dfe5ef] bg-white p-5 shadow-[0_12px_30px_rgba(31,51,86,.08)]">
   <div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Withdraw PP Coin</h2><p className="mt-1 text-xs text-[#8993a6]">Available: {p.balance.toFixed(6)} PP</p></div><button type="button" onClick={()=>setShowWithdraw(false)} className="rounded-xl bg-[#f1f3f7] px-3 py-2 text-sm font-bold">Close</button></div>
   <form onSubmit={submitWithdrawal} className="mt-4 space-y-3">
    <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#66728a]">Withdrawal method</span><select value={method} onChange={e=>setMethod(e.target.value as any)} className="w-full rounded-2xl border border-[#dfe5ef] bg-white px-4 py-3 text-sm font-semibold outline-none"><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="usdt">USDT</option></select></label>
    <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#66728a]">Amount (PP)</span><input value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="0.000001" step="0.000001" placeholder="Enter amount" className="w-full rounded-2xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none"/></label>
    <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#66728a]">{method==="usdt"?"USDT wallet address":"Account number"}</span><input value={destination} onChange={e=>setDestination(e.target.value)} placeholder={method==="usdt"?"Enter wallet address":"01XXXXXXXXX"} className="w-full rounded-2xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none"/></label>
    <div className="rounded-2xl bg-[#fff8e6] p-3 text-xs leading-5 text-[#856404]">Your PP Coin is deducted when the request is submitted and the request enters <b>Pending</b> status. Keep the destination details correct.</div>
    <button disabled={busy} className="w-full rounded-2xl bg-[#2f70f4] py-3.5 font-black text-white disabled:opacity-60">{busy?"Submitting…":"Submit Withdrawal Request"}</button>
   </form>
  </section>}

  <Card title="Withdrawal History">
   {loading?<div className="p-6 text-center text-sm text-[#8993a6]">Loading withdrawals…</div>:requests.length===0?<div className="rounded-2xl bg-[#f5f7fb] p-6 text-center text-sm text-[#8993a6]">No withdrawal requests yet</div>:<div>{requests.map(r=><div key={r.id} className="flex items-center justify-between border-b border-[#edf0f5] py-3.5 last:border-0"><div><b className="block text-sm uppercase">{r.method}</b><small className="text-xs text-[#8993a6]">{r.destination} • {new Date(r.created_at).toLocaleString()}</small></div><div className="text-right"><b className="block text-sm">-{Number(r.amount).toFixed(6)} PP</b><small className="text-xs font-bold capitalize text-[#8993a6]">{r.status}</small></div></div>)}</div>}
  </Card>

  <Card title="Recent Transactions">
   {loading?<div className="p-6 text-center text-sm text-[#8993a6]">Loading transactions…</div>:tx.length===0?<div className="rounded-2xl bg-[#f5f7fb] p-6 text-center text-sm text-[#8993a6]">No transactions yet</div>:<div>{tx.map(t=><div key={t.id} className="flex items-center justify-between border-b border-[#edf0f5] py-3 last:border-0"><div><b className="block text-sm capitalize">{t.type}</b><small className="text-xs text-[#8993a6]">{new Date(t.created_at).toLocaleString()}</small></div><div className="text-right"><b className="block text-sm">{Number(t.amount)>=0?"+":""}{Number(t.amount).toFixed(6)} PP</b><small className="text-xs text-[#8993a6] capitalize">{t.status}</small></div></div>)}</div>}
  </Card>
 </div>
}
function Profile({p}:any){const [profile,setProfile]=useState<any>(null);const [refCount,setRefCount]=useState(0);useEffect(()=>{let on=true;(async()=>{if(!supabase||!p.userId)return;const {data}=await supabase.from("profiles").select("display_name,username,referral_code").eq("id",p.userId).maybeSingle();if(on)setProfile(data);const {count}=await supabase.from("profiles").select("id",{count:"exact",head:true}).eq("referred_by",p.userId);if(on)setRefCount(count||0)})();return()=>{on=false}},[p.userId]);const code=profile?.referral_code||REFERRAL;return <div className="space-y-5"><Title title="Profile" sub="Your PointPro account"/><section className="rounded-[28px] bg-white p-5 shadow-[0_12px_30px_rgba(31,51,86,.08)]"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-[#eaf2ff]"><UserRound size={31} className="text-[#2f70f4]"/></div><div><h2 className="text-xl font-black">{profile?.display_name||"PointPro Miner"}</h2><p className="text-sm text-[#8993a6]">@{profile?.username||"ppuser"}</p></div><CheckCircle2 className="ml-auto text-[#25c879]"/></div><div className="mt-5 rounded-2xl bg-[#101a29] p-4 text-white"><p className="text-xs text-slate-400">Your Referral Code</p><b className="mt-1 block text-2xl text-[#ffd02f]">{code}</b><p className="mt-2 text-sm text-slate-400">Invite friends and earn referral rewards.</p></div></section><Card title="Referral"><Row a="Referral code" b={code}/><Row a="Total referrals" b={String(refCount)}/><Row a="Referral earnings" b="0.000000 PP"/><div className="mt-3 flex gap-2"><button onClick={p.copy} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2f70f4] py-3 font-bold text-white"><Copy size={16}/> Copy</button><button onClick={p.share} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e3e8f1] py-3 font-bold"><Share2 size={16}/> Share</button></div></Card><Card><MenuRow icon={<ShieldCheck/>} text="Security"/><MenuRow icon={<Bell/>} text="Notifications"/><MenuRow icon={<CircleHelp/>} text="Support"/><button onClick={async()=>{await supabase.auth.signOut()}} className="flex w-full items-center gap-3 py-4 text-left text-[#e5485d]"><LogOut size={19}/><b className="text-sm">Logout</b></button></Card></div>}

function Title({title,sub}:{title:string;sub:string}){return <div><h1 className="text-[30px] font-black tracking-tight">{title}</h1><p className="mt-1 text-sm text-[#8993a6]">{sub}</p></div>}
function Mini({title,value}:{title:string;value:string}){return <div className="rounded-2xl bg-white/10 p-3 backdrop-blur"><small className="text-xs text-blue-100">{title}</small><b className="mt-1 block text-sm">{value}</b></div>}
function Prod({label,value}:{label:string;value:string}){return <div className="rounded-2xl bg-white p-3 shadow-sm"><span className="block text-[10px] font-bold text-[#8993a6]">{label}</span><b className="mt-1 block text-sm tabular-nums">{value}</b></div>}
function MiniStat({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-[#f5f7fb] p-2"><span className="block text-[#8993a6]">{label}</span><b className="mt-1 block text-[10px] tabular-nums">{value}</b></div>}
function Quick({icon,label,onClick}:any){return <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-xs font-bold text-[#556179] shadow-[0_8px_22px_rgba(31,51,86,.07)]">{icon}{label}</button>}
function WalletAction({icon,label,onClick}:any){return <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-[11px] font-bold text-[#556179] shadow-[0_8px_22px_rgba(31,51,86,.07)]">{icon}{label}</button>}
function Card({title,children}:any){return <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_28px_rgba(31,51,86,.07)]">{title&&<h2 className="mb-2 text-[20px] font-black">{title}</h2>}{children}</section>}
function Row({a,b}:{a:string;b:string}){return <div className="flex items-center justify-between border-b border-[#edf0f5] py-3.5 text-sm last:border-0"><span className="text-[#8993a6]">{a}</span><b>{b}</b></div>}
function PaidPlan({name,power,price,detail,popular,onClick}:any){return <div className={`relative overflow-hidden rounded-2xl border p-4 ${popular?"border-[#2f70f4] bg-[#f7faff]":"border-[#e6eaf1] bg-white"}`}><div className="flex items-center gap-3"><div className={`grid h-12 w-12 place-items-center rounded-2xl ${popular?"bg-[#2f70f4] text-white":"bg-[#eaf2ff] text-[#2f70f4]"}`}><Zap size={22}/></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><b className="text-base">{name}</b>{popular&&<span className="rounded-full bg-[#25c879] px-2 py-0.5 text-[9px] font-black text-white">POPULAR</span>}</div><p className="mt-0.5 text-xs text-[#8993a6]">{detail}</p></div><div className="text-right"><b className="block text-lg">{price}</b><span className="text-[10px] text-[#8993a6]">/ 30 days</span></div></div><div className="mt-3 flex items-center justify-between rounded-xl bg-[#f5f7fb] px-3 py-2"><span className="text-xs font-semibold text-[#66728a]">Mining power</span><b className="text-sm text-[#20b96c]">{power}</b></div><button onClick={onClick} className={`mt-3 w-full rounded-xl py-3 text-sm font-black ${popular?"bg-[#2f70f4] text-white":"bg-[#18243b] text-white"}`}>Choose Plan</button></div>}

function Boost({name,value,active,onClick}:any){return <div className="flex items-center gap-3 border-b border-[#edf0f5] py-3 last:border-0"><div className="rounded-xl bg-[#eaf2ff] p-2.5 text-[#2f70f4]"><Zap size={18}/></div><div className="flex-1"><b>{name}</b><p className="text-xs text-[#8993a6]">Increase mining power</p></div><button onClick={onClick} className={`rounded-xl px-3 py-2 text-xs font-bold ${active?"bg-[#e8fff3] text-[#20b96c]":"bg-[#2f70f4] text-white"}`}>{active?"Active":value}</button></div>}
function Task({icon,title,text,button,onClick}:any){return <div className="flex items-center gap-3 border-b border-[#edf0f5] py-4 last:border-0"><div className="rounded-xl bg-[#eaf2ff] p-3 text-[#2f70f4]">{icon}</div><div className="min-w-0 flex-1"><b className="block text-sm">{title}</b><small className="text-xs text-[#8993a6]">{text}</small></div><button onClick={onClick} className="rounded-xl bg-[#2f70f4] px-3 py-2 text-xs font-bold text-white">{button}</button></div>}
function MenuRow({icon,text}:{icon:any;text:string}){return <button className="flex w-full items-center gap-3 border-b border-[#edf0f5] py-4 text-left last:border-0"><span className="text-[#68758b]">{icon}</span><b className="flex-1 text-sm">{text}</b><ChevronRight size={18} className="text-[#8993a6]"/></button>}

// Vercel redeploy trigger: duplicate Home import fixed.
