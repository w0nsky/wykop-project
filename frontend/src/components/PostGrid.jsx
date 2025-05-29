import { useEffect, useState } from "react";
import api from "../api";
import PostCard from "./postCard";
import Skeleton from "./Skeleton";

export default function PostGrid() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPosts() {
      try {
        const request = await api.get("/api/posts/");
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
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-10 items-stretch min-h-[450px]">
      {loading
        ? [...Array(6)].map((_, i) => <Skeleton key={i} />)
        : posts.map((post, i) => <PostCard key={i} post={post} />)}
    </div>
  );
}
