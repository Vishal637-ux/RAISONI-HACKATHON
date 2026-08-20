import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export const pdfGeneratorService = {
  /**
   * Generate QR code Data URL for verification link
   * @param {string} verificationUrl - Full URL to public verification page
   */
  async generateQRCodeDataURL(verificationUrl) {
    try {
      return await QRCode.toDataURL(verificationUrl, {
        width: 150,
        margin: 1,
        color: {
          dark: '#1F6B32',
          light: '#FFFFFF',
        },
      });
    } catch (err) {
      console.error('Error generating QR code DataURL:', err);
      return null;
    }
  },

  /**
   * Render vector landscape PDF certificate with embedded QR code
   * @param {object} certDetails - { certificateId, studentName, internshipTitle, companyName, departmentName, issueDate, verificationUrl }
   */
  async generateCertificatePDF(certDetails) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const {
      certificateId = 'CERT-2026-CS-0001',
      studentName = 'Student Candidate',
      internshipTitle = 'Software Engineering Intern',
      companyName = 'Host Organization',
      departmentName = 'Computer Science & Engineering',
      issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      verificationUrl = `${origin}/verify-certificate/${certificateId}`,
    } = certDetails;

    // Create A4 Landscape PDF (297mm x 210mm)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Page Dimensions
    const width = 297;
    const height = 210;

    // Border and Accent Styling
    doc.setDrawColor(47, 143, 70); // #2F8F46 (Raisoni Green)
    doc.setLineWidth(2);
    doc.rect(10, 10, width - 20, height - 20);

    doc.setDrawColor(197, 227, 204); // Accent border
    doc.setLineWidth(0.8);
    doc.rect(13, 13, width - 26, height - 26);

    // Institution Branding Header
    doc.setTextColor(31, 107, 50); // #1F6B32
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('RAISONI GROUP OF INSTITUTIONS — INTERTRACK', width / 2, 28, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 112, 106); // #66706A
    doc.text('OFFICIAL INSTITUTIONAL INTERNSHIP VERIFICATION ENGINE', width / 2, 34, { align: 'center' });

    // Main Certificate Header
    doc.setTextColor(24, 32, 27); // #18201B
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('CERTIFICATE OF COMPLETION', width / 2, 55, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 112, 106);
    doc.text('PROUDLY PRESENTED TO', width / 2, 66, { align: 'center' });

    // Student Candidate Name
    doc.setTextColor(31, 107, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(studentName.toUpperCase(), width / 2, 78, { align: 'center' });

    // Underline
    doc.setDrawColor(47, 143, 70);
    doc.setLineWidth(0.5);
    doc.line(width / 2 - 50, 81, width / 2 + 50, 81);

    // Body Narrative
    doc.setTextColor(24, 32, 27);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const bodyText = `For successfully completing the official academic and industry internship as ${internshipTitle} at ${companyName}. The candidate has completed all required work logs, GPS-verified attendance, and received dual approved performance evaluations from both Industry and Faculty Mentors.`;
    
    const splitBody = doc.splitTextToSize(bodyText, 210);
    doc.text(splitBody, width / 2, 95, { align: 'center', lineHeightFactor: 1.4 });

    // Metadata Details Box
    doc.setFillColor(248, 250, 249); // #F8FAF9
    doc.rect(40, 125, 217, 30, 'F');
    doc.setDrawColor(225, 231, 226);
    doc.rect(40, 125, 217, 30, 'D');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(24, 32, 27);
    doc.text(`Department: ${departmentName}`, 50, 134);
    doc.text(`Host Company: ${companyName}`, 50, 143);
    doc.text(`Certificate ID: ${certificateId}`, 50, 150);

    doc.text(`Issue Date: ${issueDate}`, 170, 134);
    doc.text(`Status: VERIFIED & COMPLETED`, 170, 143);
    doc.text(`Verification System: INTERTRACK DB`, 170, 150);

    // Signatures
    doc.line(40, 182, 100, 182);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Industry Mentor Sign-Off', 70, 187, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(companyName, 70, 192, { align: 'center' });

    doc.line(120, 182, 180, 182);
    doc.setFont('helvetica', 'bold');
    doc.text('Faculty Mentor & HOD Sign-Off', 150, 187, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(departmentName, 150, 192, { align: 'center' });

    // Embed QR Code
    const qrDataUrl = await this.generateQRCodeDataURL(verificationUrl);
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', 225, 162, 28, 28);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 107, 50);
      doc.text('SCAN TO VERIFY', 239, 193, { align: 'center' });
    }

    return doc.output('dataurlstring');
  },
};
