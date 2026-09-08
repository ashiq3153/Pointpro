"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, ChevronRight, CircleHelp, Copy, Gift, Home as HomeIcon, ListChecks, Share2, ShieldCheck, Sparkles, UserRound, Users, WalletCards, Zap, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Play, Pause, CheckCircle2, TrendingUp, BarChart3, Menu } from "lucide-react";

type Tab = "home" | "mine" | "tasks" | "wallet" | "profile";
const SPEED=0.00124;
const APP_URL="https://pointpro-one.vercel.app";
const REFERRAL="PPUSER";

export default function PointProApp(){
 const [tab,setTab]=useState<Tab>("home"),[balance,setBalance]=useState(0),[today,setToday]=useState(0),[mining,setMining]=useState(false),[boost,setBoost]=useState(false),[toast,setToast]=useState(""),[showIntro,setShowIntro]=useState(true),[userId,setUserId]=useState<string|null>(null),[loadingData,setLoadingData]=useState(true);
 const speed=boost?SPEED*1.2:SPEED;
 useEffect(()=>{let mounted=true;(async()=>{if(!supabase){setLoadingData(false);return}const {data:{user}}=await supabase.auth.getUser();if(!mounted)return;setUserId(user?.id??null);if(user){const {data}=await supabase.from("balances").select("available").eq("user_id",user.id).maybeSingle();if(mounted&&data)setBalance(Number(data.available)||0);const {data:s}=await supabase.from("mining_sessions").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();if(mounted)setMining(!!s)}setLoadingData(false)})();return()=>{mounted=false}},[]);
 useEffect(()=>{if(!mining)return;const id=window.setInterval(()=>{setBalance(v=>v+speed);setToday(v=>v+speed)},1000);return()=>clearInterval(id)},[mining,speed]);
 const toggleMining=async()=>{const next=!mining;setMining(next);if(!supabase||!userId){notify(next?"Mining started locally — connect Supabase to persist":"Mining paused");return}if(next){const {error}=await supabase.from("mining_sessions").insert({user_id:userId,rate:speed,status:"active"});if(error){setMining(false);notify("Could not start mining")}}else{const {data}=await supabase.from("mining_sessions").select("id").eq("user_id",userId).eq("status","active").order("started_at",{ascending:false}).limit(1).maybeSingle();if(data)await supabase.from("mining_sessions").update({status:"stopped",stopped_at:new Date().toISOString()}).eq("id",data.id)}};
 useEffect(()=>{const id=window.setTimeout(()=>setShowIntro(false),2400);return()=>clearTimeout(id)},[]);
 useEffect(()=>{if(!toast)return;const id=setTimeout(()=>setToast(""),2200);return()=>clearTimeout(id)},[toast]);
 const notify=(s:string)=>setToast(s), progress=Math.min(100,Math.round(today/(SPEED*86400)*100));
 const copy=async()=>{try{await navigator.clipboard.writeText(`${APP_URL}/?ref=${REFERRAL}`);notify("Referral link copied")}catch{notify("Copy failed")}};
 const share=async()=>{const url=`${APP_URL}/?ref=${REFERRAL}`;if(navigator.share)await navigator.share({title:"PointPro",text:"Join PointPro",url});else await copy()};
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
   {tab==="tasks"&&<Tasks p={{mining,setMining:toggleMining,share,notify}}/>}
   {tab==="wallet"&&<Wallet p={{balance,today,notify}}/>}
   {tab==="profile"&&<Profile p={{copy,share}}/>}
  </main>
  <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e3e8f1] bg-white/98 backdrop-blur"><div className="mx-auto grid max-w-[680px] grid-cols-5">
   {([["home",HomeIcon,"Home"],["mine",Zap,"Mine"],["tasks",ListChecks,"Tasks"],["wallet",WalletCards,"Wallet"],["profile",UserRound,"Profile"]] as const).map(([k,I,l])=><button key={k} onClick={()=>setTab(k)} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${tab===k?"text-[#2868ed]":"text-[#8993a6]"}`}><I size={22} strokeWidth={tab===k?2.5:2}/><span>{l}</span></button>)}
  </div></nav>
  {toast&&<div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-2xl bg-[#18243b] px-4 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
 </div>
}

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

function Mine({p}:any){return <div className="space-y-5"><Title title="Mine PP Coin" sub="Your mining control center"/>
 <section className="overflow-hidden rounded-[30px] bg-[#06101d] shadow-[0_20px_55px_rgba(5,16,30,.28)]">
  <div className="relative aspect-[16/10] w-full overflow-hidden">
   <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_45%,rgba(47,112,244,.18),transparent_38%),linear-gradient(135deg,#06101d,#0a2038_55%,#030913)]"/>
   <div className="absolute inset-0 opacity-40" style={{backgroundImage:"linear-gradient(rgba(93,179,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(93,179,255,.08) 1px,transparent 1px)",backgroundSize:"28px 28px"}}/>
   <div className="absolute inset-x-4 bottom-8 h-24 rounded-[28px] bg-black/40 blur-xl"/>

   <div className="machine absolute left-[5%] top-[9%] h-[73%] w-[43%] rounded-[24px] border-2 border-slate-500/70 bg-gradient-to-br from-slate-600 via-slate-800 to-[#070c13] shadow-[inset_0_0_30px_rgba(255,255,255,.06),0_15px_35px_rgba(0,0,0,.45)]">
    <div className="absolute inset-2 rounded-[19px] border border-white/10"/>
    <div className="absolute left-4 right-4 top-3 flex items-center justify-between text-[7px] tracking-[.18em] text-slate-400"><span>PP MINING ENGINE</span><span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-[#27df78] animate-pulse"/>ONLINE</span></div>
    <div className="absolute left-[10%] right-[10%] top-[18%] h-[35%] rounded-[16px] border-2 border-slate-600 bg-[#040b14] shadow-[inset_0_0_22px_rgba(47,112,244,.22)]">
      <div className="absolute left-[10%] top-[22%] h-14 w-14 rounded-full border-[3px] border-[#2f70f4] bg-[#0a2948] shadow-[0_0_18px_rgba(47,112,244,.45)]"><div className="absolute inset-3 rounded-full bg-[#4aa8ff] animate-pulse"/></div>
      <div className="absolute right-[10%] top-[22%] h-14 w-14 rounded-full border-[3px] border-[#2f70f4] bg-[#0a2948] shadow-[0_0_18px_rgba(47,112,244,.45)]"><div className="absolute inset-3 rounded-full bg-[#4aa8ff] animate-pulse" style={{animationDelay:".3s"}}/></div>
      <div className="absolute left-[43%] top-[27%] h-9 w-[14%] rounded-full bg-[#2f70f4]/20 blur-sm"/><div className="absolute left-[42%] top-[31%] h-1 w-[16%] bg-[#55b5ff] shadow-[0_0_12px_#55b5ff]"/>
      <div className="absolute inset-x-4 bottom-3 h-1 rounded-full bg-slate-700"/>
    </div>
    <div className="absolute left-[10%] right-[10%] bottom-[8%] h-[24%] rounded-[14px] border border-slate-600 bg-[#07111e]">
      <div className="px-3 pt-2 text-[7px] font-bold tracking-[.15em] text-slate-500">MINING SIGNAL</div>
      <div className="mt-2 flex justify-around px-2">{[["RED","bg-[#ff4557]"],["BLUE","bg-[#3c9bff]"],["RED","bg-[#ff4557]"],["GREEN","bg-[#27df78]"]].map(([label,clr],i)=><div key={i} className="flex flex-col items-center gap-1"><span className={"signal-dot h-4 w-4 rounded-full border border-white/20 "+clr}/><small className="text-[6px] text-slate-500">{label}</small></div>)}</div>
      <div className="absolute bottom-2 left-3 right-3 text-center text-[8px] font-black text-white">+{p.speed.toFixed(5)} PP/s</div>
    </div>
    <div className="absolute -left-1 top-[25%] flex flex-col gap-2">{[1,2,3,4,5].map(i=><span key={i} className="h-1 w-2 rounded-r bg-slate-400/40"/>)}</div>
   </div>

   <div className="absolute left-[43%] top-[48%] z-10 h-12 w-10 rounded-r-xl border-y-2 border-r-2 border-slate-500 bg-[#101c29]"><div className="m-2 h-7 rounded bg-[#06101c] shadow-[0_0_12px_rgba(47,112,244,.35)]"/></div>

   <div className="absolute left-[39%] right-[4%] top-[57%] h-[17%] rounded-[22px] border-2 border-slate-500/80 bg-gradient-to-b from-slate-700 to-[#0a111a] shadow-[0_12px_25px_rgba(0,0,0,.45)]">
    <div className="absolute inset-x-3 top-3 h-8 overflow-hidden rounded-xl border border-slate-600 bg-[#050b12]"><div className="belt absolute inset-y-0 -left-10 w-[160%]" style={{backgroundImage:"repeating-linear-gradient(90deg,transparent 0 28px,rgba(255,205,45,.9) 28px 34px,transparent 34px 62px)",animation:"belt 1s linear infinite"}}/><div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/20"/></div>
    <div className="absolute bottom-1 left-5 h-5 w-5 rounded-full border-2 border-slate-500 bg-[#111a25] animate-spin"/><div className="absolute bottom-1 right-5 h-5 w-5 rounded-full border-2 border-slate-500 bg-[#111a25] animate-spin" style={{animationDuration:"1.1s"}}/>
   </div>

   <div className="pointer-events-none absolute left-[39%] top-[55%] h-16 w-[58%]">{[0,1,2,3,4,5].map(i=><div key={i} className="coin absolute top-2 grid h-10 w-10 place-items-center rounded-full border-2 border-yellow-100 bg-gradient-to-br from-yellow-100 via-yellow-400 to-amber-700 text-[13px] font-black text-amber-900 shadow-[0_0_18px_rgba(255,211,48,.5)]" style={{animationDelay:(i*.8)+"s"}}>PP</div>)}</div>

   <div className="absolute right-[5%] top-[9%] h-[38%] w-[38%] rounded-[20px] border border-slate-500 bg-[#07111e]/95 p-3 shadow-[0_15px_35px_rgba(0,0,0,.4)]">
     <div className="flex items-center justify-between text-[9px] font-black text-white"><span>LIVE SIGNAL</span><span className="flex items-center gap-1 text-[6px] text-[#27df78]"><i className="h-1.5 w-1.5 rounded-full bg-[#27df78] animate-pulse"/>ENGINE</span></div>
     <div className="mt-2 h-[58%] overflow-hidden rounded-xl border border-slate-700 bg-[#040b14] p-2"><svg viewBox="0 0 240 80" className="h-full w-full"><path d="M4 63L28 48L48 54L70 28L91 42L113 20L136 34L158 15L182 29L205 9L235 19" fill="none" stroke="#58b4ff" strokeWidth="3" strokeDasharray="7 6"><animate attributeName="stroke-dashoffset" from="0" to="-52" dur="1.7s" repeatCount="indefinite"/></path><path d="M4 63L28 48L48 54L70 28L91 42L113 20L136 34L158 15L182 29L205 9L235 19V75H4Z" fill="#2f70f4" opacity=".08"/></svg></div>
     <div className="mt-2 flex justify-between text-[6px]">{[["RED","#ff4557"],["BLUE","#3c9bff"],["RED","#ff4557"],["GREEN","#27df78"]].map(([x,c],i)=><span key={i} className="flex items-center gap-1 text-slate-400"><i className="h-1.5 w-1.5 rounded-full" style={{background:c}}/>{x}</span>)}</div>
   </div>

   <div className="absolute left-4 top-4 z-20 rounded-2xl border border-white/10 bg-[#071426]/90 px-3 py-2 text-white shadow-xl backdrop-blur"><div className="flex items-center gap-2 text-[10px] font-black"><span className={"h-2.5 w-2.5 rounded-full "+(p.mining?"bg-[#27df78] animate-pulse":"bg-slate-500")}/>{p.mining?"MINING ACTIVE":"MINING PAUSED"}</div><div className="mt-1 text-sm font-black">+{p.speed.toFixed(5)} PP/s</div></div>
   <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-[#071426]/90 px-4 py-1.5 text-[10px] font-bold text-white shadow-lg"><span className="mr-1 text-[#27df78]">●</span> Live coin collection</div>
  </div>
  <div className="grid grid-cols-3 border-t border-white/10 px-3 py-3 text-center text-[10px]"><div><span className="block text-slate-400">Rate</span><b className="text-white">+{p.speed.toFixed(5)} PP/s</b></div><div className="border-x border-white/10"><span className="block text-slate-400">Per Minute</span><b className="text-white">+{(p.speed*60).toFixed(4)} PP</b></div><div><span className="block text-slate-400">24H Progress</span><b className="text-[#27df78]">0%</b></div></div>
  <style jsx>{`
   @keyframes belt{to{transform:translateX(62px)}} 
   @keyframes coinMove{0%{left:-2%;transform:translateY(8px) scale(.45) rotate(-20deg);opacity:0}8%{opacity:1}35%{transform:translateY(-2px) scale(1) rotate(8deg);opacity:1}72%{transform:translateY(2px) scale(.92) rotate(-10deg);opacity:1}100%{left:92%;transform:translateY(7px) scale(.48) rotate(25deg);opacity:0}}
   .coin{animation:coinMove 4.8s cubic-bezier(.2,.55,.25,1) infinite}
   @keyframes signalPulse{0%,70%,100%{opacity:.28;transform:scale(.85)}12%,25%{opacity:1;transform:scale(1);box-shadow:0 0 12px currentColor}}
   .signal-dot{animation:signalPulse 2.8s ease-in-out infinite}
  `}</style>
 </section>
 <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2f70f4] to-[#194fc9] p-6 text-white"><img src="/pp-coin-stack.svg" className="absolute -right-6 bottom-0 w-44 opacity-90"/><p className="text-sm text-blue-100">PP Coin Balance</p><b className="mt-1 block text-4xl">{p.balance.toFixed(6)} PP</b><p className="mt-6 text-sm text-blue-100">Mining power</p><b className="text-xl">+{p.speed.toFixed(5)} PP / sec</b></section><Card title="Mining Statistics"><Row a="Per minute" b={"+"+(p.speed*60).toFixed(4)+" PP"}/><Row a="Per hour" b={"+"+(p.speed*3600).toFixed(2)+" PP"}/><Row a="Per day" b={"+"+(p.speed*86400).toFixed(2)+" PP"}/><Row a="Mining status" b={p.mining?"Active":"Paused"}/></Card><Card title="Boost Center"><Boost name="Energy Boost" value="+10%" active={p.boost} onClick={()=>p.setBoost(true)}/><Boost name="Super Boost" value="+20%" active={p.boost} onClick={()=>p.setBoost(true)}/></Card></div>}
function Tasks({p}:any){return <div className="space-y-5"><Title title="Tasks" sub="Complete tasks and earn more PP Coin."/><div className="flex gap-2 overflow-x-auto pb-1">{["Watch Ads","Daily Tasks","Social Tasks","Special"].map((x,i)=><span key={x} className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-bold ${i===0?"border-[#2f70f4] bg-[#2f70f4] text-white":"border-[#e4e8f0] bg-white text-[#8993a6]"}`}>{x}</span>)}</div><Card><Task icon={<Gift/>} title="Daily Check-in" text="Claim your daily reward" button="+5 PP" onClick={()=>p.notify("+5 PP reward claimed")}/><Task icon={<Zap/>} title="Mining Session" text="Keep your miner active" button={p.mining?"Active":"Start"} onClick={()=>p.setMining((v:boolean)=>!v)}/><Task icon={<Users/>} title="Invite a Friend" text="Share your PointPro referral link" button="Invite" onClick={p.share}/><Task icon={<Sparkles/>} title="Community Task" text="Connect with the PointPro community" button="Open" onClick={()=>p.notify("Community task coming soon")}/></Card></div>}

