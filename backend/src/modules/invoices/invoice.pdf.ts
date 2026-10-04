import PDFDocument from "pdfkit";
import type { Invoice, Client, InvoiceLineItem } from "@prisma/client";

interface RenderInput {
    invoice: Invoice & { client: Client; lineItems: InvoiceLineItem[] };
    organizationName: string;
}

export function renderInvoicePdf({ invoice, organizationName }: RenderInput): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const chunks: Buffer[] = [];

        doc.on("data", (c) => chunks.push(c));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Header
        doc.fontSize(20).text(organizationName, { continued: false });
        doc.moveDown(0.5);
        doc.fontSize(28).text(`Invoice ${invoice.number}`);
        doc.fontSize(10).fillColor("#666").text(`Status: ${invoice.status}`);
        doc.moveDown(1);

        // Bill to
        doc.fillColor("#000").fontSize(12).text("Billed to", { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(11).text(invoice.client.name);
        if (invoice.client.company) doc.text(invoice.client.company);
        if (invoice.client.email) doc.text(invoice.client.email);
        doc.moveDown(1);

        // Meta
        if (invoice.issuedAt) doc.text(`Issued: ${invoice.issuedAt.toDateString()}`);
        if (invoice.dueDate) doc.text(`Due: ${invoice.dueDate.toDateString()}`);
        doc.moveDown(1);

        // Line items table
        const tableTop = doc.y;
        const colX = { desc: 50, qty: 330, unit: 390, amount: 470 };

        doc.fontSize(10).fillColor("#333");
        doc.text("Description", colX.desc, tableTop);
        doc.text("Qty", colX.qty, tableTop);
        doc.text("Unit", colX.unit, tableTop);
        doc.text("Amount", colX.amount, tableTop);
        doc.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).stroke("#ccc");

        let y = tableTop + 22;
        for (const li of invoice.lineItems) {
            doc.fillColor("#000").fontSize(10);
            doc.text(li.description, colX.desc, y, { width: 260 });
            doc.text(String(li.quantity), colX.qty, y);
            doc.text(String(li.unitPrice), colX.unit, y);
            doc.text(String(li.amount), colX.amount, y);
            y += 18;
        }

        // Totals
        y += 10;
        doc.moveTo(50, y).lineTo(545, y).stroke("#ccc");
        y += 10;
        doc.fontSize(10);
        doc.text(`Subtotal: ${invoice.currency} ${invoice.subtotal}`, 400, y);
        y += 14;
        doc.text(`Tax: ${invoice.currency} ${invoice.taxAmount}`, 400, y);
        y += 14;
        doc.fontSize(12).text(`Total: ${invoice.currency} ${invoice.total}`, 400, y, {
            underline: true,
        });

        // Notes
        if (invoice.notes) {
            doc.moveDown(3);
            doc.fontSize(10).fillColor("#333").text("Notes", { underline: true });
            doc.moveDown(0.3);
            doc.fillColor("#000").text(invoice.notes);
        }

        doc.end();
    });
}