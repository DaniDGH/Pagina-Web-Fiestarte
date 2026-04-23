import { useNavigate } from "react-router-dom";
import Sidebar from "../../Sidebar/sidebar";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Facturacion",
      description: "Crea facturas, registra ventas o alquileres y genera PDF.",
      path: "/facturacion",
    },
    {
      title: "Agenda",
      description: "Consulta eventos, revisa notas y actualiza estados.",
      path: "/agenda",
    },
    {
      title: "Prendas",
      description: "Administra el inventario de vestidos, trajes y accesorios.",
      path: "/prendas",
    },
    {
      title: "Personalizacion",
      description: "Configura opciones visuales y ajustes del sistema.",
      path: "/personalizacion",
      disabled: true,
    },
  ];

  return (
    <div className="home-page">
      <Sidebar />

      <main className="home-content">
        <section className="home-hero">
          <p className="home-kicker">Panel principal</p>
          <h1 className="home-title">Bienvenida a Fiestarte</h1>
          <p className="home-subtitle">
            Selecciona el módulo con el que deseas trabajar. Desde aquí puedes
            gestionar la facturación, la agenda y el inventario del sistema.
          </p>
        </section>

        <section className="home-modules">
          {modules.map((module) => (
            <button
              key={module.title}
              type="button"
              className={`home-card ${module.disabled ? "home-card-disabled" : ""}`}
              onClick={() => {
                if (!module.disabled) {
                  navigate(module.path);
                }
              }}
              disabled={module.disabled}
            >
              <h2>{module.title}</h2>
              <p>{module.description}</p>
              <span className="home-card-action">
                {module.disabled ? "Proximamente" : "Abrir modulo"}
              </span>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Home;