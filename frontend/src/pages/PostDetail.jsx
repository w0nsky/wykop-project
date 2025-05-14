import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import LoadingIndicator from "../components/LoadingIndicator";
import PostComments from "../components/PostComments"; // Dodajemy import komponentu komentarzy

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const auth = useAuth();

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await api.get(`/api/posts/${slug}/`);
        setPost(response.data);

        // If post has a category, fetch category details

        response.data.category && setCategory(response.data.category);
        console.log(response.data.category);

        setError(null);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(
          "Nie udało się pobrać posta. Sprawdź czy podany slug jest prawidłowy."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingIndicator />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg my-4">
        <h2 className="text-xl font-bold mb-2">Błąd</h2>
        <p>{error}</p>
        <Link
          to="/"
          className="text-blue-500 hover:underline mt-4 inline-block"
        >
          Wróć do strony głównej
        </Link>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden my-6">
      {post.image && (
        <div className="w-full h-64 bg-gray-300 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/800x400?text=Brak+obrazka";
            }}
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <div className="mb-2 sm:mb-0">
            {category && (
              <Link
                to={`/category/${category}`}
                className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-2"
              >
                {category}
              </Link>
            )}
            <h1 className="text-2xl font-bold text-gray-800">{post.title}</h1>
          </div>
          <div className="text-sm text-gray-500">
            <p>Dodano: {formattedDate}</p>
            <p>Komentarzy: {post.comment_count}</p>
          </div>
        </div>

        <div className="prose max-w-none my-6">
          <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link
              to="/"
              className="text-blue-500 hover:underline flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Powrót do listy
            </Link>

            {auth?.user && post.user === auth.user.id && (
              <div className="flex space-x-2">
                <Link
                  to={`/edit-post/${post.slug}`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                >
                  Edytuj
                </Link>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  onClick={() => {
                    if (
                      window.confirm("Czy na pewno chcesz usunąć ten post?")
                    ) {
                      // Delete logic here
                    }
                  }}
                >
                  Usuń
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Comments section */}
        <PostComments postId={post.id} />
      </div>
    </div>
  );
}
