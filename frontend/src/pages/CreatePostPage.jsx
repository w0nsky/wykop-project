// src/pages/CreatePostPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import PostEditor from "../components/PostEditor";
import LoadingIndicator from "../components/LoadingIndicator";
import { ACCESS_TOKEN } from "../constants";

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catsError, setCatsError] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const navigate = useNavigate();

  // 1) Pobierz kategorie
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/categories/");
        setCategories(data);
      } catch (err) {
        console.error(err);
        setCatsError("Nie udało się pobrać listy kategorii.");
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  // 2) Obsługa submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitLoading(true);

    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setSubmitError("Musisz być zalogowany, aby utworzyć post.");
      setSubmitLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);
    if (imageFile) formData.append("image", imageFile);

    try {
      await api.post("/api/posts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      // Spróbuj wyciągnąć szczegóły błędu z odpowiedzi
      const detail =
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})
          .flat()
          .join(" ") ||
        "Coś poszło nie tak.";
      setSubmitError(detail);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-12  min-h-screen">
      <div className="card w-full max-w-3xl shadow-lg bg-base-100">
        <div className="card-body space-y-6">
          <h2 className="card-title">Nowy post</h2>

          {/* Błąd pobierania kategorii */}
          {catsError && (
            <div className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
                />
              </svg>
              <span>{catsError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tytuł */}
            <input
              type="text"
              placeholder="Tytuł posta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full"
              disabled={submitLoading}
              required
            />

            {/* Wybór kategorii */}
            {loadingCats ? (
              <LoadingIndicator />
            ) : (
              <select
                className="select select-bordered w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={submitLoading}
                required
              >
                <option value="">Wybierz kategorię</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}

            {/* Obraz */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
              className="file-input file-input-bordered w-full"
              disabled={submitLoading}
            />

            {/* Edytor Markdown */}
            <PostEditor value={content} onChange={setContent} />

            {/* Błąd submit */}
            {submitError && (
              <div className="alert alert-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
                  />
                </svg>
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className={`btn btn-primary w-full ${
                submitLoading ? "loading" : ""
              }`}
              disabled={submitLoading}
            >
              Utwórz post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
