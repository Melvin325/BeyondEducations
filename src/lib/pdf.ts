import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadReportAsPdf(
  elementId: string = 'printable-report',
  filename: string = 'BeyondEducations_Career_Report.pdf'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return false;
  }

  try {
    // Generate high-resolution canvas capture ensuring all fonts and Indic glyphs render
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for crisp text
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Handle multi-page split if report is taller than single A4 page
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('PDF generation failed, falling back to window.print()', error);
    window.print();
    return false;
  }
}
