import { useMemo, useState } from "react";
import Sidebar from "../../Sidebar/sidebar";
import { saveColorHistory } from "../../../services/colorAssistant";
import "./Personalizacion.css";

const skinToneRecommendations = {
  clara: {
    label: "Piel clara",
    recommendedColors: ["Azul cielo", "Rosa pastel", "Lavanda", "Verde menta", "Rojo suave"],
    avoidedColors: ["Beige muy claro", "Amarillo pálido"],
    suggestedStyle: "Tonos suaves y colores fríos que generen contraste delicado.",
  },
  media: {
    label: "Piel media",
    recommendedColors: ["Coral", "Turquesa", "Verde esmeralda", "Azul rey", "Fucsia"],
    avoidedColors: ["Marrón apagado", "Gris opaco"],
    suggestedStyle: "Colores vivos y equilibrados que resalten el tono natural de la piel.",
  },
  morena: {
    label: "Piel morena",
    recommendedColors: ["Dorado", "Naranja quemado", "Vino tinto", "Blanco", "Verde oliva"],
    avoidedColors: ["Café oscuro muy similar al tono de piel"],
    suggestedStyle: "Colores cálidos, intensos y contrastantes.",
  },
  oscura: {
    label: "Piel oscura",
    recommendedColors: ["Amarillo mostaza", "Blanco", "Rojo intenso", "Azul eléctrico", "Plateado"],
    avoidedColors: ["Negro total sin contraste", "Marrón muy oscuro"],
    suggestedStyle: "Colores brillantes y de alto contraste para destacar la presencia visual.",
  },
};

function Personalizacion() {
  const [customerName, setCustomerName] = useState("");
  const [skinTone, setSkinTone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const recommendation = useMemo(() => {
    if (!skinTone) return null;
    return skinToneRecommendations[skinTone];
  }, [skinTone]);

  const handleSave = async () => {
    setMessage("");

    if (!customerName.trim()) {
      setMessage("Debes ingresar el nombre del cliente.");
      return;
    }

    if (!recommendation) {
      setMessage("Debes seleccionar un tono de piel.");
      return;
    }

    setSaving(true);

    const payload = {
      customer_name: customerName,
      skin_tone: recommendation.label,
      recommended_colors: recommendation.recommendedColors,
      avoided_colors: recommendation.avoidedColors,
      suggested_style: recommendation.suggestedStyle,
    };

    const { error } = await saveColorHistory(payload);

    if (error) {
      console.error("Color assistant save error:", error);
      setMessage("No se pudo guardar la asesoría.");
      setSaving(false);
      return;
    }

    setMessage("Asesoría guardada correctamente.");
    setCustomerName("");
    setSkinTone("");
    setSaving(false);
  };

  return (
    <div className="personalizacion-page">
      <Sidebar />

      <main className="personalizacion-content">
        <section className="personalizacion-panel">
          <h1>Asistente de colorimetría</h1>
          <p>
            Ingresa el tono de piel del cliente para obtener colores sugeridos
            que pueden favorecerle en prendas y accesorios.
          </p>

          <div className="personalizacion-form">
            <div className="personalizacion-field">
              <label htmlFor="customerName">Nombre del cliente</label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="personalizacion-field">
              <label htmlFor="skinTone">Tono de piel</label>
              <select
                id="skinTone"
                value={skinTone}
                onChange={(e) => setSkinTone(e.target.value)}
              >
                <option value="">Selecciona una opción</option>
                <option value="clara">Piel clara</option>
                <option value="media">Piel media</option>
                <option value="morena">Piel morena</option>
                <option value="oscura">Piel oscura</option>
              </select>
            </div>

            {recommendation && (
              <div className="recommendation-card">
                <h2>{recommendation.label}</h2>

                <h3>Colores recomendados</h3>
                <div className="color-list">
                  {recommendation.recommendedColors.map((color) => (
                    <span key={color} className="color-pill">
                      {color}
                    </span>
                  ))}
                </div>

                <h3>Colores a evitar</h3>
                <div className="color-list">
                  {recommendation.avoidedColors.map((color) => (
                    <span key={color} className="color-pill muted">
                      {color}
                    </span>
                  ))}
                </div>

                <h3>Recomendación de estilo</h3>
                <p>{recommendation.suggestedStyle}</p>
              </div>
            )}

            {message && <p className="personalizacion-message">{message}</p>}

            <button
              type="button"
              className="personalizacion-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar asesoría"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Personalizacion;