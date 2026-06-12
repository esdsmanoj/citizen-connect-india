import jsPDF from "jspdf";
import QRCode from "qrcode";

export async function generateCertificate(opts: {
  name: string;
  responseCode: string;
  date?: string;
  surveyTitle?: string;
}) {
  const { name, responseCode } = opts;
  const date = opts.date ?? new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const surveyTitle = opts.surveyTitle ?? "VIKSIT ASSAM 2047";

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;

  // Outer saffron border
  doc.setDrawColor(217, 138, 41);
  doc.setLineWidth(3);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setLineWidth(0.6);
  doc.rect(12, 12, W - 24, H - 24);

  // Header
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Government of Assam", W / 2, 30, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(217, 138, 41);
  doc.setFontSize(28);
  doc.text("CERTIFICATE", W / 2, 55, { align: "center" });
  doc.setFontSize(20);
  doc.text("OF APPRECIATION", W / 2, 67, { align: "center" });

  doc.setDrawColor(217, 138, 41);
  doc.setLineWidth(0.4);
  doc.line(70, 75, W - 70, 75);

  // Body
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(12);
  doc.text("This certificate is proudly presented to", W / 2, 95, { align: "center" });

  doc.setFont("times", "italic");
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(32);
  doc.text(name || "Citizen", W / 2, 120, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(12);
  doc.text("for contributing valuable feedback towards", W / 2, 140, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(20);
  doc.text(surveyTitle, W / 2, 155, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(11);
  const thanks =
    "Your voice helps build a developed, progressive, and prosperous Assam. Thank you for taking the time to share your vision with us.";
  const lines = doc.splitTextToSize(thanks, 150);
  doc.text(lines, W / 2, 175, { align: "center" });

  // QR code
  try {
    const qrData = await QRCode.toDataURL(responseCode, { margin: 1, width: 200 });
    doc.addImage(qrData, "PNG", W / 2 - 17.5, 210, 35, 35);
  } catch {}

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Date: ${date}`, 30, 260);
  doc.text(`Ref: ${responseCode}`, W - 30, 260, { align: "right" });

  doc.save(`Viksit-Assam-2047-Certificate-${name.replace(/\s+/g, "-")}.pdf`);
}
