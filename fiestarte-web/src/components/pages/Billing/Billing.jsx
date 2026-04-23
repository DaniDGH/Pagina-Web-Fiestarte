import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../Sidebar/sidebar";
import {
  getInventoryItems,
  createOrderWithItems,
  getOrders,
  getOrderItemsByOrderId,
} from "../../../services/billing";
import { generateInvoicePdf } from "../../../services/pdf";
import "./Billing.css";

function Billing() {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    orderType: "venta",
    eventDate: "",
    eventTime: "",
    depositAmount: "",
    notes: "",
  });

  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    loadInventory();
    loadOrders();
  }, []);

  const loadInventory = async () => {
    setLoadingInventory(true);

    const { data, error } = await getInventoryItems();

    if (error) {
      console.error("Inventory fetch error:", error);
      setErrorMessage("No se pudo cargar el inventario.");
      setLoadingInventory(false);
      return;
    }

    setInventory(data || []);
    setLoadingInventory(false);
  };

  const loadOrders = async () => {
    setLoadingOrders(true);

    const { data, error } = await getOrders();

    if (error) {
      console.error("Orders fetch error:", error);
      setErrorMessage("No se pudieron cargar las facturas.");
      setLoadingOrders(false);
      return;
    }

    setOrders(data || []);
    setLoadingOrders(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    setSelectedItems((prev) => [
      ...prev,
      {
        inventoryId: "",
        quantity: 1,
        search: "",
        showResults: false,
      },
    ]);
  };

  const handleItemChange = (index, field, value) => {
    setSelectedItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === "quantity" ? Number(value) : value,
            }
          : item
      )
    );
  };

  const handleSelectProduct = (index, product) => {
    setSelectedItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              inventoryId: product.id,
              search: product.name,
              showResults: false,
            }
          : item
      )
    );
  };

  const handleRemoveItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const orderPreview = useMemo(() => {
    const detailedItems = selectedItems
      .map((item) => {
        const inventoryItem = inventory.find(
          (product) => String(product.id) === String(item.inventoryId)
        );

        if (!inventoryItem) return null;

        const unitPrice =
          formData.orderType === "alquiler"
            ? Number(inventoryItem.rental_price || 0)
            : Number(inventoryItem.sale_price || 0);

        const subtotal = unitPrice * Number(item.quantity || 0);

        return {
          inventoryId: inventoryItem.id,
          name: inventoryItem.name,
          quantity: Number(item.quantity || 0),
          unitPrice,
          subtotal,
        };
      })
      .filter(Boolean);

    const subtotal = detailedItems.reduce((acc, item) => acc + item.subtotal, 0);

    const deposit =
      formData.orderType === "alquiler"
        ? Number(formData.depositAmount || 0)
        : 0;

    const total = subtotal + deposit;

    return {
      detailedItems,
      subtotal,
      deposit,
      total,
    };
  }, [selectedItems, inventory, formData.orderType, formData.depositAmount]);

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      orderType: "venta",
      eventDate: "",
      eventTime: "",
      depositAmount: "",
      notes: "",
    });

    setSelectedItems([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.customerName.trim()) {
      setErrorMessage("El nombre del cliente es obligatorio.");
      return;
    }

    if (orderPreview.detailedItems.length === 0) {
      setErrorMessage("Debes agregar al menos una prenda.");
      return;
    }

    const hasInvalidQuantity = orderPreview.detailedItems.some(
      (item) => !item.quantity || item.quantity < 1
    );

    if (hasInvalidQuantity) {
      setErrorMessage("Todas las cantidades deben ser mayores a 0.");
      return;
    }

    if (formData.orderType === "alquiler" && Number(formData.depositAmount || 0) < 0) {
      setErrorMessage("El deposito no puede ser negativo.");
      return;
    }

    setSaving(true);

    const payload = {
      customer_name: formData.customerName,
      customer_phone: formData.customerPhone,
      customer_email: formData.customerEmail,
      order_type: formData.orderType,
      total_amount: orderPreview.total,
      deposit_amount: orderPreview.deposit,
      status: "pending",
      notes: formData.notes,
      agenda: {
        event_date: formData.eventDate || null,
        event_time: formData.eventTime || null,
        notes: formData.notes,
      },
      items: orderPreview.detailedItems.map((item) => ({
        inventory_id: item.inventoryId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    };

    const { error } = await createOrderWithItems(payload);

    if (error) {
      console.error("Create order error:", error);
      setErrorMessage("No se pudo guardar la factura.");
      setSaving(false);
      return;
    }

    resetForm();
    await loadOrders();
    setSaving(false);
  };

  const handleDownloadPdf = async (order) => {
    const { data, error } = await getOrderItemsByOrderId(order.id);

    if (error) {
      console.error("Order items fetch error:", error);
      setErrorMessage("No se pudo generar el PDF.");
      return;
    }

    generateInvoicePdf(order, data || []);
  };

  return (
    <div className="billing-page">
      <Sidebar />

      <main className="billing-content">
        <section className="billing-panel">
          <h1 className="billing-title">Facturación</h1>

          {errorMessage && <p className="billing-error">{errorMessage}</p>}

          <form className="billing-form" onSubmit={handleSubmit}>
            <div className="billing-grid">
              <div className="billing-field">
                <label htmlFor="customerName">Cliente</label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  value={formData.customerName}
                  onChange={handleChange}
                />
              </div>

              <div className="billing-field">
                <label htmlFor="customerPhone">Teléfono</label>
                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="text"
                  value={formData.customerPhone}
                  onChange={handleChange}
                />
              </div>

              <div className="billing-field">
                <label htmlFor="customerEmail">Correo</label>
                <input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleChange}
                />
              </div>

              <div className="billing-field">
                <label htmlFor="orderType">Tipo</label>
                <select
                  id="orderType"
                  name="orderType"
                  value={formData.orderType}
                  onChange={handleChange}
                >
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>

              <div className="billing-field">
                <label htmlFor="eventDate">Fecha del evento</label>
                <input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={handleChange}
                />
              </div>

              <div className="billing-field">
                <label htmlFor="eventTime">Hora del evento</label>
                <input
                  id="eventTime"
                  name="eventTime"
                  type="time"
                  value={formData.eventTime}
                  onChange={handleChange}
                />
              </div>

              {formData.orderType === "alquiler" && (
                <div className="billing-field">
                  <label htmlFor="depositAmount">Deposito</label>
                  <input
                    id="depositAmount"
                    name="depositAmount"
                    type="number"
                    min="0"
                    value={formData.depositAmount}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            <div className="billing-field">
              <label htmlFor="notes">Notas</label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="billing-items-header">
              <h2>Prendas</h2>
              <button
                type="button"
                className="secondary-button"
                onClick={handleAddItem}
              >
                Agregar prenda
              </button>
            </div>

            <div className="billing-items-list">
              {selectedItems.length === 0 && (
                <p className="empty-text">Aún no has agregado prendas.</p>
              )}

              {selectedItems.map((item, index) => {
                const filteredProducts = inventory
                  .filter((product) =>
                    product.name?.toLowerCase().includes(item.search.toLowerCase())
                  )
                  .slice(0, 8);

                return (
                  <div className="billing-item-card" key={index}>
                    <div className="billing-search-box">
                      <input
                        type="text"
                        placeholder="Escribe la prenda..."
                        value={item.search}
                        onChange={(e) => {
                          handleItemChange(index, "search", e.target.value);
                          handleItemChange(index, "showResults", true);
                          handleItemChange(index, "inventoryId", "");
                        }}
                        onFocus={() => handleItemChange(index, "showResults", true)}
                      />

                      {item.showResults && item.search.trim() && (
                        <div className="billing-search-results">
                          {filteredProducts.length === 0 ? (
                            <div className="billing-search-empty">
                              No se encontraron prendas
                            </div>
                          ) : (
                            filteredProducts.map((product) => (
                              <button
                                type="button"
                                key={product.id}
                                className="billing-search-result"
                                onClick={() => handleSelectProduct(index, product)}
                              >
                                <span>{product.name}</span>
                                <small>
                                  {formData.orderType === "alquiler"
                                    ? `$${Number(product.rental_price || 0).toLocaleString("es-CO")}`
                                    : `$${Number(product.sale_price || 0).toLocaleString("es-CO")}`}
                                </small>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                    />

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Quitar
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="billing-summary">
              <h2>Resumen</h2>

              {orderPreview.detailedItems.length === 0 ? (
                <p className="empty-text">No hay prendas seleccionadas.</p>
              ) : (
                <div className="billing-summary-list">
                  {orderPreview.detailedItems.map((item) => (
                    <div className="billing-summary-row" key={item.inventoryId}>
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>${item.subtotal.toLocaleString("es-CO")}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="billing-total">
                <span>Subtotal:</span>
                <strong>${orderPreview.subtotal.toLocaleString("es-CO")}</strong>
              </div>

              {formData.orderType === "alquiler" && (
                <div className="billing-total">
                  <span>Deposito:</span>
                  <strong>${orderPreview.deposit.toLocaleString("es-CO")}</strong>
                </div>
              )}

              <div className="billing-total final-total">
                <span>Total factura:</span>
                <strong>${orderPreview.total.toLocaleString("es-CO")}</strong>
              </div>
            </div>

            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Guardando..." : "Guardar factura"}
            </button>
          </form>
        </section>

        <section className="billing-panel">
          <h2 className="billing-subtitle">Facturas registradas</h2>

          {loadingOrders ? (
            <p>Cargando facturas...</p>
          ) : orders.length === 0 ? (
            <p className="empty-text">No hay facturas registradas.</p>
          ) : (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Deposito</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.order_type}</td>
                      <td>
                        {order.order_type === "alquiler"
                          ? `$${Number(order.deposit_amount || 0).toLocaleString("es-CO")}`
                          : "-"}
                      </td>
                      <td>
                        ${Number(order.total_amount || 0).toLocaleString("es-CO")}
                      </td>
                      <td>{order.status}</td>
                      <td>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => handleDownloadPdf(order)}
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {loadingInventory && <p>Cargando inventario...</p>}
        </section>
      </main>
    </div>
  );
}

export default Billing;