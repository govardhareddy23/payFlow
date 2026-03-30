import { useState, useEffect } from "react";
// Removed Firebase imports

// ─── Utilities ────────────────────────────────────────────────────────────────
const rupee = n => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits:2, maximumFractionDigits:2 });
const stamp = d => new Date(d).toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
const initials = n => n.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
const avaColor = n => ["#7c3aed","#2563eb","#0891b2","#059669","#d97706","#dc2626"][n.charCodeAt(0)%6];

// ─── API Helpers ─────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiFetch = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API Error');
  return data;
};

// ─── Injected CSS ─────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root {
  --primary: #6366f1;
  --secondary: #a855f7;
  --bg: #ffffff;
  --card: #f8fafc;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
}
.app{font-family:'DM Sans',sans-serif;min-height:100vh;background:#f1f5f9;display:flex;align-items:center;justify-content:center}
.phone{width:390px;height:844px;background:var(--bg);border-radius:40px;position:relative;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);display:flex;flex-direction:column;border:8px solid #000}
@media(max-width:430px){.phone{width:100vw;height:100dvh;border-radius:0;border:none}}
.screen{flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;background:var(--bg)}
.screen::-webkit-scrollbar{display:none}

.splash{height:100%;background:linear-gradient(135deg,#f8fafc 0%,#ffffff 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}
.sp-logo{width:84px;height:84px;background:linear-gradient(135deg,var(--primary),var(--secondary));border-radius:26px;display:flex;align-items:center;justify-content:center;font-size:38px;animation:pulse 2s ease-in-out infinite;box-shadow:0 10px 30px rgba(99,102,241,0.3)}
.sp-title{font-family:'Syne',sans-serif;font-size:34px;font-weight:800;color:var(--text);letter-spacing:-1.5px}
.sp-sub{font-size:13px;color:var(--text-muted);letter-spacing:2.5px;text-transform:uppercase}
.dots{display:flex;gap:7px;margin-top:50px}
.dot{width:8px;height:8px;border-radius:50%;animation:bounce 1.2s ease-in-out infinite}
.dot:nth-child(1){background:var(--primary)}
.dot:nth-child(2){background:var(--secondary);animation-delay:.2s}
.dot:nth-child(3){background:var(--primary);animation-delay:.4s}

.card{background:var(--card);border-radius:20px;padding:20px;border:1px solid var(--border);margin-bottom:12px;box-shadow:0 2px 4px rgba(0,0,0,0.02)}
.bal-card{background:linear-gradient(135deg,var(--primary) 0%,var(--secondary) 100%);border-radius:22px;padding:24px;position:relative;overflow:hidden;border:none;margin-bottom:16px;color:#fff;box-shadow:0 15px 35px rgba(99,102,241,0.3)}
.bal-card::before,.bal-card::after{content:'';position:absolute;border-radius:50%}
.bal-card::before{width:140px;height:140px;background:rgba(255,255,255,0.1);top:-50px;right:-30px}
.bal-card::after{width:80px;height:80px;background:rgba(255,255,255,0.07);bottom:-20px;left:-10px}

.grp{margin-bottom:14px}
.lbl{font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:7px;display:block}
.inp{width:100%;background:#ffffff;border:1.5px solid var(--border);border-radius:13px;padding:13px 15px;font-family:'DM Sans',sans-serif;font-size:15px;color:var(--text);outline:none;transition:all .2s}
.inp:focus{border-color:var(--primary);box-shadow:0 0 0 4px rgba(99,102,241,0.1)}
.inp::placeholder{color:#cbd5e1}

.btn{width:100%;padding:15px;border-radius:14px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;transition:all .2s;letter-spacing:.1px;display:block}
.btn-p{background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;box-shadow:0 8px 20px rgba(99,102,241,0.25)}
.btn-p:hover{transform:translateY(-1px);box-shadow:0 12px 24px rgba(99,102,241,0.3)}
.btn-s{background:#fff;color:var(--text);border:1.5px solid var(--border)}
.btn-g{background:transparent;color:var(--primary);font-size:14px;padding:10px;font-weight:500}
.mt8{margin-top:8px} .mt12{margin-top:12px} .mt16{margin-top:16px} .mt24{margin-top:24px}

.nav{display:flex;background:#ffffff;border-top:1px solid var(--border);padding:10px 0 24px;flex-shrink:0}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 4px;cursor:pointer;border:none;background:transparent;transition:all .15s}
.nav-icon{font-size:22px;transition:transform .2s}
.nav-lbl{font-size:10px;font-family:'DM Sans',sans-serif;font-weight:500;color:var(--text-muted);letter-spacing:.2px}
.nav-item.on .nav-lbl{color:var(--primary)}
.nav-item.on .nav-icon{transform:scale(1.12)}

.toast{position:absolute;top:56px;left:16px;right:16px;z-index:999;border-radius:14px;padding:13px 16px;font-size:13px;font-weight:500;animation:fadeup .3s ease;display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,0.1);line-height:1.4}
.t-ok{background:#10b981;color:#fff}
.t-err{background:#ef4444;color:#fff}
.t-info{background:var(--text);color:#fff}

.pin-dots{display:flex;justify-content:center;gap:14px;margin:24px 0}
.pdot{width:14px;height:14px;border-radius:50%;border:2px solid var(--border);transition:all .15s}
.pdot.on{background:var(--primary);border-color:var(--primary);box-shadow:0 0 12px rgba(99,102,241,0.4)}
.keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 24px}
.key{height:58px;border-radius:15px;background:#f8fafc;border:1.5px solid var(--border);color:var(--text);font-family:'DM Sans',sans-serif;font-size:22px;font-weight:400;cursor:pointer;transition:all .12s;display:flex;align-items:center;justify-content:center}
.key:active{background:#f1f5f9;transform:scale(.94)}
.key.empty{background:transparent;border:none;cursor:default}
.key.del{font-size:18px}

.toggle{display:flex;background:#f1f5f9;border-radius:12px;padding:4px;margin-bottom:20px}
.tgl-btn{flex:1;padding:9px 4px;border-radius:9px;border:none;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:500;cursor:pointer;transition:all .2s;color:var(--text-muted);background:transparent}
.tgl-btn.on{background:var(--primary);color:#fff;box-shadow:0 4px 12px rgba(99,102,241,0.2)}

.actions{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.act{display:flex;flex-direction:column;align-items:center;gap:8px;background:#ffffff;border-radius:16px;padding:14px 6px;border:1px solid var(--border);cursor:pointer;transition:all .2s}
.act:hover{background:#f8fafc;border-color:var(--primary);transform:translateY(-2px)}
.act-ico{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:19px}
.act-lbl{font-size:10.5px;font-weight:500;color:var(--text-muted);text-align:center;line-height:1.3}

.txn{display:flex;align-items:center;gap:13px;padding:13px 0;border-bottom:1px solid var(--border)}
.txn:last-child{border-bottom:none}
.txn-av{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff;flex-shrink:0}
.amt-cr{font-size:15px;font-weight:700;color:#10b981}
.amt-dr{font-size:15px;font-weight:700;color:#ef4444}
.chip{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700}
.chip-ok{background:rgba(16,185,129,0.1);color:#10b981}
.chip-fail{background:rgba(239,68,68,0.1);color:#ef4444}

.result{display:flex;flex-direction:column;align-items:center;padding:48px 24px 24px;text-align:center;animation:fadeup .4s ease}
.result-ico{font-size:72px;margin-bottom:16px;animation:pop .5s ease}
.profile-av{width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:26px;font-weight:700;color:#fff;margin:0 auto 10px}
.info-row{display:flex;justify-content:space-between;align-items:flex-start;padding:13px 0;border-bottom:1px solid var(--border)}
.info-row:last-child{border-bottom:none}
.info-key{font-size:12px;color:var(--text-muted);flex-shrink:0}
.info-val{font-size:13px;font-weight:500;color:var(--text);max-width:58%;text-align:right;word-break:break-all}
.otp-box{background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.1);border-radius:13px;padding:14px;text-align:center;margin:10px 0 4px}
.demo{background:#f8fafc;border:1px solid var(--border);border-radius:11px;padding:11px 14px;font-size:12px;color:var(--text-muted);line-height:1.8;margin-bottom:14px}
.demo strong{color:var(--primary)}
.back{position:absolute;top:50px;left:18px;width:36px;height:36px;background:#f1f5f9;border:none;border-radius:50%;color:var(--text);font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:20}

@keyframes pulse{0%,100%{transform:scale(1);box-shadow:0 0 30px rgba(99,102,241,0.3)}50%{transform:scale(1.04);box-shadow:0 0 50px rgba(99,102,241,0.5)}}
@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.6}40%{transform:translateY(-12px);opacity:1}}
@keyframes fadeup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{0%{transform:scale(0)}70%{transform:scale(1.08)}100%{transform:scale(1)}}
`;

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [token,  setToken]  = useState(localStorage.getItem('token'));
  const [txns,   setTxns]   = useState([]);
  const [me,     setMe]     = useState(null);
  const [screen, setScreen] = useState("splash");
  const [toast,  setToast]  = useState(null);
  const [tab,    setTab]    = useState("home");
  const [loading, setLoading]= useState(false);

  // Auth state
  const [loginVal,  setLoginVal]  = useState("");
  const [loginMode, setLoginMode] = useState("mobile");
  const [otpInfo, setOtpInfo] = useState(null);
  const [otpIn,   setOtpIn]   = useState("");
  const [emailIn, setEmailIn] = useState("");
  const [isNew,   setIsNew]   = useState(false);
  const [confirmResult, setConfirmResult] = useState(null); // Firebase phone result

  // Registration state
  const [reg, setReg] = useState({ mobile:"", email:"", name:"", address:"", dob:"" });

  // PIN state
  const [pin,     setPin]     = useState("");
  const [pinStep, setPinStep] = useState("set");
  const [pinTemp, setPinTemp] = useState("");

  // Transfer state
  const [xMode, setXMode] = useState("mobile");
  const [xForm, setXForm] = useState({ target:"", ifsc:"", amount:"" });
  const [xPin,  setXPin]  = useState("");
  const [xStep, setXStep] = useState("form");
  const [xResult, setXResult] = useState(null);
  const [lookupName, setLookupName] = useState("");

  // Balance state
  const [bPin,  setBPin]  = useState("");
  const [bShow, setBShow] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  const notify = (msg, type = "info") => {
    setToast({ msg: String(msg), type }); // Ensure msg is string
    setTimeout(() => setToast(null), 4000);
  };

  const setupRecaptcha = () => {
    // SMS OTP functionality Removed
  };

  const loadData = async (tok) => {
    try {
      setLoading(true);
      const userRes = await apiFetch("/users/me", "GET", null, tok);
      setMe(userRes.data);
      const txRes = await apiFetch("/transactions/history", "GET", null, tok);
      setTxns(txRes.data || []);
      setScreen("dash");
      setTab("home");
    } catch (err) {
      console.error(err);
      notify(err.message || 'Session expired', 'error');
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    setTimeout(() => {
      if (token) loadData(token);
      else setScreen("auth");
    }, 2200); 
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setMe(null);
    setScreen("auth");
    notify("Logged out successfully","success");
  };

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const doLogin = async () => {
    if (!loginVal.trim()) return notify("Enter mobile or account number", "error");
    if (loginMode === "mobile" && !/^\d{10}$/.test(loginVal)) return notify("Enter valid 10-digit mobile number", "error");
    
    try {
      setLoading(true);
      await apiFetch("/auth/login/init", "POST", { loginVal, loginMode });
      setIsNew(false); setEmailIn("");
      setScreen("otp");
      notify(`OTP sent successfully! Check your email.`, "success");
    } catch (err) {
      notify(err.message || 'Verification Error', "error");
      if(err.message && err.message.includes('not found')) setTimeout(() => setScreen("register"), 1500);
    } finally {
      setLoading(false);
    }
  };

  const doOtp = async () => {
    if (!emailIn) return notify("Enter verification code", "error");
    
    try {
      setLoading(true);
      if (isNew) {
        setPin(""); setPinStep("set"); setScreen("pin");
      } else {
        const res = await apiFetch("/auth/login/verify", "POST", { loginVal, loginMode, emailIn });
        localStorage.setItem('token', res.token);
        setToken(res.token);
        notify(`Welcome back! 👋`, "success");
        await loadData(res.token);
      }
    } catch (err) {
      notify(err.message || 'Incorrect verification code', "error");
    } finally {
      setLoading(false);
    }
  };

  const doRegister = async () => {
    const { mobile, email, name } = reg;
    if (!mobile || !email || !name) return notify("Fill all required fields", "error");
    if (!/^\d{10}$/.test(mobile)) return notify("Valid 10-digit mobile required", "error");
    if (!/\S+@\S+\.\S+/.test(email)) return notify("Valid email address required", "error");
    
    try {
      setLoading(true);
      await apiFetch("/auth/register/init", "POST", { mobile, email, name });
      setIsNew(true); setEmailIn(""); setScreen("otp");
      notify(`Code sent successfully! Check your email.`, "success");
    } catch (err) {
      notify(err.message || 'Registration error', "error");
    } finally {
      setLoading(false);
    }
  };

  const doPin = async () => {
    if (!/^\d{6}$/.test(pin)) return notify("PIN must be exactly 6 digits", "error");
    
    if (pinStep === "set") { setPinTemp(pin); setPin(""); setPinStep("confirm"); }
    else {
      if (pin !== pinTemp) { notify("PINs do not match. Try again.", "error"); setPin(""); setPinStep("set"); return; }
      
      try {
        setLoading(true);
        if (isNew) {
          const payload = { ...reg, emailIn, pin };
          const res = await apiFetch("/auth/register/verify", "POST", payload);
          localStorage.setItem('token', res.token);
          setToken(res.token);
          notify(`Welcome! 🎉 Account created successfully!`, "success");
          await loadData(res.token);
        } else {
          // Change PIN for existing user
          await apiFetch("/users/change-pin", "PUT", { newPin: pin }, token);
          setScreen("dash"); 
          notify("UPI PIN updated successfully!", "success");
        }
      } catch (err) {
        notify(err.message, "error");
        if(isNew) { setPin(""); setPinStep("set"); }
      } finally {
        setLoading(false);
        setPin(""); setPinStep("set");
      }
    }
  };

  const addKey = (k, cur, setter) => {
    if (k === "⌫") setter(cur.slice(0,-1));
    else if (cur.length < 6) setter(cur + k);
  };

  const resetX = () => { setXForm({ target:"", ifsc:"", amount:"" }); setXPin(""); setXStep("form"); setXResult(null); };

  const doTransfer = async () => {
    if (xStep === "form") {
      if (xMode === "mobile") { if (!/^\d{10}$/.test(xForm.target)) return notify("Valid 10-digit mobile required", "error"); }
      if (!xForm.amount || isNaN(xForm.amount) || +xForm.amount <= 0) return notify("Enter valid amount", "error");
      if (+xForm.amount > 100000) return notify("Daily limit: ₹1,00,000 per transaction", "error");
      setXStep("pin"); return;
    }
    
    if (xStep === "pin") {
      try {
        setLoading(true);
        const ref = "REF" + Math.random().toString(36).slice(2,11).toUpperCase(); // Optimistic payload ref
        
        const payload = {
          targetType: xMode,
          target: xForm.target,
          targetIfsc: xForm.ifsc,
          amount: xForm.amount,
          pin: xPin
        };

        const res = await apiFetch("/transactions/transfer", "POST", payload, token);
        
        // Success
        setMe(p => ({ ...p, balance: p.balance - xForm.amount }));
        setTxns(p => [res.txn, ...p]);
        setXResult({ ok:true, txn: res.txn }); 
      } catch (err) {
        // Fail
        setXResult({ ok:false, msg: err.message, txn: { amount: xForm.amount, receiverName: xForm.target, method: xMode, ref: "FAILED" } });
      } finally {
        setLoading(false);
        setXStep("done");
      }
    }
  };

  const myTxns = txns;

  useEffect(() => {
    if (screen !== "transfer" || !token) return;
    const { target, ifsc } = xForm;
    if (!target) { setLookupName(""); return; }
    if (xMode === "mobile" && target.length < 10) { setLookupName(""); return; }
    if (xMode === "upi" && !target.includes("@")) { setLookupName(""); return; }
    if (xMode === "bank" && target.length < 8) { setLookupName(""); return; }

    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch(`/users/lookup?type=${xMode}&val=${target}&ifsc=${ifsc}`, "GET", null, token);
        if (res.success) setLookupName(res.name);
        else setLookupName("");
      } catch {
        setLookupName("");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [xForm.target, xForm.ifsc, xMode, screen, token]);

  // ─── Toast helper ────────────────────────────────────────────────────────────
  const Toast = () => toast ? (
    <div className={`toast t-${toast.type==="success"?"ok":toast.type==="error"?"err":"info"}`}>
      <span>{toast.type==="success"?"✅":toast.type==="error"?"❌":"ℹ️"}</span>
      <span>{toast.msg}</span>
    </div>
  ) : null;

  // ─── Loader ────────────────────────────────────────────────────────────────
  const LoaderOverlay = () => loading ? (
    <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
       <div className="dot" style={{background:"var(--primary)",marginBottom:10,animation:"pulse 1s infinite"}}/>
       <div style={{color:"#fff",fontSize:13,fontFamily:"Syne,sans-serif",fontWeight:600}}>Processing...</div>
    </div>
  ) : null;

  // ─── PIN Keypad ───────────────────────────────────────────────────────────────
  const PinPad = ({ value, setter, onSubmit, submitLabel }) => (
    <>
      <div className="pin-dots">
        {[0,1,2,3,4,5].map(i => <div key={i} className={`pdot${value.length>i?" on":""}`}/>)}
      </div>
      <div className="keypad">
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k,i) => (
          <button key={i} className={`key${!k?" empty":k==="⌫"?" del":""}`} onClick={()=>k&&addKey(k,value,setter)}>{k}</button>
        ))}
      </div>
      {value.length===6 && <div style={{padding:"20px 24px 0"}}><button className="btn btn-p" onClick={onSubmit}>{submitLabel}</button></div>}
    </>
  );

  // ─── Screens ──────────────────────────────────────────────────────────────────

  // SPLASH
  if (screen === "splash") return (
    <div className="app"><style>{CSS}</style>
      <div className="phone">
        <div className="screen splash">
          <div className="sp-logo">💸</div>
          <div className="sp-title">PayFlow</div>
          <div className="sp-sub">Secure · Fast · Simple</div>
          <div className="dots"><div className="dot"/><div className="dot"/><div className="dot"/></div>
        </div>
      </div>
    </div>
  );

  // AUTH
  if (screen === "auth") return (
    <div className="app"><style>{CSS}</style>
      <div className="phone">
        <LoaderOverlay />
        <div className="screen" style={{padding:"0 22px 30px"}}>
          <div style={{height:72}}/>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{width:58,height:58,background:"linear-gradient(135deg,var(--primary),var(--secondary))",borderRadius:18,margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 10px 20px rgba(99,102,241,.2)"}}>💸</div>
            <div style={{fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:"var(--text)",letterSpacing:"-1px"}}>PayFlow</div>
            <div style={{fontSize:13,color:"var(--text-muted)",marginTop:4}}>India's simplest UPI app</div>
          </div>

          <div style={{display:"flex",gap:10,marginBottom:24}}>
            {[
              {ico:"🛡️",txt:"Encrypted"},
              {ico:"⚡",txt:"Real-time"},
              {ico:"🔒",txt:"Secure"}
            ].map((f,i)=>(
              <div key={i} style={{flex:1,background:"#f8fafc",border:"1.5px solid var(--border)",borderRadius:16,padding:"10px 4px",textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:4}}>{f.ico}</div>
                <div style={{fontSize:10,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:.5}}>{f.txt}</div>
              </div>
            ))}
          </div>

          <div className="toggle">
            <button className={`tgl-btn${loginMode==="mobile"?" on":""}`} onClick={()=>setLoginMode("mobile")}>📱 Mobile No.</button>
            <button className={`tgl-btn${loginMode==="account"?" on":""}`} onClick={()=>setLoginMode("account")}>🏦 Account No.</button>
          </div>

          <div className="grp">
            <label className="lbl">{loginMode==="mobile"?"Mobile Number":"Bank Account Number"}</label>
            <input className="inp" placeholder={loginMode==="mobile"?"Enter 10-digit mobile":"Enter account number"}
              value={loginVal} onChange={e=>setLoginVal(e.target.value)} maxLength={loginMode==="mobile"?10:20} inputMode="numeric"/>
          </div>

          <button className="btn btn-p mt8" onClick={doLogin}>Continue →</button>
          <button className="btn btn-g mt8" onClick={()=>{setReg({mobile:"",email:"",name:"",address:"",dob:""});setScreen("register");}}>New user? Register here</button>
          <div id="recaptcha-container"></div>
        </div>
        <Toast/>
      </div>
    </div>
  );

  // OTP VERIFICATION
  if (screen === "otp") return (
    <div className="app"><style>{CSS}</style>
      <div className="phone">
        <LoaderOverlay />
        <button className="back" onClick={()=>setScreen(isNew?"register":"auth")}>←</button>
        <div className="screen" style={{padding:"90px 22px 30px"}}>
          <div style={{marginBottom:24}}>
            <div style={{fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:700,color:"var(--text)",marginBottom:4}}>Verify Identity</div>
            <div style={{fontSize:13,color:"var(--text-muted)"}}>Enter the OTP sent to your email</div>
          </div>
          
          <div className="grp" style={{marginTop:30}}>
            <label className="lbl">Verification Code (6 digits)</label>
            <input className="inp" placeholder="Enter 6-digit code" value={emailIn} onChange={e=>setEmailIn(e.target.value)} maxLength={6} inputMode="numeric"
              style={{textAlign:"center",fontSize:20,letterSpacing:8,fontWeight:700}}/>
          </div>
          <button className="btn btn-p mt16" onClick={doOtp}>Verify & Continue →</button>
          <button className="btn btn-g mt8" onClick={()=>{isNew ? doRegister() : doLogin()}}>Resend OTP</button>
        </div>
        <Toast/>
      </div>
    </div>
  );

  // REGISTER
  if (screen === "register") return (
    <div className="app"><style>{CSS}</style>
      <div className="phone">
        <LoaderOverlay />
        <button className="back" onClick={()=>setScreen("auth")}>←</button>
        <div className="screen" style={{padding:"90px 22px 30px"}}>
          <div style={{marginBottom:22}}>
            <div style={{fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:700,color:"var(--text)",marginBottom:4}}>Create Account</div>
            <div style={{fontSize:13,color:"var(--text-muted)"}}>Join PayFlow in seconds</div>
          </div>
          {[
            ["name","Full Name *","Enter full name","text"],
            ["mobile","Mobile Number *","10-digit number","numeric"],
            ["email","Email Address *","Email address","email"],
          ].map(([f,lb,ph,mode]) => (
            <div className="grp" key={f}>
              <label className="lbl">{lb}</label>
              <input className="inp" placeholder={ph} value={reg[f]} onChange={e=>setReg(p=>({...p,[f]:e.target.value}))} inputMode={mode} type={f==="email"?"email":"text"}/>
            </div>
          ))}
          <div className="grp">
            <label className="lbl">Address (Optional)</label>
            <input className="inp" placeholder="Your city / address" value={reg.address} onChange={e=>setReg(p=>({...p,address:e.target.value}))}/>
          </div>
          <div className="grp">
            <label className="lbl">Date of Birth (Optional)</label>
            <input className="inp" type="date" value={reg.dob} onChange={e=>setReg(p=>({...p,dob:e.target.value}))} style={{colorScheme:"dark"}}/>
          </div>
          <button className="btn btn-p mt8" onClick={doRegister}>Register & Verify →</button>
          <button className="btn btn-g mt8" onClick={()=>setScreen("auth")}>Already have an account? Login</button>
        </div>
        <Toast/>
      </div>
    </div>
  );

  // PIN SETUP
  if (screen === "pin") return (
    <div className="app"><style>{CSS}</style>
      <div className="phone">
        <LoaderOverlay />
        <div className="screen" style={{padding:"60px 0 30px"}}>
          <div style={{textAlign:"center",padding:"0 22px 28px"}}>
            <div style={{fontSize:40,marginBottom:12}}>{pinStep==="set"?"🔐":"🔒"}</div>
            <div style={{fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:700,color:"var(--text)",marginBottom:6}}>
              {pinStep==="set"?"Set UPI PIN":"Confirm UPI PIN"}
            </div>
            <div style={{fontSize:13,color:"var(--text-muted)"}}>
              {pinStep==="set"?"Choose a secure 6-digit PIN":"Re-enter your PIN to confirm"}
            </div>
          </div>
          <PinPad value={pin} setter={setPin} onSubmit={doPin} submitLabel={pinStep==="set"?"Continue →":"Set PIN ✓"}/>
          <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"rgba(255,255,255,.2)",padding:"0 22px"}}>
            Never share your UPI PIN with anyone, not even PayFlow staff
          </div>
        </div>
        <Toast/>
      </div>
    </div>
  );

  // Guard: need me for all screens below
  if (!me) return null; // Let the useEffect handle the screen redirect

  // TRANSFER
  if (screen === "transfer") return (
    <div className="app"><style>{CSS}</style>
      <div className="phone">
        <LoaderOverlay />
        <button className="back" onClick={()=>{resetX();setScreen("dash");}}>←</button>
        <div className="screen" style={{padding:"90px 22px 30px"}}>

          {xStep === "form" && (
            <>
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:700,color:"#fff",marginBottom:4}}>Send Money</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.4)"}}>Fast & secure UPI transfer</div>
              </div>
              <div className="toggle">
                {[["mobile","📱 Mobile"],["bank","🏦 Bank"],["upi","@ UPI ID"]].map(([m,l]) => (
                  <button key={m} className={`tgl-btn${xMode===m?" on":""}`}
                    onClick={()=>{setXMode(m);setXForm({target:"",ifsc:"",amount:""})}}>
                    {l}
                  </button>
                ))}
              </div>

              {xMode==="mobile" && <div className="grp">
                <label className="lbl">Recipient Mobile Number</label>
                <input className="inp" placeholder="Enter 10-digit mobile" value={xForm.target}
                  onChange={e=>setXForm(p=>({...p,target:e.target.value}))} maxLength={10} inputMode="numeric"/>
                {lookupName && <div style={{fontSize:12,color:"var(--primary)",marginTop:6,fontWeight:600,paddingLeft:4}}>Paying to: {lookupName}</div>}
              </div>}

              {xMode==="bank" && <>
                <div className="grp">
                  <label className="lbl">Bank Account Number</label>
                  <input className="inp" placeholder="Account number" value={xForm.target}
                    onChange={e=>setXForm(p=>({...p,target:e.target.value}))}/>
                  {lookupName && <div style={{fontSize:12,color:"var(--primary)",marginTop:6,fontWeight:600,paddingLeft:4}}>Paying to: {lookupName}</div>}
                </div>
                <div className="grp">
                  <label className="lbl">IFSC Code</label>
                  <input className="inp" placeholder="e.g. PYFL0123456" value={xForm.ifsc}
                    onChange={e=>setXForm(p=>({...p,ifsc:e.target.value.toUpperCase()}))}/>
                </div>
              </>}

              {xMode==="upi" && <div className="grp">
                <label className="lbl">UPI ID</label>
                <input className="inp" placeholder="name@payflow" value={xForm.target}
                  onChange={e=>setXForm(p=>({...p,target:e.target.value.toLowerCase()}))}/>
                {lookupName && <div style={{fontSize:12,color:"var(--primary)",marginTop:6,fontWeight:600,paddingLeft:4}}>Paying to: {lookupName}</div>}
              </div>}

              <div className="grp">
                <label className="lbl">Amount (₹)</label>
                <input className="inp" placeholder="0.00" value={xForm.amount}
                  onChange={e=>setXForm(p=>({...p,amount:e.target.value}))} inputMode="decimal"
                  style={{fontSize:22,fontFamily:"Syne,sans-serif",fontWeight:700}}/>
              </div>

              <div style={{background:"#f8fafc",border:"1px solid var(--border)",borderRadius:14,padding:"14px",fontSize:12,color:"var(--text-muted)",lineHeight:1.6,marginBottom:18,display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:16}}>🛡️</span>
                <span><strong>Security Tip:</strong> Always verify the recipient's name before completing the payment to ensure it reaches the correct person.</span>
              </div>
              <button className="btn btn-p" onClick={doTransfer}>Continue →</button>
            </>
          )}

          {xStep === "pin" && (
            <>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{fontSize:36,marginBottom:10}}>🔐</div>
                <div style={{fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:700,color:"var(--text)",marginBottom:4}}>Enter UPI PIN</div>
                <div style={{fontSize:13,color:"var(--text-muted)"}}>Sending {rupee(xForm.amount)} to {xForm.target}</div>
                <div style={{fontSize:12,color:"var(--text-muted)",opacity:0.6,marginTop:4}}>Balance: {rupee(me.balance)}</div>
              </div>
              <PinPad value={xPin} setter={setXPin} onSubmit={doTransfer} submitLabel="Pay Now 💸"/>
              <div style={{textAlign:"center",marginTop:10}}>
                <button className="btn btn-g" onClick={()=>{setXPin("");setXStep("form");}}>← Change Details</button>
              </div>
            </>
          )}

          {xStep === "done" && xResult && (
            <div className="result">
              <div className="result-ico">{xResult.ok?"✅":"❌"}</div>
              <div style={{fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:700,color:"var(--text)",marginBottom:8}}>
                {xResult.ok?"Payment Successful!":"Payment Failed"}
              </div>
              {xResult.ok ? <>
                <div style={{fontSize:30,fontWeight:800,fontFamily:"Syne,sans-serif",color:"#10b981",marginBottom:4}}>{rupee(xResult.txn.amount)}</div>
                <div style={{fontSize:14,color:"var(--text-muted)",marginBottom:4}}>to {xResult.txn.receiverName}</div>
                <div style={{fontSize:12,color:"var(--text-muted)",opacity:0.7,marginBottom:8}}>via {xResult.txn.method.toUpperCase()}</div>
                <div style={{background:"#f8fafc",border:"1px solid var(--border)",borderRadius:12,padding:"10px 16px",marginBottom:24,fontSize:12,color:"var(--text-muted)"}}>
                  Ref: {xResult.txn.reference_id}
                </div>
              </> : <>
                <div style={{fontSize:14,color:"rgba(255,255,255,.5)",marginBottom:24,maxWidth:260,lineHeight:1.5}}>{xResult.msg}</div>
              </>}
              <button className="btn btn-p" style={{width:"100%"}} onClick={()=>{resetX();setScreen("dash");}}>Back to Home</button>
              {xResult.ok && <button className="btn btn-s mt8" onClick={resetX}>Send Another Payment</button>}
            </div>
          )}
        </div>
        <Toast/>
      </div>
    </div>
  );

  // CHECK BALANCE
  if (screen === "balance") return (
    <div className="app"><style>{CSS}</style>
      <div className="phone">
        <LoaderOverlay />
        <button className="back" onClick={()=>{setBPin("");setBShow(false);setScreen("dash");}}>←</button>
        <div className="screen" style={{padding:"90px 22px 30px"}}>
          {!bShow ? <>
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{fontSize:44,marginBottom:10}}>💰</div>
              <div style={{fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:700,color:"var(--text)",marginBottom:4}}>Check Balance</div>
              <div style={{fontSize:13,color:"var(--text-muted)"}}>Enter UPI PIN to view balance</div>
            </div>
            <PinPad
              value={bPin}
              setter={setBPin}
              onSubmit={async ()=>{
                try {
                  setLoading(true);
                  const res = await apiFetch("/users/balance", "POST", { pin: bPin }, token);
                  setMe(p => ({ ...p, balance: res.balance }));
                  setBShow(true); notify("Balance revealed ✓", "success");
                } catch (err) {
                  notify(err.message, "error"); setBPin("");
                } finally {
                  setLoading(false);
                }
              }}
              submitLabel="View Balance 👁"
            />
          </> : (
            <div className="result">
              <div style={{fontSize:48,marginBottom:12}}>💳</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Available Balance</div>
              <div style={{fontFamily:"Syne,sans-serif",fontSize:38,fontWeight:800,color:"#00d4aa",letterSpacing:"-1.5px",marginBottom:8}}>{rupee(me.balance)}</div>
              <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:28,alignItems:"center"}}>
                <div style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>{me.account_number}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>{me.ifsc_code}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:4}}>{me.upi_id}</div>
              </div>
              <button className="btn btn-p" style={{width:"100%"}} onClick={()=>{setBPin("");setBShow(false);setScreen("dash");}}>Back to Home</button>
            </div>
          )}
        </div>
        <Toast/>
      </div>
    </div>
  );

  // ─── DASHBOARD ───────────────────────────────────────────────────────────────
  const Home = () => (
    <div style={{padding:"0 18px 16px",animation:"fadeup .4s ease"}}>
      {/* Greeting row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"50px 4px 18px"}}>
        <div>
          <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:3,fontWeight:500}}>
            {new Date().getHours()<12?"Good morning":"Good evening"},
          </div>
          <div style={{fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:700,color:"var(--text)",letterSpacing:"-.5px"}}>
            {me.full_name?.split(" ")[0] || "User"} 👋
          </div>
        </div>
        <div onClick={()=>setTab("profile")} style={{width:40,height:40,borderRadius:"50%",background:avaColor(me.full_name||"U"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#fff",cursor:"pointer",boxShadow:"0 0 0 2px rgba(139,92,246,.4)"}}>
          {initials(me.full_name||"Us")}
        </div>
      </div>

      {/* Balance card */}
      <div className="bal-card">
        <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",marginBottom:6,position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>💳 PayFlow Account</span>
          <button onClick={()=>setShowBalance(!showBalance)} style={{background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:16,padding:0}}>
            {showBalance ? "👁️" : "🙈"}
          </button>
        </div>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>Total Balance</div>
          <div style={{fontFamily:"Syne,sans-serif",fontSize:30,fontWeight:800,color:"#fff",letterSpacing:"-1px"}}>
            {showBalance ? rupee(me.balance || 0) : "••••••••"}
          </div>
        </div>
        <div style={{marginTop:14,position:"relative",zIndex:1,display:"flex",gap:12,flexWrap:"wrap"}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.8)"}}>UPI &nbsp;<span style={{color:"#fff",fontWeight:600}}>{me.upi_id}</span></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{marginBottom:18}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--text-muted)",marginBottom:11,textTransform:"uppercase",letterSpacing:1}}>Quick Actions</div>
        <div className="actions">
          {[
            { ico:"📱", lbl:"To\nMobile",  bg:"rgba(99,102,241,.15)", col:"#818cf8", fn:()=>{setXMode("mobile");resetX();setScreen("transfer");} },
            { ico:"🏦", lbl:"To\nBank",    bg:"rgba(8,145,178,.15)",  col:"#22d3ee", fn:()=>{setXMode("bank");resetX();setScreen("transfer");} },
            { ico:"@",  lbl:"To\nUPI ID",  bg:"rgba(5,150,105,.15)",  col:"#34d399", fn:()=>{setXMode("upi");resetX();setScreen("transfer");}, mono:true },
            { ico:"👁", lbl:"Check\nBal.", bg:"rgba(245,158,11,.15)", col:"#fbbf24", fn:()=>{setBPin("");setBShow(false);setScreen("balance");} },
          ].map((a,i) => (
            <div key={i} className="act" onClick={a.fn}>
              <div className="act-ico" style={{background:a.bg,color:a.col,fontFamily:a.mono?"monospace,serif":undefined,fontWeight:a.mono?900:undefined,fontSize:a.mono?22:19}}>{a.ico}</div>
              <div className="act-lbl">{a.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:1}}>Recent</div>
          {myTxns.length > 4 && <button className="btn btn-g" style={{padding:"4px 8px",fontSize:11,width:"auto"}} onClick={()=>setTab("history")}>See all</button>}
        </div>
        <div className="card">
          {myTxns.length === 0 ? (
            <div style={{textAlign:"center",padding:"24px",color:"rgba(255,255,255,.2)",fontSize:13}}>
              <div style={{fontSize:36,marginBottom:8}}>📭</div>No transactions yet
            </div>
          ) : myTxns.slice(0,5).map(t => {
            const sent = t.sender_id === me.id;
            const other = sent ? t.receiver_name : t.sender_name;
            return (
              <div key={t.id} className="txn">
                <div className="txn-av" style={{background:avaColor(other||"U")}}>{initials(other||"Un")}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:500,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{other||"Unknown"}</div>
                  <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2,display:"flex",gap:6,alignItems:"center"}}>
                    {stamp(t.created_at)} <span className={`chip chip-${t.status==="SUCCESS"?"ok":"fail"}`}>{t.status}</span>
                  </div>
                </div>
                <div className={sent?"amt-dr":"amt-cr"}>{sent?"-":"+"}{rupee(t.amount)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const History = () => (
    <div style={{padding:"50px 18px 16px",animation:"fadeup .4s ease"}}>
      <div style={{marginBottom:18}}>
        <div style={{fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:700,color:"var(--text)",marginBottom:3}}>Transactions</div>
        <div style={{fontSize:13,color:"var(--text-muted)"}}>All payment history</div>
      </div>
      <div className="card">
        {myTxns.length === 0 ? (
          <div style={{textAlign:"center",padding:"36px",color:"rgba(255,255,255,.2)"}}>
            <div style={{fontSize:40,marginBottom:10}}>📭</div>No transactions yet
          </div>
        ) : myTxns.map(t => {
          const sent = t.sender_id === me.id;
          const other = sent ? t.receiver_name : t.sender_name;
          return (
            <div key={t.id} className="txn">
              <div className="txn-av" style={{background:avaColor(other||"U")}}>{initials(other||"Un")}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:500,color:"#fff"}}>{sent?"↑ ":"↓ "}{other||"Unknown"}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>{stamp(t.created_at)}</div>
                <div style={{marginTop:4,display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                  <span className={`chip chip-${t.status==="SUCCESS"?"ok":"fail"}`}>{t.status}</span>
                  <span style={{fontSize:10,color:"rgba(255,255,255,.2)"}}>{t.reference_id}</span>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div className={sent?"amt-dr":"amt-cr"}>{sent?"-":"+"}{rupee(t.amount)}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.25)",marginTop:2,textTransform:"capitalize"}}>{t.method}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const Profile = () => (
    <div style={{padding:"50px 18px 16px",animation:"fadeup .4s ease"}}>
      <div style={{textAlign:"center",marginBottom:22}}>
        <div className="profile-av" style={{background:avaColor(me.full_name||"U")}}>{initials(me.full_name||"Us")}</div>
        <div style={{fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:700,color:"var(--text)"}}>{me.full_name}</div>
        <div style={{fontSize:12,color:"var(--text-muted)",marginTop:4}}>{me.upi_id}</div>
        <div style={{marginTop:8,display:"inline-flex",alignItems:"center",gap:6,background:"rgba(0,212,170,.1)",borderRadius:20,padding:"4px 12px"}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"#00d4aa",display:"inline-block"}}/>
          <span style={{fontSize:12,color:"#00d4aa",fontWeight:500}}>Verified Account</span>
        </div>
      </div>

      <div className="card" style={{marginBottom:12}}>
        {[
          ["Full Name",      me.full_name],
          ["Mobile",         me.mobile],
          ["Email",          me.email],
          ["Account No.",    me.account_number],
          ["IFSC Code",      me.ifsc_code],
          ["UPI ID",         me.upi_id],
          ["Balance",        rupee(me.balance)],
          ["Address",        me.address||"—"],
        ].map(([k,v]) => (
          v ?
          <div key={k} className="info-row">
            <div className="info-key">{k}</div>
            <div className="info-val">{v}</div>
          </div>
          : null
        ))}
      </div>

      <button className="btn btn-s mt8" onClick={()=>{setIsNew(false);setPin("");setPinStep("set");setScreen("pin");}}>
        🔐 Change UPI PIN
      </button>
      <button className="btn btn-s mt8" style={{color:"#ff4757",borderColor:"rgba(255,71,87,.2)"}}
        onClick={handleLogout}>
        🚪 Logout
      </button>
    </div>
  );

  return (
    <div className="app"><style>{CSS}</style>
      <div className="phone">
        <LoaderOverlay />
        <div className="screen">
          {tab === "home"    && <Home/>}
          {tab === "history" && <History/>}
          {tab === "profile" && <Profile/>}
        </div>
        <div className="nav">
          {[["🏠","Home","home"],["📋","History","history"],["👤","Profile","profile"]].map(([ic,lb,id])=>(
            <button key={id} className={`nav-item${tab===id?" on":""}`} onClick={()=>setTab(id)}>
              <div className="nav-icon">{ic}</div>
              <div className="nav-lbl">{lb}</div>
            </button>
          ))}
        </div>
        <Toast/>
      </div>
    </div>
  );
}
