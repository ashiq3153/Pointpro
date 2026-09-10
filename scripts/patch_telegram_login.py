from pathlib import Path

path = Path("components/PointProApp.tsx")
text = path.read_text()

if 'import TelegramLoginButton from "./TelegramLoginButton";' not in text:
    marker = 'import { Bell, '
    idx = text.find(marker)
    if idx < 0:
        raise SystemExit("PointProApp import marker not found")
    line_end = text.find("\n", idx)
    text = text[:line_end + 1] + 'import TelegramLoginButton from "./TelegramLoginButton";\n' + text[line_end + 1:]

start = text.find("function AuthScreen(){")
end = text.find("function AuthInput", start)
if start < 0 or end < 0:
    raise SystemExit("AuthScreen markers not found")

new_auth = '''function AuthScreen(){
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
    if(password.length<8)throw new Error("Password must be at least 8 characters.");
    const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{display_name:name.trim(),referral_code:referral.trim()||null}}});
    if(error)throw error;
    if(data.session)setMessage("Account created successfully.");else setMessage("Account created. Please check your email to verify your account, then login.");
   }
  }catch(err:any){setMessage(err?.message||"Something went wrong")}finally{setBusy(false)}
 };
 return <div className="min-h-screen bg-[#06101d] px-4 py-8 text-white"><div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[430px] items-center justify-center"><section className="w-full rounded-[30px] border border-white/10 bg-[#0b1726] p-5 shadow-[0_25px_80px_rgba(0,0,0,.4)]">
  <div className="text-center"><img src="/pointpro-mark.svg" className="mx-auto h-20 w-20"/><h1 className="mt-4 text-3xl font-black">Point<span className="text-[#25d67c]">Pro</span></h1><p className="mt-1 text-xs font-bold tracking-[.2em] text-slate-400">PP COIN MINING</p></div>
  <div className="mt-7 grid grid-cols-2 rounded-2xl bg-[#06101d] p-1"><button type="button" onClick={()=>{setMode("login");setMessage("")}} className={`rounded-xl py-3 text-sm font-bold ${mode==="login"?"bg-[#2f70f4] text-white":"text-slate-400"}`}><LogIn size={16} className="mr-1 inline"/> Login</button><button type="button" onClick={()=>{setMode("register");setMessage("")}} className={`rounded-xl py-3 text-sm font-bold ${mode==="register"?"bg-[#2f70f4] text-white":"text-slate-400"}`}><UserPlus size={16} className="mr-1 inline"/> Register</button></div>
  <form onSubmit={submit} className="mt-5 space-y-3">
   {mode==="register"&&<AuthInput icon={<UserRound size={18}/>} value={name} onChange={setName} placeholder="Full name" required/>}
   <AuthInput icon={<Mail size={18}/>} value={email} onChange={setEmail} placeholder="Email address" type="email" required/>
   <AuthInput icon={<LockKeyhole size={18}/>} value={password} onChange={setPassword} placeholder="Password (minimum 8 characters)" type="password" required/>
   {mode==="register"&&<AuthInput icon={<Gift size={18}/>} value={referral} onChange={setReferral} placeholder="Referral code (optional)"/>}
   <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25d67c] py-3.5 font-black text-[#06101d] disabled:opacity-60">{busy?"Please wait…":mode==="login"?"Login to PointPro":"Create PointPro Account"}</button>
  </form>
  <TelegramLoginButton />
  {message&&<div className={`mt-4 rounded-2xl p-3 text-center text-sm ${message.toLowerCase().includes("success")||message.toLowerCase().includes("created")?"bg-[#0d3b2a] text-[#74f2ad]":"bg-[#3d1820] text-[#ff9aaa]"}`}>{message}</div>}
  <p className="mt-5 text-center text-xs leading-5 text-slate-500">Your account is secured by Supabase Authentication. Your mining data stays linked to your account.</p>
 </section></div></div>
}
'''

text = text[:start] + new_auth + text[end:]
path.write_text(text)
print("Telegram auth UI patched")