function Wallet({p}:any){const [tx,setTx]=useState<any[]>([]);const [loading,setLoading]=useState(true);useEffect(()=>{let on=true;(async()=>{if(!supabase||!p.userId){setLoading(false);return}const {data}=await supabase.from("transactions").select("id,type,amount,status,created_at").eq("user_id",p.userId).order("created_at",{ascending:false}).limit(20);if(on)setTx(data||[]);setLoading(false)})();return()=>{on=false}},[p.userId]);return <div className="space-y-5"><Title title="Wallet" sub="Manage your PP Coin securely."/><section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2f70f4] to-[#174bc8] p-6 text-white shadow-[0_15px_35px_rgba(47,112,244,.2)]"><p className="text-sm font-bold text-blue-100">POINTPRO WALLET</p><b className="mt-2 block text-4xl">{p.balance.toFixed(6)} PP</b><p className="mt-1 text-sm text-blue-100">≈ $0.00 USD • Live Rate</p><div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs"><div><b className="block text-base">{p.balance.toFixed(3)}</b>Total</div><div><b className="block text-base">{p.today.toFixed(3)}</b>Today</div><div><b className="block text-base">{tx.length}</b>Transactions</div></div></section><div className="grid grid-cols-4 gap-2.5"><WalletAction icon={<ArrowDownToLine/>} label="Receive" onClick={()=>p.notify("Receive will be enabled after wallet setup")}/><WalletAction icon={<ArrowUpFromLine/>} label="Send" onClick={()=>p.notify("Send requires a verified recipient")}/><WalletAction icon={<ArrowLeftRight/>} label="Exchange" onClick={()=>p.notify("Exchange is not enabled yet")}/><WalletAction icon={<ArrowUpFromLine/>} label="Withdraw" onClick={()=>p.notify("Withdrawal is not enabled yet")}/></div><Card title="Recent Transactions">{loading?<div className="p-6 text-center text-sm text-[#8993a6]">Loading transactions…</div>:tx.length===0?<div className="rounded-2xl bg-[#f5f7fb] p-6 text-center text-sm text-[#8993a6]">No transactions yet</div>:<div>{tx.map(t=><div key={t.id} className="flex items-center justify-between border-b border-[#edf0f5] py-3 last:border-0"><div><b className="block text-sm capitalize">{t.type}</b><small className="text-xs text-[#8993a6]">{new Date(t.created_at).toLocaleString()}</small></div><div className="text-right"><b className="block text-sm">{Number(t.amount)>=0?"+":""}{Number(t.amount).toFixed(6)} PP</b><small className="text-xs text-[#8993a6] capitalize">{t.status}</small></div></div>)}</div>}</Card></div>}
function Profile({p}:any){return <div className="space-y-5"><Title title="Profile" sub="Your PointPro account"/><section className="rounded-[28px] bg-white p-5 shadow-[0_12px_30px_rgba(31,51,86,.08)]"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-[#eaf2ff]"><UserRound size={31} className="text-[#2f70f4]"/></div><div><h2 className="text-xl font-black">PointPro Miner</h2><p className="text-sm text-[#8993a6]">@ppuser</p></div><CheckCircle2 className="ml-auto text-[#25c879]"/></div><div className="mt-5 rounded-2xl bg-[#101a29] p-4 text-white"><p className="text-xs text-slate-400">Your Referral Code</p><b className="mt-1 block text-2xl text-[#ffd02f]">{REFERRAL}</b><p className="mt-2 text-sm text-slate-400">Invite friends and earn referral rewards.</p></div></section><Card title="Referral"><Row a="Referral code" b={REFERRAL}/><Row a="Total referrals" b="0"/><Row a="Referral earnings" b="0.000000 PP"/><div className="mt-3 flex gap-2"><button onClick={p.copy} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2f70f4] py-3 font-bold text-white"><Copy size={16}/> Copy</button><button onClick={p.share} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e3e8f1] py-3 font-bold"><Share2 size={16}/> Share</button></div></Card><Card><MenuRow icon={<ShieldCheck/>} text="Security"/><MenuRow icon={<Bell/>} text="Notifications"/><MenuRow icon={<CircleHelp/>} text="Support"/></Card></div>}

function Title({title,sub}:{title:string;sub:string}){return <div><h1 className="text-[30px] font-black tracking-tight">{title}</h1><p className="mt-1 text-sm text-[#8993a6]">{sub}</p></div>}
function Mini({title,value}:{title:string;value:string}){return <div className="rounded-2xl bg-white/10 p-3 backdrop-blur"><small className="text-xs text-blue-100">{title}</small><b className="mt-1 block text-sm">{value}</b></div>}
function Quick({icon,label,onClick}:any){return <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-xs font-bold text-[#556179] shadow-[0_8px_22px_rgba(31,51,86,.07)]">{icon}{label}</button>}
function WalletAction({icon,label,onClick}:any){return <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-[11px] font-bold text-[#556179] shadow-[0_8px_22px_rgba(31,51,86,.07)]">{icon}{label}</button>}
function Card({title,children}:any){return <section className="rounded-[28px] bg-white p-5 shadow-[0_10px_28px_rgba(31,51,86,.07)]">{title&&<h2 className="mb-2 text-[20px] font-black">{title}</h2>}{children}</section>}
function Row({a,b}:{a:string;b:string}){return <div className="flex items-center justify-between border-b border-[#edf0f5] py-3.5 text-sm last:border-0"><span className="text-[#8993a6]">{a}</span><b>{b}</b></div>}
function Boost({name,value,active,onClick}:any){return <div className="flex items-center gap-3 border-b border-[#edf0f5] py-3 last:border-0"><div className="rounded-xl bg-[#eaf2ff] p-2.5 text-[#2f70f4]"><Zap size={18}/></div><div className="flex-1"><b>{name}</b><p className="text-xs text-[#8993a6]">Increase mining power</p></div><button onClick={onClick} className={`rounded-xl px-3 py-2 text-xs font-bold ${active?"bg-[#e8fff3] text-[#20b96c]":"bg-[#2f70f4] text-white"}`}>{active?"Active":value}</button></div>}
function Task({icon,title,text,button,onClick}:any){return <div className="flex items-center gap-3 border-b border-[#edf0f5] py-4 last:border-0"><div className="rounded-xl bg-[#eaf2ff] p-3 text-[#2f70f4]">{icon}</div><div className="min-w-0 flex-1"><b className="block text-sm">{title}</b><small className="text-xs text-[#8993a6]">{text}</small></div><button onClick={onClick} className="rounded-xl bg-[#2f70f4] px-3 py-2 text-xs font-bold text-white">{button}</button></div>}
function MenuRow({icon,text}:{icon:any;text:string}){return <button className="flex w-full items-center gap-3 border-b border-[#edf0f5] py-4 text-left last:border-0"><span className="text-[#68758b]">{icon}</span><b className="flex-1 text-sm">{text}</b><ChevronRight size={18} className="text-[#8993a6]"/></button>}

// Vercel redeploy trigger: duplicate Home import fixed.
