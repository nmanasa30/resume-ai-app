import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createResume, updateResume, getResume } from "../services/api";

const EMPTY = { name:"", email:"", phone:"", link:"", skills:"", education:"", experience:"", projects:"", summary:"", style:"professional", atsScore:0 };

export default function ResumeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm]         = useState(EMPTY);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast]       = useState({ msg:"", type:"" });
  const [activeTab, setActiveTab] = useState("personal");

  const showToast = (msg, type="success") => { setToast({ msg, type }); setTimeout(()=>setToast({ msg:"", type:"" }), 3000); };

  useEffect(() => {
    if (id) {
      setLoading(true);
      getResume(id).then(res=>setForm(res.data)).catch(()=>{showToast("Could not load.","error");navigate("/dashboard");}).finally(()=>setLoading(false));
    }
  }, [id]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const generateAI = async () => {
    if (!form.skills && !form.experience) { showToast("Add skills or experience first.","error"); return; }
    setAiLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://resume-ai-app-5n2j.onrender.com/api/ai/summary",{
        method:"POST",
        headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${token}` },
        body: JSON.stringify({ name:form.name, skills:form.skills, education:form.education, experience:form.experience }),
      });
      const data = await res.json();
      if (data.summary) { setForm(f=>({...f, summary:data.summary})); showToast("AI summary generated!"); }
      else showToast("AI error.","error");
    } catch { showToast("AI error — check connection.","error"); }
    finally { setAiLoading(false); }
  };

  const calcATS = () => {
    const fields = [form.name,form.email,form.phone,form.skills,form.education,form.experience,form.summary];
    const filled = fields.filter(f=>f?.trim().length>2).length;
    const base = Math.round((filled/fields.length)*70);
    const skillBonus = form.skills.split(",").filter(s=>s.trim()).length>=3 ? 15 : 5;
    const expBonus = form.experience.length>50 ? 15 : 5;
    const score = Math.min(100, base+skillBonus+expBonus);
    setForm(f=>({...f, atsScore:score}));
    showToast(`ATS Score: ${score}% — ${score>=70?"Strong 💪":score>=45?"Good 👍":"Needs Work ⚠"}`, score>=70?"success":"info");
  };

  const saveResume = async () => {
    if (!form.name) { showToast("Please enter your name first.","error"); return; }
    setSaving(true);
    try {
      if (id) { await updateResume(id,form); showToast("Resume updated!"); }
      else { const res = await createResume(form); showToast("Resume saved!"); navigate(`/builder/${res.data.resume._id}`,{replace:true}); }
    } catch (err) {
      showToast(err.response?.data?.message||"Save failed.","error");
      if (err.response?.status===401) navigate("/login");
    } finally { setSaving(false); }
  };

  const skillTags = form.skills.split(",").map(s=>s.trim()).filter(Boolean);
  const tabs = [{id:"personal",label:"Personal",icon:"👤"},{id:"skills",label:"Skills",icon:"⚡"},{id:"work",label:"Work",icon:"💼"},{id:"summary",label:"Summary",icon:"✍️"}];

  if (loading) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ textAlign:"center" }}><div style={{ fontSize:40 }}>⏳</div><p style={{ color:"var(--muted)", marginTop:"1rem" }}>Loading…</p></div></div>;

  return (
    <div style={{ minHeight:"100vh", background:"var(--surface)" }}>
      <nav style={{ background:"var(--white)", borderBottom:"1px solid var(--border)", padding:"0 2rem", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"var(--shadow-sm)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:"var(--gradient)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📄</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:700, color:"var(--ink)" }}>{id?"Edit Resume":"New Resume"}</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-outline" onClick={()=>navigate("/dashboard")} style={{ padding:"7px 14px" }}>← Dashboard</button>
          {id && <button className="btn btn-outline" onClick={()=>navigate(`/preview/${id}`)} style={{ padding:"7px 14px" }}>👁️ Preview</button>}
          <button className="btn btn-gold" onClick={saveResume} disabled={saving} style={{ minWidth:130, justifyContent:"center" }}>
            {saving?"Saving…":id?"💾 Update":"💾 Save Resume"}
          </button>
        </div>
      </nav>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", maxWidth:1150, margin:"0 auto", minHeight:"calc(100vh - 64px)" }}>
        <div style={{ background:"var(--white)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", borderBottom:"1px solid var(--border)", padding:"0 1.5rem" }}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{ padding:"14px 16px", border:"none", background:"transparent", cursor:"pointer", fontSize:13, fontWeight:600, color:activeTab===t.id?"var(--accent)":"var(--muted)", borderBottom:activeTab===t.id?"2px solid var(--accent)":"2px solid transparent", transition:"all 0.2s", display:"flex", alignItems:"center", gap:6 }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding:"1.5rem", flex:1, overflowY:"auto" }}>
            {activeTab==="personal" && <>
              <div className="field-group"><label className="field-label">Full Name *</label><input className="field-input" name="name" value={form.name} onChange={handle} placeholder="Your full name" /></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div className="field-group"><label className="field-label">Email</label><input className="field-input" name="email" type="email" value={form.email} onChange={handle} placeholder="you@email.com" /></div>
                <div className="field-group"><label className="field-label">Phone</label><input className="field-input" name="phone" type="tel" value={form.phone} onChange={handle} placeholder="+91 XXXXX XXXXX" /></div>
              </div>
              <div className="field-group"><label className="field-label">LinkedIn / Portfolio</label><input className="field-input" name="link" value={form.link} onChange={handle} placeholder="linkedin.com/in/you" /></div>
              <div className="field-group"><label className="field-label">Resume Style</label>
                <select className="field-input" name="style" value={form.style} onChange={handle}>
                  <option value="professional">Professional</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </>}

            {activeTab==="skills" && <>
              <div className="field-group">
                <label className="field-label">Skills (comma-separated)</label>
                <input className="field-input" name="skills" value={form.skills} onChange={handle} placeholder="React, JavaScript, Python…" />
                {skillTags.length>0 && <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>{skillTags.map((s,i)=><span key={i} style={{ background:"var(--accent-light)", color:"var(--accent)", fontSize:12, fontWeight:600, padding:"4px 10px", borderRadius:5 }}>{s}</span>)}</div>}
              </div>
              <div className="field-group"><label className="field-label">Education</label><textarea className="field-input" name="education" value={form.education} onChange={handle} rows={3} placeholder="B.Tech CSE — CGPA 9.5, 2027" /></div>
            </>}

            {activeTab==="work" && <>
              <div className="field-group"><label className="field-label">Work Experience</label><textarea className="field-input" name="experience" value={form.experience} onChange={handle} rows={4} placeholder="Company — Role&#10;Duration&#10;• Achievement 1" /></div>
              <div className="field-group"><label className="field-label">Projects</label><textarea className="field-input" name="projects" value={form.projects} onChange={handle} rows={4} placeholder="Project Name — Tech&#10;• What it does&#10;• Live link" /></div>
            </>}

            {activeTab==="summary" && <>
              <div className="field-group"><label className="field-label">Professional Summary</label><textarea className="field-input" name="summary" value={form.summary} onChange={handle} rows={5} placeholder="Type your summary or click Generate AI Summary…" /></div>
              {aiLoading && <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--muted)", marginBottom:"1rem", padding:"10px", background:"var(--accent-light)", borderRadius:8 }}><DotPulse /> Generating…</div>}
              <button className="btn btn-primary" onClick={generateAI} disabled={aiLoading} style={{ width:"100%", justifyContent:"center", marginBottom:10 }}>✨ {aiLoading?"Generating…":"Generate AI Summary"}</button>
            </>}

            <div style={{ marginTop:"1.5rem", display:"flex", gap:8 }}>
              <button className="btn btn-success" onClick={calcATS} style={{ flex:1, justifyContent:"center" }}>📊 Calculate ATS</button>
              <button className="btn btn-gold" onClick={saveResume} disabled={saving} style={{ flex:1, justifyContent:"center" }}>{saving?"Saving…":"💾 Save"}</button>
            </div>
          </div>
        </div>

        <div style={{ padding:"1.5rem", overflowY:"auto", background:"var(--surface)" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.75rem", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#22C55E", display:"inline-block", boxShadow:"0 0 0 2px rgba(34,197,94,0.3)" }} />
            Live Preview
          </div>
          <div style={{ background:"var(--white)", border:"1px solid var(--border)", borderRadius:14, padding:"2.25rem 2rem", minHeight:600, boxShadow:"var(--shadow-md)" }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", textAlign:"center", color:"var(--ink)", textTransform:"capitalize", marginBottom:6 }}>{form.name||"Your Name"}</h1>
            <div style={{ textAlign:"center", fontSize:12, color:"var(--muted)", display:"flex", justifyContent:"center", flexWrap:"wrap", gap:12, marginBottom:12 }}>
              {form.email && <span>✉ {form.email}</span>}
              {form.phone && <span>📞 {form.phone}</span>}
              {form.link  && <span style={{ color:"var(--accent)" }}>🔗 {form.link}</span>}
            </div>
            <div style={{ height:2, background:"linear-gradient(90deg,transparent,var(--gold),transparent)", margin:"0.75rem 0" }} />
            {form.atsScore>0 && <div style={{ textAlign:"center", marginBottom:"0.75rem" }}><span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:20, background:form.atsScore>=70?"#D4EDDA":form.atsScore>=45?"#FFF3CD":"#F8D7DA", color:form.atsScore>=70?"#155724":form.atsScore>=45?"#856404":"#721C24" }}>📊 ATS: {form.atsScore}%</span></div>}
            {form.summary && <PS title="Professional Summary"><p style={{ fontSize:13, color:"var(--ink2)", lineHeight:1.7 }}>{form.summary}</p></PS>}
            {skillTags.length>0 && <PS title="Skills"><div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{skillTags.map((s,i)=><span key={i} style={{ background:"var(--gold-light)", color:"#7A5C1E", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:5 }}>{s}</span>)}</div></PS>}
            {form.education  && <PS title="Education"><p style={{ fontSize:13, color:"var(--ink2)", lineHeight:1.7 }}>{form.education}</p></PS>}
            {form.experience && <PS title="Experience"><p style={{ fontSize:13, color:"var(--ink2)", lineHeight:1.7, whiteSpace:"pre-line" }}>{form.experience}</p></PS>}
            {form.projects   && <PS title="Projects"><p style={{ fontSize:13, color:"var(--ink2)", lineHeight:1.7, whiteSpace:"pre-line" }}>{form.projects}</p></PS>}
          </div>
        </div>
      </div>

      {toast.msg && <div className={`toast toast-${toast.type} show`}>{toast.type==="success"?"✅":toast.type==="error"?"⚠":"ℹ"} {toast.msg}</div>}
    </div>
  );
}

function PS({ title, children }) {
  return (
    <div style={{ marginBottom:"1.1rem" }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:12, fontWeight:600, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.12em", borderBottom:"1px solid var(--border)", paddingBottom:5, marginBottom:7 }}>{title}</div>
      {children}
    </div>
  );
}

function DotPulse() {
  return (
    <span style={{ display:"flex", gap:3 }}>
      {[0,0.2,0.4].map((d,i)=><span key={i} style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", display:"inline-block", animation:`pulse 1.2s ${d}s ease-in-out infinite` }} />)}
      <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </span>
  );
}
