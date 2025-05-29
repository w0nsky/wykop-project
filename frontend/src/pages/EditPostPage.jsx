// src/pages/EditPostPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import LoadingIndicator from "../components/LoadingIndicator";
import PostEditor from "../components/PostEditor";
import { ACCESS_TOKEN } from "../constants";

export default function EditPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // formularz
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  // lista kategorii
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catsError, setCatsError] = useState("");

  // stany fetch/post
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // 1) Fetch existing post
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/api/posts/${slug}/`);
        setTitle(data.title);

        setContent(data.content);

        setCategory(data.category);

        setCurrentImage(data.image); // URL obrazka
      } catch (err) {
        console.error(err);
        setFetchError("Nie udało się wczytać danych posta.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // 2) Fetch categories
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/categories/");
        setCategories(data);
      } catch (err) {
        console.error(err);
        setCatsError("Nie udało się pobrać kategorii.");
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  // 3) Submit edycji
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitLoading(true);

    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setSubmitError("Musisz być zalogowany.");
      setSubmitLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);
    // jeśli wybrano nowy plik, dołącz go
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await api.put(`/api/posts/${slug}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/post/${slug}`);
    } catch (err) {
      console.error(err);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="flex justify-center py-12  min-h-screen">
      <div className="card w-full max-w-3xl shadow-lg bg-base-100">
        <div className="card-body space-y-6">
          <h2 className="card-title">Edytuj post</h2>

          {/* Błąd wczytywania */}
          {fetchError && (
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
              <span>{fetchError}</span>
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

            {/* Kategoria */}
            {loadingCats ? (
              <LoadingIndicator />
            ) : catsError ? (
              <div className="alert alert-error">
                <span>{catsError}</span>
              </div>
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
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}

            {/* Podgląd obecnego obrazka */}
            {currentImage && !imageFile && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Obecny obrazek:</p>
                <img
                  src={currentImage}
                  alt="Current"
                  className="w-32 h-32 object-cover rounded-md border"
                />
              </div>
            )}

            {/* Nowy plik */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
              className="file-input file-input-bordered w-full"
              disabled={submitLoading}
            />

            {/* Edytor Markdown live-preview */}
            <PostEditor initialContent={content} onChange={setContent} />

            {/* Błąd submit */}
            {submitError && (
              <div className="alert alert-error">
                <span>{submitError}</span>
              </div>
            )}

            {/* Akcje */}
            <div className="flex space-x-2">
              <button
                type="submit"
                className={`btn btn-primary flex-1 ${
                  submitLoading ? "loading" : ""
                }`}
                disabled={submitLoading}
              >
                Zapisz zmiany
              </button>
              <Link to={`/post/${slug}`} className="btn btn-outline flex-1">
                Anuluj
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
