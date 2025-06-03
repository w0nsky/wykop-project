import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import PostCard from "./postCard";
import Skeleton from "./Skeleton";

export default function PostGrid() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    async function getPosts() {
      try {
        setLoading(true);

        const urlParams = new URLSearchParams(location.search);
        const searchQuery = urlParams.get("s");

        let endpoint = "/api/posts/";
        if (searchQuery) {
          endpoint += `?search=${encodeURIComponent(searchQuery)}`;
        }

        const request = await api.get(endpoint);

        if (request.status === 200) {
          setPosts(request.data);
        } else {
          console.warn("Nieoczekiwany status:", request.status);
        }
      } catch (error) {
        console.error("Błąd pobierania postów:", error);
      } finally {
        setLoading(false);
      }
    }

    getPosts();
  }, [location.search]);

  const urlParams = new URLSearchParams(location.search);
  const searchQuery = urlParams.get("s");

  return (
    <div>
      {searchQuery && (
        <div className="mb-6 mt-4">
          <h2 className="text-2xl font-semibold mb-2">
            Wyniki dla: "{searchQuery}"
          </h2>
          <p className="text-gray-600">
            {loading
              ? "Szukanie..."
              : `Znaleziono ${posts.length} ${
                  posts.length !== 1 ? "wyników" : "wynik"
                }`}
          </p>
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 my-10 items-stretch min-h-[450px]">
        {loading
          ? [...Array(6)].map((_, i) => <Skeleton key={i} />)
          : posts.length > 0
          ? posts.map((post, i) => <PostCard key={i} post={post} />)
          : searchQuery && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  No posts found matching "{searchQuery}"
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try different keywords or browse all posts
                </p>
              </div>
            )}
      </div>
    </div>
  );
}
