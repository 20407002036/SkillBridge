/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}
