import { useNavigate } from "react-router-dom";
import { signOut } from "../../services/auth";
import "./sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-top">
          <button className="menu-button" type="button" aria-label="Open menu">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <button
            type="button"
            className="sidebar-brand-button"
            onClick={() => navigate("/inicio")}
          >
            <h2 className="sidebar-brand">Fiestarte</h2>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li onClick={() => navigate("/inicio")}>Inicio</li>
            <li onClick={() => navigate("/facturacion")}>Facturacion</li>
            <li onClick={() => navigate("/agenda")}>Agenda</li>
            <li onClick={() => navigate("/prendas")}>Prendas</li>
            <li>Personalizacion</li>
          </ul>
        </nav>
      </div>

      <button className="logout-button" type="button" onClick={handleLogout}>
        <span className="logout-icon">
          <span className="logout-arrow"></span>
        </span>
        Cerrar sesion
      </button>
    </aside>
  );
}

export default Sidebar;