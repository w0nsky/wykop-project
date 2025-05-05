import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  const excerpt = post.content.split(" ").slice(0, 10).join(" ");

  return (
    <div className="card bg-base-100 shadow-sm">
      <figure>
        <img
          src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
          alt="Shoes"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{post.title}</h2>
        <p>{excerpt}</p>
        <Link to={post.title}>Zobacz więcej</Link>
      </div>
    </div>
  );
}
