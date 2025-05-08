import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  const excerpt = post.content.split(" ").slice(0, 10).join(" ");

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
        <h2 className="card-title">{post.title}</h2>
        <p>{excerpt}</p>
        <Link to={`/post/${post.slug}`}>Zobacz więcej</Link>
      </div>
    </div>
  );
}
