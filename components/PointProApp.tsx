"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell, ChevronRight, CircleHelp, Copy, Gift, Home, ListChecks, Share2,
  ShieldCheck, Sparkles, UserRound, Users, WalletCards, Zap, ArrowDownToLine,
  ArrowUpFromLine, ArrowLeftRight, Play, Pause, CheckCircle2
} from "lucide-react";

type Tab = "home" | "mine" | "tasks" | "wallet" | "profile";

const SPEED = 0.00124;
const APP_URL = "https://pointpro-one.vercel.app";
const REFERRAL = "PPUSER";

export default function PointProApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [balance, setBalance] = useState(0);
  const [today, setToday] = useState(0);
  const [mining, setMining] = useState(true);
  const [boost, setBoost] = useState(false);
  const [toast, setToast] = useState("");

  const speed = boost ? SPEED * 1.2 : SPEED;

  useEffect(() => {
    if (!mining) return;
    const id = window.setInterval(() => {
      setBalance(v => v + speed);
      setToday(v => v + speed);
    }, 1000);
    return () => window.clearInterval(id);
  }, [mining, speed]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const notify = (s: string) => setToast(s);
  const progress = Math.min(100, Math.round((today / (SPEED * 86400)) * 100));

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(`${APP_URL}/?ref=${REFERRAL}`);
      notify("Referral link copied");
    } catch {
      notify("Copy failed");
    }
  };

  const shareReferral = async () => {
    const url = `${APP_URL}/?ref=${REFERRAL}`;
    if (navigator.share) await navigator.share({ title: "PointPro", text: "Join PointPro", url });
    else await copyReferral();
  };

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[.06] bg-[#07111f]/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[680px] items-center justify-between px-5">
          <div className="text-[27px] font-black tracking-[-1.5px]">Point<span className="text-[#21c875]">Pro</span></div>
          <button onClick={() => notify("Telegram connection will be enabled with the bot token")}
            className="flex items-center gap-2 rounded-xl bg-[#149ee9] px-4 py-2.5 text-sm font-bold text-white shadow-sm">
            <span className="text-base">✈</span> Telegram
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[680px] px-4 pb-28 pt-5">
        {tab === "home" && <Home balance={balance} today={today} mining={mining} speed={speed} progress={progress}
          setMining={setMining} setTab={setTab} notify={notify} />}
        {tab === "mine" && <Mine balance={balance} today={today} mining={mining} speed={speed}
          boost={boost} setMining={setMining} setBoost={setBoost} notify={notify} />}
        {tab === "tasks" && <Tasks mining={mining} setMining={setMining} share={shareReferral} notify={notify} />}
        {tab === "wallet" && <Wallet balance={balance} today={today} notify={notify} />}
        {tab === "profile" && <Profile balance={balance} copy={copyReferral} share={shareReferral} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[.07] bg-[#101a29]/98 backdrop-blur">
        <div className="mx-auto grid max-w-[680px] grid-cols-5">
          {([
            ["home", Home, "Home"], ["mine", Zap, "Mine"], ["tasks", ListChecks, "Tasks"],
            ["wallet", WalletCards, "Wallet"], ["profile", UserRound, "Profile"]
          ] as const).map(([key, Icon, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${tab === key ? "text-[#21d67a]" : "text-slate-500"}`}>
              <Icon size={22} strokeWidth={tab === key ? 2.5 : 2}/>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {toast && <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
    </div>
  );
}

function Home(p: any) {
  return <div className="space-y-5">
    <div className="flex items-start justify-between">
      <div><p className="text-[15px] text-slate-500">Welcome back 👋</p><h1 className="mt-1 text-[30px] font-black tracking-tight">My Dashboard</h1></div>
      <button onClick={() => p.notify("No new notifications")} className="mt-1 rounded-full border border-white/[.07] bg-[#101a29] p-2.5 shadow-sm"><Bell size={20}/></button>
    </div>

    <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2868ed] via-[#3267e8] to-[#1d56d5] p-6 text-white shadow-[0_14px_35px_rgba(37,99,235,.18)]">
      <div className="flex items-center justify-between"><p className="text-sm font-semibold text-blue-100">PP Balance</p><span className="rounded-full bg-[#101a29]/15 px-3 py-1 text-xs font-bold">● LIVE</span></div>
      <div className="mt-3 text-[39px] font-black tracking-tight">{p.balance.toFixed(6)} <span className="text-lg text-blue-100">PP</span></div>
      <p className="mt-1 text-sm text-blue-100">≈ 0.00 USD (Live Rate)</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Mini title="Today Earned" value={p.today.toFixed(4) + " PP"}/>
        <Mini title="Mining Speed" value={"+" + p.speed.toFixed(5) + " PP/s"}/>
      </div>
    </section>

    <section className="rounded-[28px] border border-white/[.07] bg-[#101a29] p-5 shadow-[0_15px_35px_rgba(0,0,0,.18)]">
      <div className="flex items-center justify-between"><h2 className="text-[21px] font-black">Mining Status</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.mining ? "bg-emerald-50 text-emerald-600" : "bg-[#273449] text-slate-500"}`}>{p.mining ? "● Active" : "Paused"}</span>
      </div>
      <div className="relative mx-auto my-7 grid h-[220px] w-[220px] place-items-center rounded-full"
        style={{background: `conic-gradient(#2f6df3 ${Math.max(5,p.progress)}%, #e8edf5 0)`}}>
        <div className="grid h-[176px] w-[176px] place-items-center rounded-full bg-[#101a29] text-center">
          <div><Zap size={25} className="mx-auto text-[#2fdb8a]"/><div className="mt-1 text-[25px] font-black">{p.balance.toFixed(4)}</div><div className="text-xs font-semibold text-slate-500">PP Coin</div></div>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#273449]"><div className="h-full rounded-full bg-[#2868ed]" style={{width:`${Math.max(3,p.progress)}%`}}/></div>
      <p className="mt-2 text-center text-sm text-slate-500">24H Progress • {p.progress}%</p>
      <button onClick={() => p.setMining((v:boolean)=>!v)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2868ed] py-3.5 font-bold text-white shadow-lg shadow-black/20">
        {p.mining ? <><Pause size={17}/> Pause Mining</> : <><Play size={17}/> Start Mining</>}
      </button>
    </section>

    <div className="grid grid-cols-4 gap-2.5">
      <Quick icon={<Gift/>} label="Daily" onClick={()=>p.notify("Daily reward is ready")}/>
      <Quick icon={<Zap/>} label="Boost" onClick={()=>p.setTab("mine")}/>
      <Quick icon={<ListChecks/>} label="Tasks" onClick={()=>p.setTab("tasks")}/>
      <Quick icon={<Users/>} label="Invite" onClick={()=>p.setTab("profile")}/>
    </div>
  </div>;
}

function Mine(p:any) {
  return <div className="space-y-5"><Title title="Mine PP Coin" sub="Manage your mining power and earning rate."/>
    <section className="rounded-[28px] bg-gradient-to-br from-[#2868ed] to-[#173f9e] p-6 text-white shadow-lg shadow-black/20">
      <div className="flex justify-between"><div><p className="text-sm text-blue-100">Current Balance</p><b className="mt-1 block text-4xl">{p.balance.toFixed(6)} PP</b></div><Zap size={34}/></div>
      <div className="mt-7 grid grid-cols-2 gap-3"><Mini title="Mining Speed" value={`+${p.speed.toFixed(5)} PP/s`}/><Mini title="Today" value={`${p.today.toFixed(4)} PP`}/></div>
    </section>
    <Card title="Mining Details"><Row a="Per minute" b={`+${(p.speed*60).toFixed(4)} PP`}/><Row a="Per hour" b={`+${(p.speed*3600).toFixed(2)} PP`}/><Row a="Status" b={p.mining?"Active":"Paused"}/></Card>
    <Card title="Boost Center"><Boost name="Energy Boost" value="+10%" active={p.boost} onClick={()=>p.setBoost(true)}/><Boost name="Super Boost" value="+20%" active={p.boost} onClick={()=>p.setBoost(true)}/></Card>
    <button onClick={()=>p.setMining((v:boolean)=>!v)} className="w-full rounded-2xl bg-[#2868ed] py-3.5 font-bold text-white">{p.mining?"Pause Mining":"Start Mining"}</button>
  </div>;
}

function Tasks(p:any) {
  return <div className="space-y-5"><Title title="Tasks" sub="Complete tasks and earn more PP Coin."/>
    <div className="flex gap-2 overflow-x-auto pb-1">{["Watch Ads","Daily Tasks","Social Tasks","Special"].map((x,i)=><span key={x} className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-bold ${i===0?"border-[#2868ed] bg-[#2868ed] text-white":"border-white/[.07] bg-[#101a29] text-slate-500"}`}>{x}</span>)}</div>
    <Card><Task icon={<Gift/>} title="Daily Check-in" text="Claim your daily reward" button="+5 PP" onClick={()=>p.notify("+5 PP reward claimed")}/><Task icon={<Zap/>} title="Mining Session" text="Keep your miner active" button={p.mining?"Active":"Start"} onClick={()=>p.setMining((v:boolean)=>!v)}/><Task icon={<Users/>} title="Invite a Friend" text="Share your PointPro referral link" button="Invite" onClick={p.share}/><Task icon={<Sparkles/>} title="Community Task" text="Connect with the PointPro community" button="Open" onClick={()=>p.notify("Community task coming soon")}/></Card>
  </div>;
}

function Wallet(p:any) {
  return <div className="space-y-5"><Title title="Wallet" sub="Your PP Coin balance and transactions."/>
    <section className="rounded-[28px] bg-gradient-to-br from-[#2868ed] to-[#174bc8] p-6 text-white shadow-lg shadow-black/20"><p className="text-sm font-bold text-blue-100">POINTPRO WALLET</p><b className="mt-2 block text-4xl">{p.balance.toFixed(6)} PP</b><p className="mt-1 text-sm text-blue-100">≈ 0.00 USD</p><div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs"><div><b className="block text-base">{p.balance.toFixed(3)}</b>Total</div><div><b className="block text-base">{p.today.toFixed(3)}</b>Today</div><div><b className="block text-base">0</b>Transactions</div></div></section>
    <div className="grid grid-cols-4 gap-2.5"><WalletAction icon={<ArrowDownToLine/>} label="Receive" onClick={()=>p.notify("Receive wallet address will be connected")}/><WalletAction icon={<ArrowUpFromLine/>} label="Send" onClick={()=>p.notify("Send will be connected to Supabase")}/><WalletAction icon={<ArrowLeftRight/>} label="Exchange" onClick={()=>p.notify("Exchange module will be connected")}/><WalletAction icon={<ArrowUpFromLine/>} label="Withdraw" onClick={()=>p.notify("Withdrawal module will be connected")}/></div>
    <Card title="Recent Transactions"><div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">No transactions yet</div></Card>
  </div>;
}

function Profile(p:any) {
  return <div className="space-y-5"><Title title="Profile" sub="Your PointPro account"/>
    <section className="rounded-[28px] bg-gradient-to-br from-[#eff5ff] to-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-blue-100"><UserRound size={31} className="text-[#2fdb8a]"/></div><div><h2 className="text-xl font-black">PointPro Miner</h2><p className="text-sm text-slate-500">@ppuser</p></div><CheckCircle2 className="ml-auto text-[#2fdb8a]"/></div><div className="mt-5 rounded-2xl bg-slate-900 p-4 text-white"><p className="text-xs text-slate-500">Your Referral Code</p><b className="mt-1 block text-2xl text-emerald-400">{REFERRAL}</b><p className="mt-2 text-sm text-slate-500">Invite friends and earn referral rewards.</p></div></section>
    <Card title="Referral"><Row a="Referral code" b={REFERRAL}/><Row a="Total referrals" b="0"/><Row a="Referral earnings" b="0.000000 PP"/><div className="mt-3 flex gap-2"><button onClick={p.copy} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2868ed] py-3 font-bold text-white"><Copy size={16}/> Copy</button><button onClick={p.share} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[.07] py-3 font-bold"><Share2 size={16}/> Share</button></div></Card>
    <Card><MenuRow icon={<ShieldCheck/>} text="Security"/><MenuRow icon={<Bell/>} text="Notifications"/><MenuRow icon={<CircleHelp/>} text="Support"/></Card>
  </div>;
}

function Title({title,sub}:{title:string;sub:string}){return <div><h1 className="text-[30px] font-black tracking-tight">{title}</h1><p className="mt-1 text-sm text-slate-500">{sub}</p></div>}
function Mini({title,value}:{title:string;value:string}){return <div className="rounded-2xl bg-[#101a29]/10 p-3"><small className="text-xs text-blue-100">{title}</small><b className="mt-1 block text-sm">{value}</b></div>}
function Quick({icon,label,onClick}:any){return <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-2xl border border-white/[.07] bg-[#101a29] p-3 text-xs font-bold text-slate-600 shadow-sm">{icon}{label}</button>}
function WalletAction({icon,label,onClick}:any){return <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-2xl border border-white/[.07] bg-[#101a29] p-3 text-[11px] font-bold text-slate-600">{icon}{label}</button>}
function Card({title,children}:any){return <section className="rounded-[28px] border border-white/[.07] bg-[#101a29] p-5 shadow-sm">{title&&<h2 className="mb-2 text-[20px] font-black">{title}</h2>}{children}</section>}
function Row({a,b}:{a:string;b:string}){return <div className="flex items-center justify-between border-b border-slate-100 py-3.5 text-sm last:border-0"><span className="text-slate-500">{a}</span><b>{b}</b></div>}
function Boost({name,value,active,onClick}:any){return <div className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0"><div className="rounded-xl bg-blue-500/10 p-2.5 text-[#2fdb8a]"><Zap size={18}/></div><div className="flex-1"><b>{name}</b><p className="text-xs text-slate-500">Increase mining power</p></div><button onClick={onClick} className={`rounded-xl px-3 py-2 text-xs font-bold ${active?"bg-emerald-50 text-emerald-600":"bg-[#2868ed] text-white"}`}>{active?"Active":value}</button></div>}
function Task({icon,title,text,button,onClick}:any){return <div className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-0"><div className="rounded-xl bg-blue-500/10 p-3 text-[#2fdb8a]">{icon}</div><div className="min-w-0 flex-1"><b className="block text-sm">{title}</b><small className="text-xs text-slate-500">{text}</small></div><button onClick={onClick} className="rounded-xl bg-[#2868ed] px-3 py-2 text-xs font-bold text-white">{button}</button></div>}
function MenuRow({icon,text}:{icon:any;text:string}){return <button className="flex w-full items-center gap-3 border-b border-slate-100 py-4 text-left last:border-0"><span className="text-slate-500">{icon}</span><b className="flex-1 text-sm">{text}</b><ChevronRight size={18} className="text-slate-500"/></button>}
