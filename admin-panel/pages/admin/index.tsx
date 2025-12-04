// pages/admin/index.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../lib/api";
import AnimeManager from "../../components/AnimeManager";

// --- Стили для Admin Panel ---
const styles = {
  container: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
    backgroundColor: "#f4f7f9", // Светлый фон
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    padding: "20px",
    borderBottom: "2px solid #e0e0e0",
    backgroundColor: "#ffffff", // Белый фон для шапки
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  headerTitle: {
    margin: 0,
    color: "#333",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    marginRight: "15px",
    border: "2px solid #007bff",
    objectFit: "cover" as const,
  },
  logoutButton: {
    padding: "8px 15px",
    backgroundColor: "#dc3545", // Красный для выхода
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  loading: {
    padding: "50px",
    textAlign: "center" as const,
    fontSize: "1.5em",
    color: "#555",
  },
};
// -----------------------------

export default function Admin() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const response = await api.get("/api/admin-check");
      if (response.data.is_admin) {
        setIsAdmin(true);
        setUser(response.data.user);
      } else {
        router.push("/login");
      }
    } catch (error: any) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      window.location.href = "/login";
    } catch (error) {
      console.error("Ошибка logout:", error);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <h2>Загрузка...</h2>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>✅ Админ панель</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Добро пожаловать, {user?.name}!
          </p>
        </div>
        <div style={styles.userInfo}>
          <img src={user?.avatar} alt="Avatar" style={styles.avatar} />
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#c82333")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#dc3545")
            }
          >
            Выйти
          </button>
        </div>
      </header>

      <main>
        <AnimeManager />
      </main>
    </div>
  );
}
