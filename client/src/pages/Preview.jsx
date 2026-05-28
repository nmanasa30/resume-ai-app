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
  const [toast, setToast]     = useState({ msg: "", type: "" });

  const UPI_ID = "9032613079@axl";
  const AMOUNT = "1";
  const NAME   = "Resume AI";

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
      showToast("PDF downloaded!");
    } catch {
      showToast("PDF generation failed.", "error");
    }
  };

  const openUPIPayment = () => {
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(NAME)}&am=${AMOUNT}&cu=INR&tn=${encodeURIComponent("Resume Download")}`;
    window.location.href = upiUrl;
    setShowPayModal(true);
  };

  const confirmPayment = () => {
    const paidResumes = JSON.parse(localStorage.getItem("paidResumes") || "[]");
    paidResumes.push(id);
    localStorage.setItem("paidResumes", JSON.stringify(paidResumes));
    setPaid(true);
    setShowPayModal(false);
    showToast("Payment confirmed! Downloading PDF…");
    setTimeout(() => downloadPDF(), 1000);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading…</div>
  );
  if (!resume) return null;

  const skillTags = resume.skills?.split(",").map((s) => s.trim()).filter(Boolean) || [];

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0" }}>
      {/* Navbar */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #E2DDD6",
        padding: "0 2rem", height: 60, display: "flex",
        alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", fontWeight: 700 }}>
          Resume Preview
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => navigate(`/builder/${id}`)} style={{
            padding: "7px 14px", border: "1.5px solid #E2DDD6", borderRadius: 7,
            background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>✏️ Edit</button>
          <button onClick={() => window.print()} style={{
            padding: "7px 14px", border: "none", borderRadius: 7,
            background: "#4A3F8C", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>🖨️ Print</button>
          <button onClick={paid ? downloadPDF : openUPIPayment} style={{
            padding: "7px 18px", border: "none", borderRadius: 7,
            background: paid ? "#2D7A4F" : "linear-gradient(135deg,#C8A96E,#E0C48A)",
            color: paid ? "#fff" : "#1A1A2E",
            cursor: "pointer", fontSize: 13, fontWeight: 700,
          }}>
            {paid ? "⬇️ Download PDF Again" : "⬇️ Download PDF — ₹1"}
          </button>
        </div>
      </nav>

      {/* Banner */}
      {!paid && (
        <div style={{
          background: "linear-gradient(135deg,#4A3F8C,#7B6EBF)", color: "#fff",
          textAlign: "center", padding: "10px", fontSize: 13,
        }}>
          💳 Pay just <strong>₹1</strong> via PhonePe, GPay, or any UPI app to download your resume PDF
        </div>
      )}
      {paid && (
        <div style={{
          background: "#D4EDDA", color: "#155724",
          textAlign: "center", padding: "10px", fontSize: 13, fontWeight: 600,
        }}>
          ✅ Payment done! Download your PDF anytime for free.
        </div>
      )}

      {/* Resume */}
      <div style={{ maxWidth: 750, margin: "2rem auto", padding: "0 1.5rem 4rem" }}>
        <div id="resume-preview" style={{
          background: "#fff", border: "1px solid #E2DDD6",
          borderRadius: 10, padding: "3rem 2.5rem",
          boxShadow: "0 4px 30px rgba(0,0,0,0.07)",
        }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", textAlign: "center", color: "#1A1A2E", marginBottom: 6 }}>
            {resume.name}
          </h1>
          <div style={{ textAlign: "center", fontSize: 12, color: "#6B6B8A", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
            {resume.email && <span>✉ {resume.email}</span>}
            {resume.phone && <span>📞 {resume.phone}</span>}
            {resume.link  && <span style={{ color: "#4A3F8C" }}>🔗 {resume.link}</span>}
          </div>
          <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#C8A96E,transparent)", margin: "0.75rem 0 1.25rem" }} />

          {resume.atsScore > 0 && (
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <span style={{
                display: "inline-block", fontSize: 12, fontWeight: 700, padding: "4px 16px", borderRadius: 20,
                background: resume.atsScore >= 70 ? "#D4EDDA" : resume.atsScore >= 45 ? "#FFF3CD" : "#F8D7DA",
                color: resume.atsScore >= 70 ? "#155724" : resume.atsScore >= 45 ? "#856404" : "#721C24",
              }}>ATS Score: {resume.atsScore}%</span>
            </div>
          )}

          {resume.summary && <Section title="Professional Summary"><p style={{ fontSize: 13, color: "#2D2D44", lineHeight: 1.7 }}>{resume.summary}</p></Section>}
          {skillTags.length > 0 && (
            <Section title="Skills">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {skillTags.map((s, i) => (
                  <span key={i} style={{ background: "#F0E0B8", color: "#7A5C1E", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 5 }}>{s}</span>
                ))}
              </div>
            </Section>
          )}
          {resume.education  && <Section title="Education"><p style={{ fontSize: 13, color: "#2D2D44", lineHeight: 1.7 }}>{resume.education}</p></Section>}
          {resume.experience && <Section title="Experience"><p style={{ fontSize: 13, color: "#2D2D44", lineHeight: 1.7 }}>{resume.experience}</p></Section>}
          {resume.projects   && <Section title="Projects"><p style={{ fontSize: 13, color: "#2D2D44", lineHeight: 1.7 }}>{resume.projects}</p></Section>}
        </div>
      </div>

      {/* UPI Payment Modal */}
      {showPayModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "2rem",
            maxWidth: 380, width: "90%", textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          }}>
            <div style={{ fontSize: 48, marginBottom: "0.5rem" }}>💸</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", color: "#1A1A2E", marginBottom: 8 }}>
              Complete Payment
            </h2>
            <p style={{ fontSize: 13, color: "#6B6B8A", marginBottom: "1.25rem" }}>
              Pay <strong>₹1</strong> to <strong>{UPI_ID}</strong> via PhonePe, GPay, or any UPI app
            </p>

            {/* QR Code using UPI */}
            <div style={{
              background: "#F7F5F0", borderRadius: 12, padding: "1rem",
              marginBottom: "1.25rem", fontSize: 13, color: "#4A3F8C",
              fontWeight: 600, border: "1px solid #E2DDD6",
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>📱</div>
              UPI ID: <strong>{UPI_ID}</strong>
              <div style={{ fontSize: 12, color: "#6B6B8A", marginTop: 4 }}>Amount: ₹1</div>
            </div>

            <p style={{ fontSize: 12, color: "#6B6B8A", marginBottom: "1.25rem" }}>
              After paying, click <strong>"I've Paid"</strong> to download your PDF
            </p>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowPayModal(false)} style={{
                flex: 1, padding: "10px", border: "1.5px solid #E2DDD6",
                borderRadius: 7, background: "transparent", cursor: "pointer",
                fontSize: 13, fontWeight: 600,
              }}>Cancel</button>
              <button onClick={confirmPayment} style={{
                flex: 1, padding: "10px", border: "none",
                borderRadius: 7, background: "#2D7A4F", color: "#fff",
                cursor: "pointer", fontSize: 13, fontWeight: 700,
              }}>✅ I've Paid!</button>
            </div>
          </div>
        </div>
      )}

      {toast.msg && (
        <div style={{
          position: "fixed", top: "1rem", right: "1rem", padding: "11px 20px",
          borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", zIndex: 9999,
          background: toast.type === "error" ? "#C0392B" : toast.type === "info" ? "#4A3F8C" : "#2D7A4F",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{
        fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 600,
        color: "#4A3F8C", textTransform: "uppercase", letterSpacing: "0.1em",
        borderBottom: "1px solid #E2DDD6", paddingBottom: 5, marginBottom: 8,
      }}>{title}</div>
      {children}
    </div>
  );
}
