import { useEffect, useState } from "react";
import Sidebar from "../../Sidebar/sidebar";
import {
  getInventory,
  createInventoryItem,
  deleteInventoryItem,
} from "../../../services/inventory";
import "./Inventory.css";

function Inventory() {
  const [items, setItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    color: "",
    size: "",
    stock: 1,
    rental_price: "",
    sale_price: "",
    description: "",
    status: "available",
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const { data, error } = await getInventory();

    if (error) {
      console.error("Inventory fetch error:", error);
      setErrorMessage("No se pudo cargar el inventario.");
      return;
    }

    setItems(data || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "stock" ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      color: "",
      size: "",
      stock: 1,
      rental_price: "",
      sale_price: "",
      description: "",
      status: "available",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim() || !formData.category.trim()) {
      setErrorMessage("Nombre y categoría son obligatorios.");
      return;
    }

    setSaving(true);

    const payload = {
      ...formData,
      rental_price: formData.rental_price === "" ? null : Number(formData.rental_price),
      sale_price: formData.sale_price === "" ? null : Number(formData.sale_price),
    };

    const { error } = await createInventoryItem(payload);

    if (error) {
      console.error("Create inventory error:", error);
      setErrorMessage("No se pudo crear la prenda.");
      setSaving(false);
      return;
    }

    resetForm();
    await loadInventory();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("¿Deseas eliminar esta prenda?");
    if (!confirmed) return;

    const { error } = await deleteInventoryItem(id);

    if (error) {
      console.error("Delete inventory error:", error);
      setErrorMessage("No se pudo eliminar la prenda.");
      return;
    }

    await loadInventory();
  };

  return (
    <div className="inventory-page">
      <Sidebar />

      <main className="inventory-content">
        <section className="inventory-panel">
          <h1 className="inventory-title">Prendas / Inventario</h1>

          {errorMessage && <p className="inventory-error">{errorMessage}</p>}

          <form className="inventory-form" onSubmit={handleSubmit}>
            <div className="inventory-grid">
              <div className="inventory-field">
                <label htmlFor="name">Nombre</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} />
              </div>

              <div className="inventory-field">
                <label htmlFor="category">Categoría</label>
                <input id="category" name="category" value={formData.category} onChange={handleChange} />
              </div>

              <div className="inventory-field">
                <label htmlFor="color">Color</label>
                <input id="color" name="color" value={formData.color} onChange={handleChange} />
              </div>

              <div className="inventory-field">
                <label htmlFor="size">Talla</label>
                <input id="size" name="size" value={formData.size} onChange={handleChange} />
              </div>

              <div className="inventory-field">
                <label htmlFor="stock">Stock</label>
                <input id="stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} />
              </div>

              <div className="inventory-field">
                <label htmlFor="rental_price">Precio de alquiler</label>
                <input id="rental_price" name="rental_price" type="number" min="0" value={formData.rental_price} onChange={handleChange} />
              </div>

              <div className="inventory-field">
                <label htmlFor="sale_price">Precio de venta</label>
                <input id="sale_price" name="sale_price" type="number" min="0" value={formData.sale_price} onChange={handleChange} />
              </div>

              <div className="inventory-field">
                <label htmlFor="status">Estado</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange}>
                  <option value="available">Disponible</option>
                  <option value="reserved">Reservado</option>
                  <option value="out_of_stock">Agotado</option>
                </select>
              </div>
            </div>

            <div className="inventory-field">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Guardando..." : "Crear prenda"}
            </button>
          </form>
        </section>

        <section className="inventory-panel">
          <h2 className="inventory-subtitle">Listado de prendas</h2>

          {items.length === 0 ? (
            <p>No hay prendas registradas.</p>
          ) : (
            <div className="inventory-table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Color</th>
                    <th>Talla</th>
                    <th>Stock</th>
                    <th>Alquiler</th>
                    <th>Venta</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.color || "-"}</td>
                      <td>{item.size || "-"}</td>
                      <td>{item.stock}</td>
                      <td>${Number(item.rental_price || 0).toLocaleString("es-CO")}</td>
                      <td>${Number(item.sale_price || 0).toLocaleString("es-CO")}</td>
                      <td>
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDelete(item.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Inventory;