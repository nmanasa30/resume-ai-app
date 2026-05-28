import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAllResumes, deleteResume } from "../services/api";

export default function Dashboard() {
  const [resumes, setResumes]   = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState({ msg: "", type: "" });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast({ msg:"", type:"" }), 3000); };

  const fetchResumes = async () => {
    try { const res = await getAllResumes(); setResumes(res.data); }
    catch (err) { if (err.response?.status === 401) navigate("/login"); else showToast("Failed to load.", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchResumes(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resume?")) return;
    try { await deleteResume(id); setResumes(p => p.filter(r => r._id !== id)); showToast("Deleted!"); }
    catch { showToast("Failed to delete.", "error"); }
  };

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); };

  const filtered = resumes.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  const atsColor = (s) => s >= 70 ? { bg:"#D4EDDA", color:"#155724" } : s >= 45 ? { bg:"#FFF3CD", color:"#856404" } : { bg:"#F8D7DA", color:"#721C24" };

  return (
    <div style={{ minHeight:"100vh", background:"var(--surface)" }}>
      <nav style={{ background:"var(--white)", borderBottom:"1px solid var(--border)", padding:"0 2rem", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"var(--shadow-sm)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:"var(--gradient)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📄</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:700, color:"var(--ink)" }}>Resume AI</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"var(--accent-light)", padding:"6px 12px", borderRadius:20 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"var(--gradient)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700 }}>{user.name?.[0]?.toUpperCase()||"U"}</div>
            <span style={{ fontSize:13, color:"var(--accent)", fontWeight:600 }}>{user.name||"User"}</span>
          </div>
          <button className="btn btn-outline" onClick={handleLogout} style={{ padding:"7px 14px" }}>Logout</button>
        </div>
      </nav>

      <div style={{ background:"linear-gradient(135deg,#1A1A2E 0%,#2D2560 50%,#4A3F8C 100%)", padding:"3rem 2rem", color:"#fff", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"rgba(200,169,110,0.08)", top:-150, right:-100 }} />
        <div style={{ maxWidth:900, margin:"0 auto", position:"relative", zIndex:1, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", marginBottom:8 }}>My Resumes ✨</h1>
            <p style={{ fontSize:14, opacity:0.75 }}>{resumes.length} resume{resumes.length!==1?"s":""} · AI-powered · Pay ₹1 to download</p>
          </div>
          <Link to="/builder"><button className="btn btn-gold" style={{ padding:"12px 24px", fontSize:14 }}>+ New Resume</button></Link>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"2rem 1.5rem" }}>
        <div style={{ position:"relative", marginBottom:"1.5rem" }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"var(--muted)" }}>🔍</span>
          <input className="field-input" placeholder="Search resumes…" value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:42, borderRadius:10 }} />
        </div>

        {resumes.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
            {[
              { label:"Total Resumes", value:resumes.length, icon:"📄" },
              { label:"Avg ATS Score", value:resumes.filter(r=>r.atsScore>0).length>0 ? Math.round(resumes.filter(r=>r.atsScore>0).reduce((a,r)=>a+r.atsScore,0)/resumes.filter(r=>r.atsScore>0).length)+"%" : "N/A", icon:"📊" },
              { label:"Last Updated", value:fmtDate(resumes[0]?.updatedAt||new Date()), icon:"🕐" },
            ].map((s,i) => (
              <div key={i} style={{ background:"var(--white)", borderRadius:12, padding:"1rem 1.25rem", border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:42, height:42, borderRadius:10, background:"var(--accent-light)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:18, fontWeight:700, color:"var(--ink)" }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.05em" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:"center", padding:"5rem", color:"var(--muted)" }}><div style={{ fontSize:40, marginBottom:"1rem" }}>⏳</div>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"5rem 2rem", background:"var(--white)", borderRadius:16, border:"2px dashed var(--border)" }}>
            <div style={{ fontSize:60, marginBottom:"1rem" }}>📝</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", color:"var(--ink)", marginBottom:8 }}>{search ? "No resumes found" : "No resumes yet"}</h3>
            <p style={{ color:"var(--muted)", marginBottom:"1.5rem", fontSize:14 }}>{search ? "Try a different search term" : "Create your first AI-powered resume!"}</p>
            {!search && <Link to="/builder"><button className="btn btn-primary" style={{ padding:"12px 28px" }}>+ Create Your First Resume</button></Link>}
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:"1rem" }}>
            {filtered.map(r => (
              <div key={r._id} style={{ background:"var(--white)", border:"1px solid var(--border)", borderRadius:16, padding:"1.5rem", transition:"all 0.2s", boxShadow:"var(--shadow-sm)" }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="var(--shadow-md)";e.currentTarget.style.transform="translateY(-3px)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="var(--shadow-sm)";e.currentTarget.style.transform="none";}}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"1rem" }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:"var(--gradient)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:"0 4px 12px rgba(74,63,140,0.3)" }}>📄</div>
                  {r.atsScore > 0 && <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:atsColor(r.atsScore).bg, color:atsColor(r.atsScore).color }}>ATS {r.atsScore}%</span>}
                </div>
                <div style={{ fontWeight:700, fontSize:15, color:"var(--ink)", marginBottom:4 }}>{r.title||`${r.name}'s Resume`}</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginBottom:4 }}>{r.email}</div>
                <div style={{ fontSize:11, color:"var(--border)", marginBottom:"1rem" }}>Updated {fmtDate(r.updatedAt)}</div>
                {r.skills && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:"1rem" }}>
                    {r.skills.split(",").slice(0,3).map((s,i)=>(
                      <span key={i} style={{ background:"var(--accent-light)", color:"var(--accent)", fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:4 }}>{s.trim()}</span>
                    ))}
                    {r.skills.split(",").length>3 && <span style={{ fontSize:10, color:"var(--muted)" }}>+{r.skills.split(",").length-3} more</span>}
                  </div>
                )}
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>navigate(`/builder/${r._id}`)} style={{ flex:1, padding:"8px 10px", fontSize:12, fontWeight:600, border:"1.5px solid var(--border)", borderRadius:8, background:"var(--white)", cursor:"pointer" }}>✏️ Edit</button>
                  <button onClick={()=>navigate(`/preview/${r._id}`)} style={{ flex:1, padding:"8px 10px", fontSize:12, fontWeight:600, border:"none", borderRadius:8, background:"var(--gradient)", color:"#fff", cursor:"pointer" }}>👁️ Preview</button>
                  <button onClick={()=>handleDelete(r._id)} style={{ padding:"8px 10px", fontSize:12, border:"none", borderRadius:8, background:"#FEF0EE", color:"var(--danger)", cursor:"pointer" }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {toast.msg && <div className={`toast toast-${toast.type} show`}>{toast.type==="success"?"✅":"⚠"} {toast.msg}</div>}
    </div>
  );
}
