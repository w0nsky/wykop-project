import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function getCategories() {
      try {
        const request = await api.get("/api/categories/");
        if (request.status === 200) {
          setCategories(request.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Błąd pobierania kategorii:", error);
      }
    }
    getCategories();
  }, []);

  return (
    <footer className="footer sm:footer-horizontal bg-base-200 text-base-content p-10">
      <div className="container mx-auto flex flex-row justify-between min-h-40">
        <aside>
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
            className="fill-current"
          >
            <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM4 19V5h16v14H4z" />
            <path d="M6 7h12v2H6zm0 4h12v2H6zm0 4h8v2H6z" />
          </svg>
          <p>
            NovaF
            <br />
            Łączymy ludzi przez treści od 2025
          </p>
        </aside>
        <nav className="flex flex-col">
          <h6 className="footer-title">Kategorie</h6>
          <Link to="/" className="link link-hover">
            Wszystkie posty
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.name}`}
              className="link link-hover"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
