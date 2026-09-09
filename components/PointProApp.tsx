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

function HomePage({p}:any){
 const [seconds,setSeconds]=useState(0);
 useEffect(()=>{if(!p.mining)return;const id=window.setInterval(()=>setSeconds(v=>v+1),1000);return()=>clearInterval(id)},[p.mining]);
 const hh=String(Math.floor(seconds/3600)).padStart(2,"0");
 const mm=String(Math.floor((seconds%3600)/60)).padStart(2,"0");
 const ss=String(seconds%60).padStart(2,"0");
 const sessionEarned=seconds*p.speed;
 const hourly=p.speed*3600;
 const daily=p.speed*86400;
 return <div className="space-y-5 pb-2">
  <div className="flex items-center justify-between">
   <div><p className="text-sm font-semibold text-[#8993a6]">Welcome back 👋</p><h1 className="mt-1 text-[28px] font-black tracking-tight text-[#142039]">Dashboard</h1></div>
   <button onClick={()=>p.notify("No new notifications")} className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#26354e] shadow-[0_8px_25px_rgba(31,51,86,.09)]"><Bell size={20}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#2f70f4]"/></button>
  </div>

  <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#0b2340] via-[#123f73] to-[#1f68dc] p-5 text-white shadow-[0_18px_40px_rgba(30,91,180,.24)]">
   <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full border-[22px] border-white/10"/>
   <div className="absolute -bottom-24 -left-10 h-44 w-44 rounded-full bg-white/5"/>
   <div className="relative z-10 flex items-start justify-between gap-3">
    <div><p className="text-[11px] font-black tracking-[.18em] text-blue-100">PP COIN BALANCE</p><b className="mt-2 block text-[30px] font-black tabular-nums">{p.balance.toFixed(6)} <span className="text-sm text-blue-100">PP</span></b><p className="mt-1 text-xs text-blue-100/80">Today's earning <b className="text-white">+{p.today.toFixed(4)} PP</b></p></div>
    <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black ${p.mining?"border-[#4ff0a0]/30 bg-[#4ff0a0]/10 text-[#69f3a9]":"border-white/15 bg-white/10 text-white/70"}`}>{p.mining?"● MINING ACTIVE":"● PAUSED"}</span>
   </div>
   <div className="relative z-10 mt-5 grid grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/10 bg-black/10 backdrop-blur">
    <div className="p-3"><span className="block text-[9px] text-blue-100/70">RATE</span><b className="mt-1 block text-sm tabular-nums">+{p.speed.toFixed(5)}</b><small className="text-[9px] text-blue-100/70">PP/s</small></div>
    <div className="p-3"><span className="block text-[9px] text-blue-100/70">SESSION</span><b className="mt-1 block text-sm tabular-nums">{hh}:{mm}:{ss}</b><small className="text-[9px] text-blue-100/70">live time</small></div>
    <div className="p-3"><span className="block text-[9px] text-blue-100/70">SESSION EARNED</span><b className="mt-1 block text-sm tabular-nums text-[#ffd447]">{sessionEarned.toFixed(4)}</b><small className="text-[9px] text-blue-100/70">PP</small></div>
   </div>
  </section>

  <section className="rounded-[28px] bg-white p-5 shadow-[0_12px_30px_rgba(31,51,86,.08)]">
   <div className="flex items-center justify-between"><div><h2 className="text-[20px] font-black text-[#17233a]">Mining Control</h2><p className="mt-1 text-xs text-[#8993a6]">{p.mining?"Your miner is producing PP Coin":"Start your miner to begin earning"}</p></div><Zap className={p.mining?"text-[#2f70f4]":"text-[#a0a8b7]"} size={25}/></div>
   <div className="mt-5 flex items-center gap-4">
    <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full p-1" style={{background:`conic-gradient(#2f70f4 ${Math.max(4,p.progress)}%,#e9edf4 0)`}}>
     <div className="grid h-full w-full place-items-center rounded-full bg-white text-center"><div><b className="block text-xl tabular-nums text-[#17233a]">{p.progress}%</b><small className="text-[8px] font-bold text-[#8993a6]">24H</small></div></div>
    </div>
    <div className="flex-1"><div className="flex items-center justify-between text-xs"><span className="font-bold text-[#66728a]">Daily progress</span><b className="text-[#17233a]">{p.progress}%</b></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf1f6]"><div className="h-full rounded-full bg-gradient-to-r from-[#2868ed] to-[#58a8ff]" style={{width:`${Math.max(3,p.progress)}%`}}/></div><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><div className="rounded-xl bg-[#f5f8fc] p-2.5"><span className="text-[#8993a6]">Per hour</span><b className="mt-1 block tabular-nums">{hourly.toFixed(3)} PP</b></div><div className="rounded-xl bg-[#f5f8fc] p-2.5"><span className="text-[#8993a6]">Per day</span><b className="mt-1 block tabular-nums">{daily.toFixed(2)} PP</b></div></div></div>
   </div>
   <button onClick={()=>p.setMining((v:boolean)=>!v)} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-black text-white shadow-[0_10px_20px_rgba(47,112,244,.18)] ${p.mining?"bg-[#2f70f4]":"bg-[#17233a]"}`}>{p.mining?<><Pause size={17}/> Pause Mining</>:<><Play size={17}/> Start Mining</>}</button>
  </section>

  <div><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black text-[#17233a]">Quick Actions</h2><span className="text-[10px] font-bold uppercase tracking-wider text-[#a0a8b7]">Earn more</span></div><div className="grid grid-cols-4 gap-2.5">
   <Quick icon={<Gift/>} label="Daily" onClick={()=>p.notify("Daily reward is ready")}/>
   <Quick icon={<Zap/>} label="Boost" onClick={()=>p.setTab("mine")}/>
   <Quick icon={<ListChecks/>} label="Tasks" onClick={()=>p.setTab("tasks")}/>
   <Quick icon={<Users/>} label="Invite" onClick={()=>p.setTab("profile")}/>
  </div></div>

  <section className="rounded-[26px] border border-[#e7ebf2] bg-[#f8faff] p-4">
   <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-[#8993a6]">Live Mining Preview</p><p className="mt-1 text-sm font-bold text-[#17233a]">Watch your production in action</p></div><button onClick={()=>p.setTab("mine")} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-[#2f70f4] shadow-sm">Open Mine →</button></div>
   <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#071426] p-3 text-white"><div className={`grid h-11 w-11 place-items-center rounded-xl ${p.mining?"bg-[#123d30]":"bg-[#202a3a]"}`}><Zap size={21} className={p.mining?"text-[#39e58b]":"text-slate-400"}/></div><div className="flex-1"><b className="block text-sm">{p.mining?"Machine running":"Machine paused"}</b><span className="text-[10px] text-slate-400">{p.mining?"Live production is active":"Tap Start Mining to begin"}</span></div><b className="text-sm tabular-nums text-[#ffd447]">+{p.speed.toFixed(5)} PP/s</b></div>
  </section>
 </div>}

function Mine({p}:any){
 const [sessionSeconds,setSessionSeconds]=useState(0);
 useEffect(()=>{if(!p.mining)return;const id=window.setInterval(()=>setSessionSeconds(v=>v+1),1000);return()=>clearInterval(id)},[p.mining]);
 const hh=String(Math.floor(sessionSeconds/3600)).padStart(2,"0"),mm=String(Math.floor((sessionSeconds%3600)/60)).padStart(2,"0"),ss=String(sessionSeconds%60).padStart(2,"0");
 const liveEarned=p.today+sessionSeconds*p.speed;
 return <div className="space-y-5">
  <Card title="Live Mining">
   <div className="overflow-hidden rounded-[26px] bg-[#030a13] shadow-[0_18px_50px_rgba(4,15,30,.3)]">
    <div className="relative">
     <video className="aspect-[16/10] w-full object-cover" src="/mining-production.mp4" autoPlay muted loop playsInline />
     <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020812]/80 via-transparent to-[#020812]/25"/>
     <div className="pointer-events-none absolute left-[5%] top-[6%] rounded-full border border-[#39e58b]/30 bg-[#061426]/85 px-3 py-1.5 text-[9px] font-black text-white shadow-lg backdrop-blur">
      <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${p.mining?"bg-[#39e58b] animate-pulse":"bg-slate-500"}`}/>{p.mining?"MINING ACTIVE":"MINING PAUSED"}
     </div>
     <div className="pointer-events-none absolute left-[50%] top-[12%] w-[46%] rounded-2xl border border-[#3ba8ff]/45 bg-[#020914]/90 p-3 text-white shadow-[0_0_30px_rgba(28,135,255,.25)] backdrop-blur-[3px]">
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5"><b className="text-[10px] tracking-[.16em] text-[#5dbaff]">LIVE MINING</b><span className="text-[8px] font-black text-[#39e58b]">● ONLINE</span></div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
       <div><span className="block text-[8px] text-slate-500">RATE</span><b className="block text-[11px] tabular-nums">+{p.speed.toFixed(5)} <em className="text-[8px] not-italic text-[#75bfff]">PP/s</em></b></div>
       <div><span className="block text-[8px] text-slate-500">SESSION</span><b className="block text-[11px] tabular-nums">{hh}:{mm}:{ss}</b></div>
       <div className="col-span-2"><span className="block text-[8px] text-slate-500">LIVE EARNED</span><b className="block text-[15px] tabular-nums text-[#ffd447]">{liveEarned.toFixed(6)} PP</b></div>
      </div>
      <div className="mt-2 flex h-3 items-end gap-[2px]">{Array.from({length:24},(_,k)=><i key={k} className="flex-1 rounded-t bg-[#2d9cff] transition-all" style={{height:`${20+((sessionSeconds*7+k*13)%75)}%`}}/>)}</div>
     </div>
     <div className="pointer-events-none absolute bottom-[5%] left-[5%] rounded-2xl border border-[#ffd447]/20 bg-[#061426]/88 px-3 py-2 shadow-xl backdrop-blur">
      <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">Live Collection</span><b className="block text-[17px] tabular-nums text-[#ffd447]">{liveEarned.toFixed(6)} <span className="text-[9px]">PP</span></b>
     </div>
     <div className="pointer-events-none absolute bottom-[5%] right-[5%] rounded-2xl border border-white/10 bg-[#061426]/88 px-3 py-2 text-right shadow-xl backdrop-blur">
      <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">Mining Time</span><b className="block text-[16px] tabular-nums text-white">{hh}:{mm}:{ss}</b>
     </div>
    </div>
   </div>
   <div className="mt-4 rounded-2xl bg-[#f5f7fb] p-4">
    <div className="flex items-center justify-between"><div><b className="text-sm">Production Overview</b><p className="mt-0.5 text-xs text-[#8993a6]">Live estimate from your current mining power</p></div><span className="rounded-full bg-[#e8fff3] px-3 py-1.5 text-[10px] font-black text-[#20b96c]">LIVE</span></div>
    <div className="mt-4 grid grid-cols-2 gap-2.5">
     <Prod label="Per second" value={p.speed.toFixed(5)+" PP"}/><Prod label="Per minute" value={(p.speed*60).toFixed(4)+" PP"}/><Prod label="Per hour" value={(p.speed*3600).toFixed(3)+" PP"}/><Prod label="Per day" value={(p.speed*86400).toFixed(3)+" PP"}/><Prod label="7 days" value={(p.speed*86400*7).toFixed(3)+" PP"}/><Prod label="30 days" value={(p.speed*86400*30).toFixed(3)+" PP"}/>
    </div>
   </div>
   <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl border border-[#e4e9f1] p-3 text-center"><MiniStat label="Base" value="+0.00124 PP/s"/><MiniStat label="Boosted" value="+0.001488 PP/s"/><MiniStat label="Status" value={p.mining?"ONLINE":"PAUSED"}/></div>
  </Card>
  <Card title="Boost Center"><Boost name="Energy Boost" value="+10%" active={p.boost} onClick={()=>p.setBoost(true)}/><Boost name="Super Boost" value="+20%" active={p.boost} onClick={()=>p.setBoost(true)}/></Card>
  <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_28px_rgba(31,51,86,.07)]">
   <div className="flex items-start justify-between gap-3"><div><h2 className="text-[20px] font-black">Premium Mining Plans</h2><p className="mt-1 text-xs text-[#8993a6]">Choose extra mining power for your account.</p></div><span className="rounded-full bg-[#eef5ff] px-3 py-1.5 text-[10px] font-black text-[#2f70f4]">30 DAYS</span></div>
   <div className="mt-4 space-y-3"><PaidPlan name="Starter" power="+20%" price="৳199" detail="Good for getting started" onClick={()=>p.notify("Secure checkout will open here")}/><PaidPlan name="Pro" power="+50%" price="৳399" detail="Most popular mining plan" popular onClick={()=>p.notify("Secure checkout will open here")}/><PaidPlan name="Max" power="+100%" price="৳699" detail="Maximum available boost" onClick={()=>p.notify("Secure checkout will open here")}/></div>
   <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#f5f8fc] p-3 text-[11px] leading-5 text-[#66728a]"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#25c879]"/><span>Plan selection is separate from your wallet balance. Payment checkout can be connected to your preferred payment gateway.</span></div>
  </section>
 </div>
}
function Tasks({p}:any){
 const [tasks,setTasks]=useState<any[]>([]);const [claimed,setClaimed]=useState<Record<string,boolean>>({});const [loading,setLoading]=useState(true);const [filter,setFilter]=useState("All");
 useEffect(()=>{let on=true;(async()=>{if(!supabase||!p.userId){setLoading(false);return}const {data}=await supabase.from("tasks").select("id,title,description,reward,task_type").eq("active",true).order("created_at",{ascending:false});if(on)setTasks(data||[]);const {data:ut}=await supabase.from("user_tasks").select("task_id,status").eq("user_id",p.userId);if(on){const m:any={};(ut||[]).forEach((x:any)=>m[x.task_id]=x.status==="claimed");setClaimed(m)}setLoading(false)})();return()=>{on=false}},[p.userId]);
 const claim=async(t:any)=>{if(claimed[t.id])return;if(!supabase||!p.userId){p.notify("Connect your account to claim rewards");return}const {data,error}=await supabase.rpc("claim_task",{p_task_id:t.id});if(error){p.notify(error.message?.includes("already claimed")?"Task already claimed":"Reward claim failed");return}const reward=Number(data?.reward)||0;setClaimed(v=>({...v,[t.id]:true}));p.refreshBalance?.();p.notify(reward>0?("+"+reward.toFixed(2)+" PP added to your wallet"):"Task claimed successfully")};
 const shown=filter==="All"?tasks:tasks.filter(t=>String(t.task_type||"").toLowerCase()===filter.toLowerCase());
 const total=shown.reduce((n,t)=>n+Number(t.reward||0),0),done=shown.filter(t=>claimed[t.id]).length;
 return <div className="space-y-5 pb-3">
  <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0b2340] via-[#15539a] to-[#2f70f4] p-5 text-white shadow-[0_16px_38px_rgba(30,91,180,.22)]">
   <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full border-[20px] border-white/10"/>
   <div className="relative z-10 flex items-start justify-between"><div><p className="text-[10px] font-black tracking-[.18em] text-blue-100">REWARD CENTER</p><h1 className="mt-1 text-[27px] font-black">Earn More PP</h1><p className="mt-1 text-xs text-blue-100">Complete tasks and grow your balance.</p></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><Gift size={23}/></div></div>
   <div className="relative z-10 mt-5 grid grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/10 bg-black/10 backdrop-blur"><div className="p-3"><span className="block text-[9px] text-blue-100/70">AVAILABLE</span><b className="mt-1 block text-lg">{shown.length}</b></div><div className="p-3"><span className="block text-[9px] text-blue-100/70">COMPLETED</span><b className="mt-1 block text-lg">{done}</b></div><div className="p-3"><span className="block text-[9px] text-blue-100/70">REWARDS</span><b className="mt-1 block text-lg tabular-nums">{total.toFixed(2)} PP</b></div></div>
  </section>
  <div className="flex gap-2 overflow-x-auto pb-1">{["All","Daily","Mining","Social"].map(x=><button key={x} onClick={()=>setFilter(x)} className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-xs font-black transition ${filter===x?"border-[#2f70f4] bg-[#2f70f4] text-white":"border-[#e4e8f0] bg-white text-[#8993a6]"}`}>{x}</button>)}</div>
  <Card>
   {loading?<div className="p-7 text-center text-sm text-[#8993a6]">Loading tasks…</div>:shown.length===0?<div className="p-7 text-center text-sm text-[#8993a6]">No active tasks yet</div>:<div className="space-y-2">{shown.map((t:any)=>{const done=!!claimed[t.id];return <div key={t.id} className="rounded-2xl border border-[#e8ecf2] bg-white p-4 transition hover:shadow-sm"><div className="flex items-center gap-3"><div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${done?"bg-[#e9fff4] text-[#20b96c]":"bg-[#eef5ff] text-[#2f70f4]"}`}>{done?<span className="text-lg">✓</span>:<Gift size={20}/>}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><b className="truncate text-sm text-[#17233a]">{t.title}</b><b className="shrink-0 text-sm tabular-nums text-[#e0a900]">+{Number(t.reward).toFixed(2)} PP</b></div><p className="mt-1 text-[11px] leading-4 text-[#8993a6]">{t.description||t.task_type}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#edf1f6]"><div className={`h-full rounded-full ${done?"bg-[#39d98a]":"bg-[#2f70f4]"}`} style={{width:done?"100%":"12%"}}/></div></div><button disabled={done} onClick={()=>claim(t)} className={`rounded-xl px-3 py-2 text-[10px] font-black ${done?"bg-[#eef8f2] text-[#20b96c]":"bg-[#17233a] text-white"}`}>{done?"Claimed":"Claim"}</button></div></div>})}</div>}
  </Card>
 </div>
}
function Wallet({p}:any){
 const [tx,setTx]=useState<any[]>([]),[requests,setRequests]=useState<any[]>([]),[loading,setLoading]=useState(true),[showWithdraw,setShowWithdraw]=useState(false),[amount,setAmount]=useState(""),[method,setMethod]=useState<"bkash"|"nagad"|"usdt">("bkash"),[destination,setDestination]=useState(""),[busy,setBusy]=useState(false);
 const load=async()=>{if(!supabase||!p.userId){setLoading(false);return}const [{data:t},{data:r}]=await Promise.all([supabase.from("transactions").select("id,type,amount,status,created_at").eq("user_id",p.userId).order("created_at",{ascending:false}).limit(20),supabase.from("withdrawal_requests").select("id,amount,method,destination,status,created_at").eq("user_id",p.userId).order("created_at",{ascending:false}).limit(10)]);setTx(t||[]);setRequests(r||[]);setLoading(false)};
 useEffect(()=>{load()},[p.userId]);
 const submitWithdrawal=async(e:React.FormEvent)=>{e.preventDefault();const value=Number(amount);if(!Number.isFinite(value)||value<=0){p.notify("Enter a valid withdrawal amount");return}if(value>Number(p.balance)){p.notify("Insufficient balance");return}if(destination.trim().length<5){p.notify("Enter a valid destination");return}setBusy(true);const {error}=await supabase.rpc("request_withdrawal",{p_amount:value,p_method:method,p_destination:destination.trim()});setBusy(false);if(error){p.notify(error.message||"Withdrawal request failed");return}setAmount("");setDestination("");setShowWithdraw(false);await p.refreshBalance?.();await load();p.notify("Withdrawal request submitted")};
 const pending=requests.filter(x=>String(x.status).toLowerCase()==="pending").reduce((n,x)=>n+Number(x.amount),0);
 return <div className="space-y-5 pb-3">
  <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#081d36] via-[#13529b] to-[#2f70f4] p-5 text-white shadow-[0_18px_42px_rgba(30,91,180,.22)]">
   <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full border-[20px] border-white/10"/>
   <div className="relative z-10"><div className="flex items-center justify-between"><p className="text-[10px] font-black tracking-[.18em] text-blue-100">POINTPRO WALLET</p><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[9px] font-black">SECURE</span></div><b className="mt-2 block text-[32px] font-black tabular-nums">{p.balance.toFixed(6)} <span className="text-sm text-blue-100">PP</span></b><p className="mt-1 text-xs text-blue-100">Available balance</p><div className="mt-5 grid grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/10 bg-black/10 text-center backdrop-blur"><div className="p-3"><span className="block text-[8px] text-blue-100/70">TODAY</span><b className="mt-1 block text-sm tabular-nums">+{p.today.toFixed(3)}</b></div><div className="p-3"><span className="block text-[8px] text-blue-100/70">PENDING</span><b className="mt-1 block text-sm tabular-nums">{pending.toFixed(3)}</b></div><div className="p-3"><span className="block text-[8px] text-blue-100/70">REQUESTS</span><b className="mt-1 block text-sm">{requests.length}</b></div></div></div>
  </section>
  <div className="grid grid-cols-4 gap-2.5"><WalletAction icon={<ArrowDownToLine/>} label="Receive" onClick={()=>p.notify("Receive will be enabled after wallet setup")}/><WalletAction icon={<ArrowUpFromLine/>} label="Send" onClick={()=>p.notify("Send is disabled for security")}/><WalletAction icon={<ArrowLeftRight/>} label="Exchange" onClick={()=>p.notify("Exchange is not enabled yet")}/><WalletAction icon={<ArrowUpFromLine/>} label="Withdraw" onClick={()=>setShowWithdraw(true)}/></div>
  {showWithdraw&&<section className="rounded-[28px] border border-[#dfe5ef] bg-white p-5 shadow-[0_12px_30px_rgba(31,51,86,.08)]"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Withdraw PP Coin</h2><p className="mt-1 text-xs text-[#8993a6]">Available: {p.balance.toFixed(6)} PP</p></div><button type="button" onClick={()=>setShowWithdraw(false)} className="rounded-xl bg-[#f1f3f7] px-3 py-2 text-sm font-bold">Close</button></div><form onSubmit={submitWithdrawal} className="mt-4 space-y-3"><label className="block"><span className="mb-1.5 block text-xs font-bold text-[#66728a]">Withdrawal method</span><select value={method} onChange={e=>setMethod(e.target.value as any)} className="w-full rounded-2xl border border-[#dfe5ef] bg-white px-4 py-3 text-sm font-semibold"><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="usdt">USDT</option></select></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-[#66728a]">Amount (PP)</span><input value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="0.000001" step="0.000001" placeholder="Enter amount" className="w-full rounded-2xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none"/></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-[#66728a]">{method==="usdt"?"USDT wallet address":"Account number"}</span><input value={destination} onChange={e=>setDestination(e.target.value)} placeholder={method==="usdt"?"Enter wallet address":"01XXXXXXXXX"} className="w-full rounded-2xl border border-[#dfe5ef] px-4 py-3 text-sm outline-none"/></label><div className="rounded-2xl bg-[#fff8e6] p-3 text-xs leading-5 text-[#856404]">Withdrawal requests are processed according to your account and payment settings.</div><button disabled={busy} className="w-full rounded-2xl bg-[#2f70f4] py-3.5 font-black text-white disabled:opacity-60">{busy?"Submitting…":"Submit Withdrawal Request"}</button></form></section>}
  <Card title="Withdrawal History">{loading?<div className="p-6 text-center text-sm text-[#8993a6]">Loading withdrawals…</div>:requests.length===0?<div className="rounded-2xl bg-[#f5f7fb] p-6 text-center text-sm text-[#8993a6]">No withdrawal requests yet</div>:<div>{requests.map(r=><div key={r.id} className="flex items-center justify-between border-b border-[#edf0f5] py-3.5 last:border-0"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef5ff] text-[#2f70f4]"><ArrowUpFromLine size={16}/></div><div><b className="block text-sm uppercase">{r.method}</b><small className="text-xs text-[#8993a6]">{r.destination} • {new Date(r.created_at).toLocaleDateString()}</small></div></div><div className="text-right"><b className="block text-sm tabular-nums">-{Number(r.amount).toFixed(6)} PP</b><small className={`text-xs font-bold capitalize ${String(r.status).toLowerCase()==="approved"?"text-[#20b96c]":String(r.status).toLowerCase()==="rejected"?"text-[#e05252]":"text-[#d39b00]"}`}>{r.status}</small></div></div>)}</div>}</Card>
  <Card title="Recent Transactions">{loading?<div className="p-6 text-center text-sm text-[#8993a6]">Loading transactions…</div>:tx.length===0?<div className="rounded-2xl bg-[#f5f7fb] p-6 text-center text-sm text-[#8993a6]">No transactions yet</div>:<div>{tx.slice(0,8).map(t=><div key={t.id} className="flex items-center justify-between border-b border-[#edf0f5] py-3 last:border-0"><div><b className="block text-sm capitalize">{String(t.type).replace(/_/g," ")}</b><small className="text-xs text-[#8993a6]">{new Date(t.created_at).toLocaleDateString()}</small></div><b className={`text-sm tabular-nums ${Number(t.amount)>=0?"text-[#20b96c]":"text-[#e05252]"}`}>{Number(t.amount)>=0?"+":""}{Number(t.amount).toFixed(6)} PP</b></div>)}</div>}</Card>
 </div>
}
function Profile({p}:any){
 const [profile,setProfile]=useState<any>(null),[refCount,setRefCount]=useState(0),[refEarned,setRefEarned]=useState(0),[copied,setCopied]=useState(false);
 useEffect(()=>{let on=true;(async()=>{if(!supabase||!p.userId)return;const {data}=await supabase.from("profiles").select("display_name,username,referral_code").eq("id",p.userId).maybeSingle();if(on)setProfile(data);const {count}=await supabase.from("profiles").select("id",{count:"exact",head:true}).eq("referred_by",p.userId);if(on)setRefCount(count||0);const {data:rt}=await supabase.from("transactions").select("amount").eq("user_id",p.userId).eq("type","referral");if(on)setRefEarned((rt||[]).reduce((n:any,x:any)=>n+Number(x.amount||0),0))})();return()=>{on=false}},[p.userId]);
 const code=profile?.referral_code||REFERRAL;
 const copy=async()=>{try{await navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),1500)}catch{}};
 return <div className="space-y-5 pb-3">
  <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#081d36] via-[#15539a] to-[#2f70f4] p-5 text-white shadow-[0_18px_42px_rgba(30,91,180,.22)]">
   <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[20px] border-white/10"/><div className="relative z-10 flex items-center gap-4"><div className="grid h-18 w-18 shrink-0 place-items-center rounded-full border-4 border-white/15 bg-white/10"><UserRound size={34}/></div><div className="min-w-0"><p className="text-[10px] font-black tracking-[.16em] text-blue-100">POINTPRO ACCOUNT</p><h1 className="mt-1 truncate text-[24px] font-black">{profile?.display_name||"PointPro Miner"}</h1><p className="text-xs text-blue-100">@{profile?.username||"ppuser"}</p></div><CheckCircle2 className="ml-auto shrink-0 text-[#61f2a5]" size={23}/></div>
   <div className="relative z-10 mt-5 grid grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/10 bg-black/10 text-center backdrop-blur"><div className="p-3"><span className="block text-[9px] text-blue-100/70">BALANCE</span><b className="mt-1 block text-sm tabular-nums">{p.balance.toFixed(3)}</b></div><div className="p-3"><span className="block text-[9px] text-blue-100/70">REFERRALS</span><b className="mt-1 block text-sm">{refCount}</b></div><div className="p-3"><span className="block text-[9px] text-blue-100/70">EARNED</span><b className="mt-1 block text-sm tabular-nums">{refEarned.toFixed(3)}</b></div></div>
  </section>
  <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_28px_rgba(31,51,86,.07)]"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black tracking-[.16em] text-[#8993a6]">YOUR REFERRAL CODE</p><b className="mt-1 block text-[28px] tracking-wider text-[#17233a]">{code}</b><p className="mt-1 text-xs text-[#8993a6]">Invite friends and earn referral rewards.</p></div><Users size={28} className="text-[#2f70f4]"/></div><div className="mt-4 flex gap-2"><button onClick={copy} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#2f70f4] py-3.5 text-sm font-black text-white"><Copy size={16}/>{copied?"Copied":"Copy Code"}</button><button onClick={p.share} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#e3e8f1] py-3.5 text-sm font-black text-[#27364f]"><Share2 size={16}/> Share</button></div></section>
  <Card title="Account & Security"><MenuRow icon={<ShieldCheck/>} text="Security"/><MenuRow icon={<Bell/>} text="Notifications"/><MenuRow icon={<CircleHelp/>} text="Support"/><MenuRow icon={<FileText/>} text="Terms & Privacy"/><button onClick={async()=>{await supabase.auth.signOut()}} className="flex w-full items-center gap-3 py-4 text-left text-[#e5485d]"><LogOut size={19}/><b className="text-sm">Logout</b></button></Card>
 </div>}

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
