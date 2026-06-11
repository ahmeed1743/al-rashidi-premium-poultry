import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function captureToPdf(el: HTMLElement, filename: string, title?: string) {
  const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
  const canvas = await html2canvas(el, { backgroundColor: bg, scale: 2, useCORS: true });
  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;
  let heightLeft = imgH;
  let pos = 0;
  pdf.addImage(img, "PNG", 0, pos, imgW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    pos = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(img, "PNG", 0, pos, imgW, imgH);
    heightLeft -= pageH;
  }
  if (title) pdf.setProperties({ title });
  pdf.save(filename);
}