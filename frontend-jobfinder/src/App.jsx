import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Vacancies from "./pages/Vacancies";
import Chat from "./pages/Chat";
import MyVacancies from "./pages/MyVacancies";
import CreateVacancy from "./pages/CreateVacancy";
import Layout from "./components/Layout";

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    );
  }

  return user ? <Navigate to="/vacancies" /> : children;
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="/vacancies" />} />
                <Route path="vacancies" element={<Vacancies />} />
                <Route path="chat" element={<Chat />} />
                <Route path="chat/:conversationId" element={<Chat />} />
                <Route path="my-vacancies" element={<MyVacancies />} />
                <Route path="create-vacancy" element={<CreateVacancy />} />
              </Route>
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
