import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../Sidebar/sidebar";
import {
  getAgendaEntries,
  updateAgendaStatus,
} from "../../../services/billing";
import "./Agenda.css";

function Agenda() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");

  useEffect(() => {
    loadAgenda();
  }, []);

  const loadAgenda = async () => {
    setLoading(true);

    const { data, error } = await getAgendaEntries();

    if (error) {
      console.error("Agenda fetch error:", error);
      setErrorMessage("No se pudo cargar la agenda.");
      setLoading(false);
      return;
    }

    setEntries(data || []);
    setLoading(false);
  };

  const handleStatusChange = async (agendaId, currentStatus) => {
    let nextStatus = "pendiente";

    if (currentStatus === "pendiente") {
      nextStatus = "en proceso";
    } else if (currentStatus === "en proceso") {
      nextStatus = "finalizado";
    } else if (currentStatus === "finalizado") {
      nextStatus = "pendiente";
    }

    const { error } = await updateAgendaStatus(agendaId, nextStatus);

    if (error) {
      console.error("Agenda status update error:", error);
      setErrorMessage("No se pudo actualizar el estado.");
      return;
    }

    await loadAgenda();
  };

  const filteredEntries = useMemo(() => {
    const normalizedFilter = invoiceFilter.trim();

    if (!normalizedFilter) {
      return entries;
    }

    return entries.filter((entry) =>
      String(entry.order_id).includes(normalizedFilter)
    );
  }, [entries, invoiceFilter]);

  return (
    <div className="agenda-page">
      <Sidebar />

      <main className="agenda-content">
        <section className="agenda-panel">
          <div className="agenda-header">
            <h1 className="agenda-title">Agenda</h1>

            <div className="agenda-filter-box">
              <label htmlFor="invoiceFilter">Filtrar por número de factura</label>
              <input
                id="invoiceFilter"
                type="text"
                placeholder="Ej: 12"
                value={invoiceFilter}
                onChange={(e) => setInvoiceFilter(e.target.value)}
              />
            </div>
          </div>

          {errorMessage && <p className="agenda-error">{errorMessage}</p>}

          {loading ? (
            <p>Cargando agenda...</p>
          ) : filteredEntries.length === 0 ? (
            <p>
              {invoiceFilter.trim()
                ? "No hay resultados para ese número de factura."
                : "No hay eventos registrados."}
            </p>
          ) : (
            <div className="agenda-table-wrapper">
              <table className="agenda-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Nota</th>
                    <th>Fecha</th>
                    <th>Deposito</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.order_id}</td>
                      <td>{entry.customer_name}</td>
                      <td>{entry.notes || "-"}</td>
                      <td>{entry.event_date || "-"}</td>
                      <td>
                        $
                        {Number(
                          entry.order?.deposit_amount || 0
                        ).toLocaleString("es-CO")}
                      </td>
                      <td>{entry.status}</td>
                      <td>
                        <button
                          type="button"
                          className="agenda-status-button"
                          onClick={() =>
                            handleStatusChange(entry.id, entry.status)
                          }
                        >
                          Cambiar estado
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

export default Agenda;