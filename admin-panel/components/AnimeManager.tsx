// components/AnimeManager.tsx

import { useState, useEffect } from "react";
import api from "../lib/api";

// Описываем, как выглядит объект аниме
interface Anime {
  id: string;
  title: string;
  genre: string;
  description: string;
  imageUrl: string;
}

// Начальное состояние для пустой формы
const initialFormState = {
  id: "",
  title: "",
  genre: "",
  description: "",
  imageUrl: "",
};

// --- Стили для AnimeManager ---
const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  },
  formCard: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    borderLeft: "5px solid #007bff", // Акцентный цвет
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "600",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    minHeight: "100px",
    boxSizing: "border-box" as const,
    resize: "vertical" as const,
    transition: "border-color 0.2s",
  },
  buttonPrimary: {
    padding: "10px 20px",
    background: "#007bff", // Синий для основного действия
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  buttonSecondary: {
    marginLeft: "10px",
    padding: "10px 20px",
    background: "#6c757d", // Серый для отмены
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  buttonDanger: {
    marginLeft: "10px",
    padding: "8px 12px",
    background: "#dc3545", // Красный для удаления
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  buttonEdit: {
    padding: "8px 12px",
    background: "#ffc107", // Желтый для редактирования
    color: "#333",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  error: {
    color: "#dc3545",
    background: "#f8d7da",
    border: "1px solid #f5c6cb",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "20px",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "separate" as const,
    borderSpacing: "0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  tableHeader: {
    background: "#007bff",
    color: "white",
  },
  th: {
    padding: "15px",
    textAlign: "left" as const,
    fontWeight: "700",
  },
  tr: {
    transition: "background-color 0.2s",
  },
  td: {
    padding: "12px 15px",
    borderBottom: "1px solid #eee",
  },
  image: {
    borderRadius: "4px",
    objectFit: "cover" as const,
    width: "60px",
    height: "60px",
  },
};
// -----------------------------

export default function AnimeManager() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Состояние для данных формы
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  // Загружаем список аниме при первом рендере компонента
  useEffect(() => {
    fetchAnime();
  }, []);

  const fetchAnime = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/anime");
      setAnimeList(response.data);
    } catch (err: any) {
      setError("Ошибка: Не удалось загрузить список аниме.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      if (isEditing) {
        // Обновляем существующее аниме
        await api.put(`/api/anime/${formData.id}`, formData);
      } else {
        // Создаем новое
        await api.post("/api/anime", formData);
      }
      resetForm();
      await fetchAnime(); // Обновляем список
    } catch (err: any) {
      setError(err.response?.data?.error || "Произошла ошибка при сохранении.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (anime: Anime) => {
    setIsEditing(true);
    setFormData(anime);
    window.scrollTo(0, 0); // Прокручиваем страницу наверх к форме
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить это аниме?")) {
      try {
        await api.delete(`/api/anime/${id}`);
        await fetchAnime(); // Обновляем список
      } catch (err: any) {
        setError(err.response?.data?.error || "Ошибка удаления.");
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormData(initialFormState);
  };

  return (
    <div style={styles.container}>
      {/* Форма добавления/редактирования */}
      <div style={styles.formCard}>
        <h3>
          {isEditing ? "✏️ Редактировать аниме" : "✨ Добавить новое аниме"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Название</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Жанр</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              style={styles.textarea}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>URL изображения</label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.buttonPrimary,
              backgroundColor: isEditing ? "#28a745" : "#007bff", // Зеленый для сохранения, Синий для добавления
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = isEditing
                ? "#1e7e34"
                : "#0056b3")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = isEditing
                ? "#28a745"
                : "#007bff")
            }
          >
            {isSubmitting
              ? "Сохранение..."
              : isEditing
              ? "Сохранить изменения"
              : "Добавить аниме"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              style={styles.buttonSecondary}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#5a6268")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#6c757d")
              }
            >
              Отмена
            </button>
          )}
        </form>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <h2>📋 Список аниме</h2>
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Изображение</th>
              <th style={styles.th}>Название</th>
              <th style={styles.th}>Жанр</th>
              <th style={styles.th}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {animeList.map((anime, index) => (
              <tr
                key={anime.id}
                style={{
                  ...styles.tr,
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff", // Чередование строк
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e9ecef")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    index % 2 === 0 ? "#f9f9f9" : "#ffffff")
                }
              >
                <td style={styles.td}>
                  <img
                    src={anime.imageUrl}
                    alt={anime.title}
                    style={styles.image}
                  />
                </td>
                <td style={styles.td}>{anime.title}</td>
                <td style={styles.td}>{anime.genre}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleEdit(anime)}
                    style={styles.buttonEdit}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e0a800")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#ffc107")
                    }
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(anime.id)}
                    style={styles.buttonDanger}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#c82333")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#dc3545")
                    }
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
