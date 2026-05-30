import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getResume } from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Preview() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [resume, setResume]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid]       = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [toast, setToast]     = useState({ msg: "", type: "" });

  const UPI_ID = "9032613079@axl";
  const UPI_NAME = "N Manasa";
  const AMOUNT = "1";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  useEffect(() => {
    getResume(id)
      .then((res) => setResume(res.data))
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));

    const paidResumes = JSON.parse(localStorage.getItem("paidResumes") || "[]");
    if (paidResumes.includes(id)) setPaid(true);
  }, [id]);

  const downloadPDF = async () => {
    const element = document.getElementById("resume-preview");
    showToast("Generating PDF…", "info");
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${resume?.name || "Resume"}_Resume.pdf`);
      showToast("PDF downloaded! ✅");
    } catch {
      showToast("PDF generation failed.", "error");
    }
  };

  const verifyAndDownload = async () => {
    if (!utrNumber.trim()) {
      showToast("Please enter your UTR/Transaction ID.", "error");
      return;
    }
    if (utrNumber.trim().length < 6) {
      showToast("Please enter a valid UTR number.", "error");
      return;
    }
    setVerifying(true);

    // Save UTR to backend for verification
    try {
      const token = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_URL}/payment/utr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ utr: utrNumber, resumeId: id, amount: AMOUNT }),
      });
    } catch {}

    // Mark as paid and download
    const paidResumes = JSON.parse(localStorage.getItem("paidResumes") || "[]");
    paidResumes.push(id);
    localStorage.setItem("paidResumes", JSON.stringify(paidResumes));
    setPaid(true);
    setShowPayModal(false);
    setVerifying(false);
    showToast("Payment verified! Downloading PDF…");
    setTimeout(() => downloadPDF(), 1000);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>Loading…</div>
  );
  if (!resume) return null;

  const skillTags = resume.skills?.split(",").map((s) => s.trim()).filter(Boolean) || [];

  // QR code URL using Google Charts API
  const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${AMOUNT}&cu=INR&tn=ResumeDownload`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&bgcolor=ffffff&color=000000&qzone=2&data=${encodeURIComponent(upiString)}`;

  return (
    <div style={{ minHeight:"100vh", background:"#F7F5F0" }}>
      {/* Navbar */}
      <nav style={{ background:"#fff", borderBottom:"1px solid #E2DDD6", padding:"0 2rem", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:700 }}>Resume Preview</span>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => navigate(`/builder/${id}`)} style={{ padding:"7px 14px", border:"1.5px solid #E2DDD6", borderRadius:7, background:"transparent", cursor:"pointer", fontSize:13, fontWeight:600 }}>✏️ Edit</button>
          <button onClick={() => window.print()} style={{ padding:"7px 14px", border:"none", borderRadius:7, background:"#4A3F8C", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>🖨️ Print</button>
          <button onClick={paid ? downloadPDF : () => setShowPayModal(true)} style={{ padding:"7px 18px", border:"none", borderRadius:7, background: paid ? "#2D7A4F" : "linear-gradient(135deg,#C8A96E,#E0C48A)", color: paid ? "#fff" : "#1A1A2E", cursor:"pointer", fontSize:13, fontWeight:700 }}>
            {paid ? "⬇️ Download Again" : "⬇️ Download PDF — ₹1"}
          </button>
        </div>
      </nav>

      {!paid && (
        <div style={{ background:"linear-gradient(135deg,#4A3F8C,#7B6EBF)", color:"#fff", textAlign:"center", padding:"10px", fontSize:13 }}>
          💳 Pay just <strong>₹1</strong> via any UPI app to download your resume PDF
        </div>
      )}

      {/* Resume preview */}
      <div style={{ maxWidth:750, margin:"2rem auto", padding:"0 1.5rem 4rem" }}>
        <div id="resume-preview" style={{ background:"#fff", border:"1px solid #E2DDD6", borderRadius:10, padding:"3rem 2.5rem", boxShadow:"0 4px 30px rgba(0,0,0,0.07)" }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", textAlign:"center", color:"#1A1A2E", marginBottom:6 }}>{resume.name}</h1>
          <div style={{ textAlign:"center", fontSize:12, color:"#6B6B8A", display:"flex", justifyContent:"center", flexWrap:"wrap", gap:10, marginBottom:8 }}>
            {resume.email && <span>✉ {resume.email}</span>}
            {resume.phone && <span>📞 {resume.phone}</span>}
            {resume.link  && <span style={{ color:"#4A3F8C" }}>🔗 {resume.link}</span>}
          </div>
          <div style={{ height:2, background:"linear-gradient(90deg,transparent,#C8A96E,transparent)", margin:"0.75rem 0 1.25rem" }} />
          {resume.atsScore > 0 && (
            <div style={{ textAlign:"center", marginBottom:"1rem" }}>
              <span style={{ display:"inline-block", fontSize:12, fontWeight:700, padding:"4px 16px", borderRadius:20, background: resume.atsScore>=70?"#D4EDDA":resume.atsScore>=45?"#FFF3CD":"#F8D7DA", color: resume.atsScore>=70?"#155724":resume.atsScore>=45?"#856404":"#721C24" }}>
                ATS Score: {resume.atsScore}%
              </span>
            </div>
          )}
          {resume.summary   && <Sec title="Professional Summary">{resume.summary}</Sec>}
          {skillTags.length > 0 && (
            <div style={{ marginBottom:"1.25rem" }}>
              <SecTitle>Skills</SecTitle>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {skillTags.map((s,i) => <span key={i} style={{ background:"#F0E0B8", color:"#7A5C1E", fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:5 }}>{s}</span>)}
              </div>
            </div>
          )}
          {resume.education  && <Sec title="Education">{resume.education}</Sec>}
          {resume.experience && <Sec title="Experience">{resume.experience}</Sec>}
          {resume.projects   && <Sec title="Projects">{resume.projects}</Sec>}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:"1rem" }}>
          <div style={{ background:"#fff", borderRadius:20, padding:"2rem", maxWidth:400, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", color:"#1A1A2E", marginBottom:6 }}>Pay ₹1 to Download</h2>
            <p style={{ fontSize:13, color:"#6B6B8A", marginBottom:"1.25rem" }}>Scan QR code or use UPI ID below</p>

            {/* QR Code */}
            <div style={{ background:"#F7F5F0", borderRadius:12, padding:"1rem", marginBottom:"1rem", display:"inline-block" }}>
              <img src="/phonepe-qr.jpg" alt="PhonePe QR Code" width={200} height={200} style={{ display:"block", borderRadius:8 }} />
            </div>

            {/* UPI ID */}
            <div style={{ background:"#EAE8F5", borderRadius:10, padding:"10px 16px", marginBottom:"1.25rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:14, fontWeight:700, color:"#4A3F8C" }}>{UPI_ID}</span>
              <button onClick={() => { navigator.clipboard.writeText(UPI_ID); showToast("UPI ID copied!"); }} style={{ border:"none", background:"transparent", cursor:"pointer", fontSize:12, color:"#4A3F8C", fontWeight:600 }}>📋 Copy</button>
            </div>

            <p style={{ fontSize:12, color:"#6B6B8A", marginBottom:"0.75rem" }}>
              After paying, enter your <strong>UTR / Transaction ID</strong> below:
            </p>

            {/* Direct pay buttons */}
            <div style={{ display:"flex", gap:8, marginBottom:"1rem" }}>
              <a href={`phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${AMOUNT}&cu=INR&tn=ResumeDownload`} style={{ flex:1, padding:"10px", background:"#5f259f", color:"#fff", borderRadius:8, textDecoration:"none", fontSize:13, fontWeight:700, textAlign:"center" }}>
                📱 Open PhonePe
              </a>
              <a href={`gpay://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${AMOUNT}&cu=INR&tn=ResumeDownload`} style={{ flex:1, padding:"10px", background:"#1a73e8", color:"#fff", borderRadius:8, textDecoration:"none", fontSize:13, fontWeight:700, textAlign:"center" }}>
                💳 Open GPay
              </a>
            </div>

            {/* UTR Input */}
            <input
              className="field-input"
              placeholder="Enter UTR / Transaction ID (e.g. 123456789012)"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              style={{ marginBottom:"1rem", textAlign:"center", letterSpacing:"0.05em" }}
            />

            <p style={{ fontSize:11, color:"#6B6B8A", marginBottom:"1.25rem" }}>
              💡 Find UTR in PhonePe → History → tap transaction → UTR Number
            </p>

            <div style={{ background:"#FFF3CD", borderRadius:8, padding:"10px", marginBottom:"1rem", fontSize:12, color:"#856404" }}>
              ⚠️ Wrong UTR = no download. We verify every payment manually.
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setShowPayModal(false)} style={{ flex:1, padding:"11px", border:"1.5px solid #E2DDD6", borderRadius:8, background:"transparent", cursor:"pointer", fontSize:13, fontWeight:600 }}>Cancel</button>
              <button onClick={verifyAndDownload} disabled={verifying || utrNumber.trim().length < 6} style={{ flex:2, padding:"11px", border:"none", borderRadius:8, background: utrNumber.trim().length < 6 ? "#ccc" : "linear-gradient(135deg,#2D7A4F,#3D9A6F)", color:"#fff", cursor: utrNumber.trim().length < 6 ? "not-allowed" : "pointer", fontSize:13, fontWeight:700 }}>
                {verifying ? "Verifying…" : "✅ Verify & Download"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.msg && (
        <div style={{ position:"fixed", top:"1rem", right:"1rem", padding:"11px 20px", borderRadius:8, fontSize:13, fontWeight:600, color:"#fff", zIndex:9999, background: toast.type==="error"?"#C0392B":toast.type==="info"?"#4A3F8C":"#2D7A4F" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function SecTitle({ children }) {
  return <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, fontWeight:600, color:"#4A3F8C", textTransform:"uppercase", letterSpacing:"0.1em", borderBottom:"1px solid #E2DDD6", paddingBottom:5, marginBottom:8 }}>{children}</div>;
}

function Sec({ title, children }) {
  return (
    <div style={{ marginBottom:"1.25rem" }}>
      <SecTitle>{title}</SecTitle>
      <p style={{ fontSize:14, color:"#2D2D44", lineHeight:1.7 }}>{children}</p>
    </div>
  );
}
