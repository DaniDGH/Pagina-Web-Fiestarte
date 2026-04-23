import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePdf = (order, items) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Factura Fiestarte", 14, 20);

  doc.setFontSize(11);
  doc.text(`Factura ID: ${order.id}`, 14, 32);
  doc.text(`Cliente: ${order.customer_name}`, 14, 40);
  doc.text(`Telefono: ${order.customer_phone || "-"}`, 14, 48);
  doc.text(`Correo: ${order.customer_email || "-"}`, 14, 56);
  doc.text(`Tipo: ${order.order_type}`, 14, 64);
  doc.text(`Estado: ${order.status}`, 14, 72);
  doc.text(`Total: $${Number(order.total_amount || 0).toLocaleString("es-CO")}`, 14, 80);

  autoTable(doc, {
    startY: 90,
    head: [["Prenda", "Cantidad", "Precio unitario", "Subtotal"]],
    body: items.map((item) => [
      item.inventory?.name || "Producto",
      item.quantity,
      `$${Number(item.unit_price || 0).toLocaleString("es-CO")}`,
      `$${Number(item.subtotal || 0).toLocaleString("es-CO")}`,
    ]),
  });

  doc.save(`factura-${order.id}.pdf`);
};