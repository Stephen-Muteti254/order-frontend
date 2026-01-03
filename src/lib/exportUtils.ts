import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Order, Client } from '@/types';
import { format } from 'date-fns';
import { formatEAT } from '@/lib/dateUtils';

export function exportToPDF(
  orders: Order[],
  client: Client,
  startDate: string,
  endDate: string
) {
  const doc = new jsPDF();
  const totalAmount = orders.reduce((sum, order) => sum + order.totalCost, 0);

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 105, 20, { align: 'center' });

  // Invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Date: ${formatEAT(new Date())}`, 14, 35);
  doc.text(
    `Period: ${formatEAT(startDate)} - ${formatEAT(endDate)}`,
    14,
    42
  );

  // Client details
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(client.clientName, 14, 62);
  doc.text(client.institution, 14, 69);
  doc.text(client.email, 14, 76);
  doc.text(client.phone, 14, 83);

  // Table
  const tableData = orders.map((order) => [
    order.class?.name || 'N/A',
    order.week,
    order.product?.name || 'N/A',
    order.description,
    order.pagesOrSlides.toString(),
    `$${order.product?.pricePerUnit.toFixed(2) || '0.00'}`,
    `$${order.totalCost.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['Class', 'Week', 'Product', 'Description', 'Pages/Slides/Questions', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [34,34,59], textColor: [255,255,255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 5: { halign: 'right' }, 6: { halign: 'right', fontStyle: 'bold' } },
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 195, finalY + 15, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', 105, finalY + 30, { align: 'center' });

  // Save
  const fileName = `Invoice_${client.id}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}

export function exportToExcel(
  orders: Order[],
  client: Client,
  startDate: string,
  endDate: string
) {
  const totalAmount = orders.reduce((sum, order) => sum + order.totalCost, 0);

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();

  // Invoice header data
  const headerData = [
    ['INVOICE'],
    [],
    ['Invoice Date:', formatEAT(new Date())],
    ['Period:', `${formatEAT(startDate)} - ${formatEAT(endDate)}`],
    [],
    ['Bill To:'],
    ['Client Name:', client.clientName],
    ['Institution:', client.institution],
    ['Email:', client.email],
    ['Phone:', client.phone],
    [],
    ['Class', 'Week', 'Product', 'Description', 'Pages/Slides/Questions', 'Unit Price', 'Total'],
  ];

  // Order data
  const orderData = orders.map((order) => [
    order.class?.name || 'N/A',
    order.week,
    order.product?.name || 'N/A',
    order.description,
    order.pagesOrSlides,
    order.product?.pricePerUnit || 0,
    order.totalCost,
  ]);

  // Summary
  const summaryData = [
    [],
    ['', '', '', '', '', '', 'Total Amount:', totalAmount],
  ];

  // Combine all data
  const allData = [...headerData, ...orderData, ...summaryData];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(allData);

  // Column widths
  ws['!cols'] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Invoice');

  // Save file
  const fileName = `Invoice_${client.id}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportReportToPDF(
  orders: Order[],
  startDate: string,
  endDate: string,
  reportTitle: string = 'Orders Report'
) {
  const doc = new jsPDF();
  const totalAmount = orders.reduce((sum, order) => sum + order.totalCost, 0);

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle, 105, 20, { align: 'center' });

  // Report details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${formatEAT(new Date())}`, 14, 35);
  doc.text(
    `Period: ${formatEAT(startDate)} - ${formatEAT(endDate)}`,
    14,
    42
  );
  doc.text(`Total Orders: ${orders.length}`, 14, 49);

  // Table
  const tableData = orders.map((order) => [
    order.client?.clientName || 'N/A',
    order.class?.name || 'N/A',
    order.week,
    order.product?.name || 'N/A',
    order.description,
    order.pagesOrSlides.toString(),
    `$${order.product?.pricePerUnit.toFixed(2) || '0.00'}`,
    `$${order.totalCost.toFixed(2)}`,
    // format(new Date(order.createdAt), 'PP'),
  ]);

  autoTable(doc, {
    startY: 60,
    head: [['Client', 'Class', 'Week', 'Product', 'Description', 'Units', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [34, 34, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      6: { halign: 'right' }, // Unit Price
      7: { halign: 'right', fontStyle: 'bold' }, // Total
    },
  });

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Revenue: $${totalAmount.toFixed(2)}`, 195, finalY + 15, { align: 'right' });

  // Save
  const fileName = `Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}

export function exportReportToExcel(
  orders: Order[],
  startDate: string,
  endDate: string,
  reportTitle: string = 'Orders Report'
) {
  const totalAmount = orders.reduce((sum, order) => sum + order.totalCost, 0);

  const wb = XLSX.utils.book_new();

  const headerData = [
    [reportTitle],
    [],
    ['Generated:', format(new Date(), 'PPP')],
    ['Period:', `${format(new Date(startDate), 'PP')} - ${format(new Date(endDate), 'PP')}`],
    ['Total Orders:', orders.length],
    [],
    ['Client', 'Class', 'Week', 'Product', 'Description', 'Units', 'Unit Price', 'Total'],
  ];

  const orderData = orders.map((order) => [
    order.client?.clientName || 'N/A',
    order.class?.name || 'N/A',
    order.week,
    order.product?.name || 'N/A',
    order.description,
    order.pagesOrSlides,
    order.product?.pricePerUnit || 0,
    order.totalCost,
    // format(new Date(order.createdAt), 'PP'),
  ]);

  const summaryData = [
    [],
    ['', '', '', '', '', '', '', 'Total Revenue:', totalAmount],
  ];

  const allData = [...headerData, ...orderData, ...summaryData];
  const ws = XLSX.utils.aoa_to_sheet(allData);

  ws['!cols'] = [
    { wch: 20 }, // Client
    { wch: 12 }, // Class
    { wch: 10 }, // Week
    { wch: 20 }, // Product
    { wch: 30 }, // Description
    { wch: 15 }, // Pages/Slides/Questions
    { wch: 12 }, // Unit Price
    { wch: 12 }, // Total
    { wch: 12 }, // Date
  ];


  XLSX.utils.book_append_sheet(wb, ws, 'Report');

  const fileName = `Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
