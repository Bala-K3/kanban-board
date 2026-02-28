import { useAuth } from "./context/AuthContext";
import AuthForm from "./components/auth/AuthForm";
import KanbanBoard from "./components/board/KanbanBoard";

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "Poppins, sans-serif", color: "#888" }}>
      Loading...
    </div>
  );

  if (!user) return <AuthForm />;
  return <KanbanBoard />;
};

export default App;
