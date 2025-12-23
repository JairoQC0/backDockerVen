// ═══════════════════════════════════════════════════════════════════════════════
// Autor:   Jairo Quispe Coa (Optimizado)
// Fecha:   2025-12-17
// Archivo: sales.pdf.js
// ═══════════════════════════════════════════════════════════════════════════════

import PDFDocument from "pdfkit";

const COLORS = {
  primary: "#1e293b",
  secondary: "#64748b",
  accent: "#2563eb",
  border: "#e2e8f0",
  bgHeader: "#f8fafc",
  success: "#16a34a",
  danger: "#dc2626",
};

const FONTS = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
};

export function buildSalePdf(sale) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: true,
  });

  const chunks = [];
  doc.on("data", (c) => chunks.push(c));

  generateHeader(doc, sale);

  generateCustomerInfo(doc, sale);

  let yPosition = 240;
  generateTableHeaders(doc, yPosition);
  yPosition += 25;

  sale.items.forEach((it, index) => {
    const descriptionHeight = doc.heightOfString(it.product.nombre, {
      width: 260,
    });
    const rowHeight = Math.max(descriptionHeight, 20) + 10;

    if (yPosition + rowHeight > doc.page.height - 100) {
      doc.addPage();
      generateHeader(doc, sale, true);
      yPosition = 100;
      generateTableHeaders(doc, yPosition);
      yPosition += 25;
    }

    drawRow(doc, yPosition, it, rowHeight);
    yPosition += rowHeight;
  });

  if (yPosition + 100 > doc.page.height - 50) {
    doc.addPage();
    yPosition = 50;
  }

  generateTotals(doc, yPosition, sale);

  generateFooter(doc);

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

function generateHeader(doc, sale, simple = false) {
  if (!simple) {
    doc.rect(0, 0, 595, 130).fill(COLORS.bgHeader);
  }

  doc
    .fillColor(COLORS.primary)
    .fontSize(20)
    .font(FONTS.bold)
    .text("MI EMPRESA S.A.C.", 50, 45);

  if (!simple) {
    doc
      .fontSize(9)
      .font(FONTS.regular)
      .fillColor(COLORS.secondary)
      .text("RUC: 20123456789", 50, 70)
      .text("Av. Principal 123, Lima - Perú", 50, 85)
      .text("Tel: (01) 123-4567 | ventas@miempresa.com", 50, 100);
  }

  const boxTop = 50;
  doc.rect(380, boxTop, 175, 70).lineWidth(1).stroke(COLORS.border);

  doc
    .fillColor(COLORS.primary)
    .fontSize(12)
    .font(FONTS.bold)
    .text("BOLETA DE VENTA", 380, boxTop + 10, { width: 175, align: "center" })
    .text("ELECTRÓNICA", 380, boxTop + 25, { width: 175, align: "center" });

  doc
    .fontSize(10)
    .fillColor(COLORS.accent)
    .text(`N° ${sale.id.toString().padStart(6, "0")}`, 380, boxTop + 45, {
      width: 175,
      align: "center",
    });

  if (!simple) {
    doc
      .fontSize(8)
      .font(FONTS.bold)
      .fillColor(COLORS.secondary)
      .text("FECHA EMISIÓN:", 380, 130);
    doc
      .font(FONTS.regular)
      .fillColor(COLORS.primary)
      .text(formatDate(sale.createdAt), 460, 130);

    doc.font(FONTS.bold).fillColor(COLORS.secondary).text("ESTADO:", 380, 145);
    doc
      .font(FONTS.bold)
      .fillColor(sale.estado === "ACTIVA" ? COLORS.success : COLORS.danger)
      .text(sale.estado, 460, 145);
  }
}

function generateCustomerInfo(doc, sale) {
  const clientName = sale.clientName || "CLIENTE GENERAL";
  const clientDoc = sale.clientDoc || "00000000";
  const clientAddress = sale.clientAddress || "Sin dirección";

  doc.rect(40, 170, 515, 55).lineWidth(0.5).stroke(COLORS.border);

  doc.fontSize(8).fillColor(COLORS.secondary).font(FONTS.bold);
  doc.text("CLIENTE:", 50, 180);
  doc.text("DOC. IDENTIDAD:", 50, 205);
  doc.text("DIRECCIÓN:", 300, 180);

  doc.fontSize(9).fillColor(COLORS.primary).font(FONTS.regular);
  doc.text(clientName, 50, 190);
  doc.text(clientDoc, 50, 215);
  doc.text(clientAddress, 300, 190, { width: 240 });
}

function generateTableHeaders(doc, y) {
  doc.rect(40, y, 515, 20).fill(COLORS.primary);

  doc.fillColor("#ffffff").fontSize(8).font(FONTS.bold);
  doc.text("CANT", 50, y + 6, { width: 40, align: "center" });
  doc.text("DESCRIPCIÓN", 100, y + 6);
  doc.text("P. UNIT", 400, y + 6, { width: 60, align: "right" });
  doc.text("TOTAL", 480, y + 6, { width: 60, align: "right" });
}

function drawRow(doc, y, item, height) {
  const price = Number(item.precio);
  const subtotal = Number(item.subtotal);

  doc.fillColor(COLORS.primary).fontSize(9).font(FONTS.regular);

  doc.text(item.cantidad.toString(), 50, y + 6, { width: 40, align: "center" });

  doc.text(item.product.nombre, 100, y + 6, { width: 260, lineBreak: true });

  doc.text(formatCurrency(price), 400, y + 6, { width: 60, align: "right" });
  doc.text(formatCurrency(subtotal), 480, y + 6, { width: 60, align: "right" });

  doc
    .moveTo(50, y + height - 2)
    .lineTo(545, y + height - 2)
    .lineWidth(0.5)
    .stroke(COLORS.border);
}

function generateTotals(doc, y, sale) {
  const total = Number(sale.total);
  const subtotal = total / 1.18;
  const igv = total - subtotal;

  doc.moveTo(380, y).lineTo(545, y).lineWidth(1).stroke(COLORS.primary);

  y += 10;

  const drawTotalLine = (label, value, isBold = false) => {
    doc
      .fontSize(9)
      .font(isBold ? FONTS.bold : FONTS.regular)
      .fillColor(COLORS.secondary)
      .text(label, 380, y, { width: 80, align: "right" });

    doc
      .fontSize(isBold ? 11 : 9)
      .fillColor(COLORS.primary)
      .text(formatCurrency(value), 480, y, { width: 60, align: "right" });
    y += 15;
  };

  drawTotalLine("OP. GRAVADA", subtotal);
  drawTotalLine("IGV (18%)", igv);
  y += 5;
  drawTotalLine("IMPORTE TOTAL", total, true);
}

function generateFooter(doc) {
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);

    const footerY = doc.page.height - 50;
    doc
      .moveTo(50, footerY)
      .lineTo(545, footerY)
      .lineWidth(0.5)
      .stroke(COLORS.border);

    doc.fontSize(7).fillColor(COLORS.secondary).font(FONTS.regular);
    doc.text(
      "Representación impresa de la BOLETA DE VENTA ELECTRÓNICA.",
      50,
      footerY + 10
    );
    doc.text(
      "Para consultar el documento visite www.miempresa.com",
      50,
      footerY + 20
    );

    doc.text(`Página ${i + 1} de ${pageCount}`, 500, footerY + 10, {
      align: "right",
    });
  }
}

function formatCurrency(amount) {
  return `S/ ${amount.toFixed(2)}`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
