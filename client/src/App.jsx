import { Routes, Route } from "react-router-dom";
import MealsProvider from "./context/MealsProvider";
import AuthProvider from "./context/AuthProvider";
import { useMeals } from "./context/mealsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Categories from "./pages/Categories";
import Gallery from "./pages/Gallery";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Feedback from "./pages/Feedback";

function Gate({ children }) {
  const { status } = useMeals();

  if (status === "loading") {
    return (
      <p className="status">
        Loading meals…
        <br />
        The server can take up to a minute to wake up on the first visit.
      </p>
    );
  }
  if (status === "error") {
    return (
      <p className="status">
        Couldn't load the meals. Check that the server is running, then refresh.
      </p>
    );
  }
  return children;
}

export default function App() {
  return (
    <MealsProvider>
      <Gate>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gallery/:category"
              element={
                <ProtectedRoute>
                  <Gallery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Gate>
    </MealsProvider>
  );
}