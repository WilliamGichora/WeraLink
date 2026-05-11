import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export async function downloadReportAsPdf(
  element: HTMLElement,
  filename: string = 'WeraLink-Report'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF('p', 'mm', 'a4');
  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= 297; // A4 height

  // Additional pages if content overflows
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297;
  }

  pdf.save(`${filename}.pdf`);
}
