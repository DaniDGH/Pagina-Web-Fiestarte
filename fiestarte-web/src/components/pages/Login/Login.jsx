import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../../../services/auth";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const { data, error } = await signIn(
      formData.email,
      formData.password
    );

    if (error) {
      setErrorMessage("Credenciales incorrectas");
      console.error(error);
      return;
    }

    if (data?.session) {
      navigate("/inicio");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <p className="login-title">Login</p>

        <h1 className="login-brand">Fiestarte</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Correo</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
            />
          </div>

          {errorMessage && (
            <p style={{ color: "red" }}>{errorMessage}</p>
          )}

          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;