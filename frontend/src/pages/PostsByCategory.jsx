import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import PostCard from "../components/postCard";
import Skeleton from "../components/Skeleton";

export default function PostsByCategory() {
  const { categoryName } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, status } = await api.get(
          `/api/posts/category/${categoryName}/`
        );
        if (status === 200) {
          setPosts(data);
        } else {
          console.warn("Nieoczekiwany status:", status);
        }
      } catch (err) {
        console.error("Błąd pobierania postów z kategorii:", err);
        setError("Nie udało się załadować postów dla tej kategorii.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [categoryName]);

  return (
    <div className="container mx-auto my-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Kategoria: {categoryName}</h1>
        <Link
          to="/"
          className="text-blue-500 hover:underline mt-2 inline-block"
        >
          ← Powrót do wszystkich postów
        </Link>
      </header>

      {loading && (
        <div className="grid grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p className="italic text-gray-600">Brak postów w tej kategorii.</p>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="grid grid-cols-3 gap-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
