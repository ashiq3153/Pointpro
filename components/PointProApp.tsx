"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, CheckCircle2, CircleUserRound,
  Copy, Gift, Home, ListChecks, Menu, MessageCircle, Share2, Sparkles, Users,
  WalletCards, Zap
} from "lucide-react";

type Page = "home" | "mine" | "tasks" | "referral" | "wallet" | "profile";

const SPEED = 0.00124;
const REFERRAL = "PPUSER";
const APP_URL = "https://pointpro-one.vercel.app";

export default function PointProApp() {
  const [page, setPage] = useState<Page>("home");
  const [balance, setBalance] = useState(0);
  const [today, setToday] = useState(0);
  const [mining, setMining] = useState(true);
  const [boosted, setBoosted] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [tasks, setTasks] = useState(0);
  const [toast, setToast] = useState("");

  const rate = boosted ? SPEED * 1.1 : SPEED;
  const progress = Math.min(100, Math.round((today / (rate * 86400)) * 100));

  useEffect(() => {
    if (!mining) return;
    const timer = window.setInterval(() => {
      setBalance(v => v + rate);
      setToday(v => v + rate);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mining, rate]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const notify = (message: string) => setToast(message);

  const claimDaily = () => {
    if (claimed) return notify("Daily reward already claimed");
    setBalance(v => v + 5);
    setToday(v => v + 5);
    setClaimed(true);
    setTasks(v => v + 1);
    notify("+5 PP Coin added");
  };

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(`${APP_URL}/?ref=${REFERRAL}`);
      notify("Referral link copied");
    } catch { notify("Copy failed"); }
  };

  const shareReferral = async () => {
    const url = `${APP_URL}/?ref=${REFERRAL}`;
    if (navigator.share) await navigator.share({ title: "PointPro", text: "Join PointPro", url });
    else await copyReferral();
  };

  const nav = [
    ["home", Home, "Home"], ["mine", Zap, "Mine"], ["tasks", ListChecks, "Tasks"],
    ["referral", Users, "Referral"], ["wallet", WalletCards, "Wallet"], ["profile", CircleUserRound, "Profile"]
  ] as const;

  return (
    <div className="min-h-screen bg-[#070b14] pb-24">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#080d18]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <div className="text-2xl font-extrabold tracking-tight">Point<span className="text-emerald-400">Pro</span></div>
          <button onClick={() => notify("Telegram connection will use your Bot/WebApp credentials")} className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 font-bold text-white">
            <MessageCircle size={18}/> Telegram
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {page === "home" && <HomePage {...{balance,today,mining,boosted,rate,progress,setMining,setPage,claimDaily,notify}} />}
        {page === "mine" && <MinePage {...{mining,boosted,rate,setMining,setBoosted,notify}} />}
        {page === "tasks" && <TasksPage {...{claimed,mining,setMining,claimDaily,shareReferral,notify}} />}
        {page === "referral" && <ReferralPage {...{copyReferral,shareReferral}} />}
        {page === "wallet" && <WalletPage balance={balance} today={today} tasks={tasks} notify={notify} />}
        {page === "profile" && <ProfilePage balance={balance} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-[#09101c]/98">
        <div className="mx-auto grid max-w-2xl grid-cols-6">
          {nav.map(([key, Icon, label]) => (
            <button key={key} onClick={() => setPage(key)} className={`flex flex-col items-center gap-1 py-3 text-[11px] ${page === key ? "text-emerald-400" : "text-slate-500"}`}>
              <Icon size={21}/><span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
      {toast && <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 shadow-xl">{toast}</div>}
    </div>
  );
}

function HomePage(p: any) {
  return <div className="space-y-5">
    <div><p className="text-slate-400">Welcome back 👋</p><h1 className="mt-1 text-3xl font-extrabold">PP Coin Miner</h1></div>
    <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/70 to-slate-900 p-6 shadow-xl">
      <p className="text-slate-400">PP Coin Balance</p>
      <div className="mt-2 text-4xl font-extrabold">{p.balance.toFixed(6)} <span className="text-xl text-emerald-400">PP</span></div>
      <p className="mt-2 text-sm text-slate-500">Live in-app mining balance</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat title="Today's mined" value={`${p.today.toFixed(6)} PP`} />
        <Stat title="Mining speed" value={`+${p.rate.toFixed(5)} PP/s`} />
      </div>
    </section>
    <section className="rounded-3xl border border-slate-800 bg-[#101827] p-5">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Mining Status</h2><span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">{p.mining ? "ACTIVE" : "PAUSED"}</span></div>
      <div className="mx-auto my-7 grid h-56 w-56 place-items-center rounded-full border-[24px] border-slate-800 border-r-emerald-400 border-b-emerald-400">
        <div className="text-center"><Zap className="mx-auto text-emerald-400"/><b className="block text-2xl">{p.balance.toFixed(4)}</b><span className="text-xs text-slate-400">PP Coin</span></div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{width: `${Math.max(2,p.progress)}%`}}/></div>
      <p className="mt-2 text-center text-sm text-slate-500">24H progress • {p.progress}%</p>
      <button onClick={() => p.setMining((v:boolean)=>!v)} className="mt-5 w-full rounded-xl bg-emerald-400 py-3 font-extrabold text-slate-950">{p.mining ? "Pause Mining" : "Start Mining"}</button>
    </section>
    <div className="grid grid-cols-4 gap-2">
      <Action icon={<Gift/>} label="Daily" onClick={p.claimDaily}/><Action icon={<Zap/>} label="Boost" onClick={() => p.notify("Boost activated for this session")}/><Action icon={<ListChecks/>} label="Tasks" onClick={() => p.setPage("tasks")}/><Action icon={<Users/>} label="Invite" onClick={() => p.setPage("referral")}/>
    </div>
  </div>;
}

function MinePage(p:any) { return <div className="space-y-4"><h1 className="text-3xl font-extrabold">Mine PP Coin</h1><Card title="Mining Session"><Row a="Mining speed" b={`+${p.rate.toFixed(5)} PP/s`}/><Row a="Per minute" b={`+${(p.rate*60).toFixed(4)} PP/min`}/><Row a="Per hour" b={`+${(p.rate*3600).toFixed(2)} PP/hour`}/><button onClick={()=>p.setMining((v:boolean)=>!v)} className="mt-4 w-full rounded-xl bg-emerald-400 py-3 font-bold text-slate-950">{p.mining?"Pause":"Start"} Mining</button></Card><Card title="Mining Boosts"><Row a="⚡ Energy Boost" b="+10%"/><Row a="🎁 Daily Reward" b="+5 PP"/><Row a="📺 Watch Ads" b="+20%"/><button onClick={()=>p.setBoosted(true)} className="mt-4 w-full rounded-xl border border-emerald-400/30 bg-emerald-400/10 py-3 font-bold text-emerald-300">Activate 10% Boost</button></Card></div>; }

function TasksPage(p:any) { return <div className="space-y-4"><h1 className="text-3xl font-extrabold">Tasks</h1><p className="text-slate-400">Complete tasks and earn PP Coin.</p><Card title="Available Tasks"><Task icon={<Gift/>} title="Daily Check-in" text="Claim your daily reward" button={p.claimed?"Claimed":"+5 PP"} onClick={p.claimDaily}/><Task icon={<Zap/>} title="Activate Mining" text="Keep your mining session active" button={p.mining?"Active":"Start"} onClick={()=>p.setMining((v:boolean)=>!v)}/><Task icon={<Users/>} title="Invite a Friend" text="Share your referral link" button="Invite" onClick={p.shareReferral}/><Task icon={<Sparkles/>} title="Community Task" text="Visit the PointPro community" button="Open" onClick={()=>p.notify("Community task ready to connect")}/></Card></div>; }

function ReferralPage(p:any) { return <div className="space-y-4"><h1 className="text-3xl font-extrabold">Referral</h1><p className="text-slate-400">Invite friends and grow your PP Coin rewards.</p><div className="rounded-3xl bg-gradient-to-br from-emerald-950 to-slate-900 p-6"><p className="text-slate-400">Your referral code</p><div className="mt-2 text-3xl font-extrabold text-emerald-400">PPUSER</div><p className="mt-3 text-sm text-slate-400">Referral reward: 20% of eligible in-app mining bonus</p></div><Card title="Referral Stats"><Row a="Total referrals" b="0"/><Row a="Active referrals" b="0"/><Row a="Referral earnings" b="0.000000 PP"/><div className="mt-4 rounded-xl bg-slate-800 p-3 text-xs text-slate-300">{APP_URL}/?ref=PPUSER</div><button onClick={p.copyReferral} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3 font-bold text-slate-950"><Copy size={17}/> Copy Referral Link</button></Card></div>; }

function WalletPage({balance,today,tasks,notify}:any) { return <div className="space-y-4"><h1 className="text-3xl font-extrabold">Wallet</h1><div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6"><p className="text-blue-100">PP COIN WALLET</p><div className="mt-2 text-4xl font-extrabold">{balance.toFixed(6)} PP</div><p className="mt-2 text-sm text-blue-100">In-app balance</p><div className="mt-5 grid grid-cols-3 gap-2 text-sm"><div>Total<br/><b>{balance.toFixed(4)}</b></div><div>Today<br/><b>{today.toFixed(4)}</b></div><div>Tasks<br/><b>{tasks}</b></div></div></div><div className="grid grid-cols-4 gap-2"><Action icon={<ArrowDownToLine/>} label="Receive" onClick={()=>notify("Receive will connect to Supabase wallet")}/><Action icon={<ArrowUpFromLine/>} label="Send" onClick={()=>notify("Send will connect to Supabase wallet")}/><Action icon={<ArrowLeftRight/>} label="Exchange" onClick={()=>notify("Exchange will connect to backend")}/><Action icon={<ArrowUpFromLine/>} label="Withdraw" onClick={()=>notify("Withdrawal will connect to backend")}/></div><Card title="Recent Transactions"><p className="text-sm text-slate-500">No transactions yet.</p></Card></div>; }

function ProfilePage({balance}:any) { return <div className="space-y-4"><h1 className="text-3xl font-extrabold">Profile</h1><Card><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15"><CircleUserRound size={34} className="text-emerald-400"/></div><div><h2 className="text-xl font-bold">PointPro Miner</h2><p className="text-sm text-slate-500">@ppuser</p></div><CheckCircle2 className="ml-auto text-emerald-400"/></div><div className="mt-5"><Row a="Telegram ID" b="Not connected"/><Row a="Mining days" b="0 Days"/><Row a="Total earned" b={`${balance.toFixed(6)} PP`}/></div></Card><Card title="Account"><Row a="🔐 Security" b="›"/><Row a="🔔 Notifications" b="›"/><Row a="❓ Support" b="›"/></Card></div>; }

function Stat({title,value}:any){return <div className="rounded-xl bg-slate-800/70 p-3"><small className="text-slate-500">{title}</small><strong className="mt-1 block text-sm">{value}</strong></div>}
function Action({icon,label,onClick}:any){return <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-[#101827] p-3 text-xs font-bold text-slate-300">{icon}{label}</button>}
function Card({title,children}:any){return <section className="rounded-3xl border border-slate-800 bg-[#101827] p-5">{title&&<h2 className="mb-4 text-xl font-bold">{title}</h2>}{children}</section>}
function Row({a,b}:any){return <div className="flex items-center justify-between border-b border-slate-800 py-3 text-sm last:border-0"><span className="text-slate-400">{a}</span><b>{b}</b></div>}
function Task({icon,title,text,button,onClick}:any){return <div className="flex items-center gap-3 border-b border-slate-800 py-4 last:border-0"><div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-400">{icon}</div><div className="min-w-0 flex-1"><b className="block">{title}</b><small className="text-slate-500">{text}</small></div><button onClick={onClick} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950">{button}</button></div>}
