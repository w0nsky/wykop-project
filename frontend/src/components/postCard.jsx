import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <figure>
        <img
          src={post.image}
          alt="Shoes"
          className="h-64 w-full object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">
          <Link to={`/post/${post.slug}`}>{post.title}</Link>
        </h2>
        {post.category && (
          <Link
            to={`/category/${post.category}`}
            className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm w-min font-medium mb-2"
          >
            {post.category}
          </Link>
        )}

        <Link to={`/post/${post.slug}`}>Zobacz więcej</Link>
      </div>
    </div>
  );
}
