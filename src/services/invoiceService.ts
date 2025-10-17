import fs from "fs";
import PDFDocument from "pdfkit";
import path from "path";

export const generateInvoice = async (sessionData: any) => {
    const invoiceDir = path.join(__dirname, "../../invoices");
    if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir);
    }

    const invoicePath = path.join(invoiceDir, `invoice_${sessionData.id}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(invoicePath);
    doc.pipe(stream);

    // === Company Header ===
    const companyName = "tohfabox25";
    const logoPath = path.join(__dirname, "../assets/logo.png"); // optional logo
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 60 });
    }

    doc
        .fontSize(22)
        .fillColor("#333333")
        .text(companyName, 120, 50, { align: "left" });

    doc
        .fontSize(10)
        .fillColor("#555555")
        .text("aklera", 120, 75)
        .text("Rajasthan, India", 120, 90)
        .text("Email: tohfabox25@gmail.com", 120, 105)
        .text("Phone: +91 777510030", 120, 120)
        .moveDown(2);

    // === Invoice Title ===
    doc
        .moveDown()
        .fontSize(18)
        .fillColor("#0074D9")
        .text("Payment Invoice", { align: "center" })
        .moveDown(1);

    // === Invoice Info ===
    const createdDate = new Date().toLocaleDateString();
    doc
        .fontSize(12)
        .fillColor("#000")
        .text(`Invoice #: INV-${sessionData.id.slice(-6)}`)
        .text(`Date: ${createdDate}`)
        .text(`Payment Intent: ${sessionData.payment_intent}`)
        .moveDown(1.5);

    // === Customer Details Box ===
    const customer = sessionData.customer_details || {};
    doc
        .rect(50, doc.y, 500, 90)
        .fill("#f8f8f8")
        .stroke("#cccccc");

    doc
        .fillColor("#000000")
        .fontSize(12)
        .text("Bill To:", 60, doc.y + 10)
        .fontSize(11)
        .fillColor("#333333")
        .text(customer.name || "N/A", 120, doc.y - 15)
        .text(customer.email || "N/A", 120, doc.y)
        .text(customer.address?.country || "N/A", 120, doc.y + 15)
        .moveDown(3);

    // === Payment Summary Table ===
    const startY = doc.y + 10;
    doc.moveTo(50, startY).lineTo(550, startY).stroke("#0074D9");

    const tableTop = startY + 10;
    const tableLeft = 60;

    doc.fontSize(12).fillColor("#000000");
    doc.text("Description", tableLeft, tableTop);
    doc.text("Amount", 400, tableTop);
    doc.moveDown(0.5);

    doc.moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).stroke("#cccccc");

    // Payment summary
    const currency = sessionData.currency.toUpperCase();
    const totalAmount = (sessionData.amount_total / 100).toFixed(2);

    doc
        .fontSize(11)
        .fillColor("#333333")
        .text("Product/Service Payment", tableLeft, doc.y + 15)
        .text(`${totalAmount} ${currency}`, 400, doc.y + 15)
        .moveDown(1);

    doc
        .moveTo(50, doc.y + 10)
        .lineTo(550, doc.y + 10)
        .stroke("#0074D9")
        .moveDown(1.5);

    // === Payment Summary Footer ===
    doc
        .fontSize(12)
        .fillColor("#000")
        .text("Payment Status:", 60, doc.y)
        .fillColor("#007700")
        .text(sessionData.payment_status.toUpperCase(), 180, doc.y - 15)
        .moveDown(1);

    doc
        .fillColor("#000")
        .text("Total Paid:", 60)
        .fillColor("#0000AA")
        .fontSize(14)
        .text(`${totalAmount} ${currency}`, 180, doc.y - 18)
        .moveDown(2);

    // === Footer ===
    doc
        .fontSize(10)
        .fillColor("#888888")
        .text("Thank you for your business!", { align: "center" })
        .text("This is a system-generated invoice.", { align: "center" });

    doc.end();

    return new Promise<string>((resolve, reject) => {
        stream.on("finish", () => resolve(`/invoices/invoice_${sessionData.id}.pdf`));
        stream.on("error", reject);
    });
};
