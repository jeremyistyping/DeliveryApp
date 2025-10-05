import PDFDocument from 'pdfkit';
import { formatCurrency } from './utils';

interface OrderWithMerchant {
  id: string;
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  recipientProvince: string;
  recipientPostalCode: string;
  courier: string;
  service: string;
  weight: number;
  itemName: string;
  itemValue: number;
  paymentMethod: string;
  codAmount?: number;
  shippingCost: number;
  merchant: {
    businessName: string;
    address: string;
    city: string;
    province: string;
    phone: string;
  };
}

export const generateShippingLabel = async (order: OrderWithMerchant): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 30, bottom: 30, left: 30, right: 30 },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Title
      doc.fontSize(18).font('Helvetica-Bold').text('SHIPPING LABEL', { align: 'center' });
      doc.moveDown();

      // Order info box
      const startY = doc.y;
      doc.rect(30, startY, 535, 60).stroke();
      
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('ORDER INFORMATION', 40, startY + 10);
      
      doc.fontSize(10).font('Helvetica');
      doc.text(`Order Number: ${order.orderNumber}`, 40, startY + 25);
      doc.text(`Courier: ${order.courier} - ${order.service}`, 200, startY + 25);
      doc.text(`Weight: ${order.weight} kg`, 350, startY + 25);
      doc.text(`Payment: ${order.paymentMethod}`, 40, startY + 40);
      
      if (order.codAmount) {
        doc.text(`COD Amount: ${formatCurrency(order.codAmount)}`, 200, startY + 40);
      }
      
      doc.text(`Shipping Cost: ${formatCurrency(order.shippingCost)}`, 350, startY + 40);

      doc.y = startY + 80;

      // From (Merchant) section
      doc.rect(30, doc.y, 255, 120).stroke();
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('FROM:', 40, doc.y + 10);
      
      doc.fontSize(10).font('Helvetica');
      doc.text(order.merchant.businessName, 40, doc.y + 25, { width: 235 });
      doc.text(order.merchant.address, 40, doc.y + 40, { width: 235 });
      doc.text(`${order.merchant.city}, ${order.merchant.province}`, 40, doc.y + 75);
      doc.text(`Phone: ${order.merchant.phone}`, 40, doc.y + 90);

      // To (Recipient) section  
      const toY = doc.y - 120;
      doc.rect(310, toY, 255, 120).stroke();
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('TO:', 320, toY + 10);
      
      doc.fontSize(10).font('Helvetica');
      doc.text(order.recipientName, 320, toY + 25, { width: 235 });
      doc.text(order.recipientAddress, 320, toY + 40, { width: 235 });
      doc.text(`${order.recipientCity}, ${order.recipientProvince}`, 320, toY + 75);
      doc.text(`Postal Code: ${order.recipientPostalCode}`, 320, toY + 90);
      doc.text(`Phone: ${order.recipientPhone}`, 320, toY + 105);

      doc.y = toY + 140;

      // Item details
      doc.rect(30, doc.y, 535, 80).stroke();
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('ITEM DETAILS:', 40, doc.y + 10);
      
      doc.fontSize(10).font('Helvetica');
      doc.text(`Item Name: ${order.itemName}`, 40, doc.y + 25, { width: 515 });
      doc.text(`Item Value: ${formatCurrency(order.itemValue)}`, 40, doc.y + 40);
      doc.text(`Dimensions: ${order.weight} kg`, 40, doc.y + 55);

      doc.y = doc.y + 100;

      // Tracking section (placeholder)
      doc.rect(30, doc.y, 535, 60).stroke();
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('TRACKING INFORMATION:', 40, doc.y + 10);
      
      doc.fontSize(10).font('Helvetica');
      doc.text('Tracking Number: [To be assigned by courier]', 40, doc.y + 25);
      doc.text('Scan this section for tracking updates', 40, doc.y + 40);

      doc.y = doc.y + 80;

      // Footer notes
      doc.fontSize(8).font('Helvetica');
      doc.text('Notes:', 30, doc.y);
      doc.text('• Please handle with care', 30, doc.y + 15);
      doc.text('• Contact merchant for any delivery issues', 30, doc.y + 25);
      doc.text('• This is a system-generated label', 30, doc.y + 35);

      // Barcode placeholder (simple text representation)
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text(`|||| ${order.orderNumber} ||||`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};