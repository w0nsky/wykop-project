import { useEffect, useState } from "react";
import api from "../api"; // Używamy wcześniej skonfigurowanego modułu api
import PostCommentForm from "./PostCommentForm";
import { useAuth } from "../context/AuthContext";

const PostComments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const auth = useAuth();

  // Funkcja pobierająca komentarze
  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/posts/${postId}/comments/`);
      setComments(response.data);
      setError("");
    } catch (err) {
      console.error("Błąd podczas pobierania komentarzy:", err);
      setError("Nie udało się pobrać komentarzy. Spróbuj ponownie później.");
    } finally {
      setLoading(false);
    }
  };

  // Pobierz komentarze przy montowaniu komponentu
  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Obsługa dodawania nowego komentarza
  const handleCommentAdded = (newComment) => {
    setComments((prevComments) => [newComment, ...prevComments]);
  };

  // Funkcja formatująca datę
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h2 className="text-xl font-bold mb-4">Komentarze ({comments.length})</h2>

      {/* Formularz komentarza tylko dla zalogowanych */}
      {auth?.user ? (
        <PostCommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p>Zaloguj się, aby dodać komentarz.</p>
        </div>
      )}

      {/* Wskaźnik ładowania */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="loader"></div>
        </div>
      )}

      {/* Komunikat o błędzie */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg my-3">
          {error}
        </div>
      )}

      {/* Lista komentarzy */}
      <div className="mt-6 space-y-4">
        {comments.length === 0 && !loading ? (
          <p className="text-gray-500 italic">
            Brak komentarzy. Bądź pierwszy!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                  <span className="text-sm font-bold text-gray-500">
                    {comment.username?.slice(0, 1).toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium">
                    {comment.user || "Użytkownik"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 pl-10">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Przycisk ładowania więcej komentarzy - można dodać w przyszłości */}
      {comments.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={fetchComments}
            className="text-blue-500 hover:text-blue-700"
          >
            Odśwież komentarze
          </button>
        </div>
      )}
    </div>
  );
};

export default PostComments;
