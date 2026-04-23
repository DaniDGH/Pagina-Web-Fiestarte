import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getSession } from "../services/auth";

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await getSession();

      setSession(data.session);
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (!session) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;