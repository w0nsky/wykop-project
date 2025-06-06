import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const auth = useAuth();
  const user = auth?.user;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Extract search query from URL params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const s = urlParams.get("s");
    if (s) {
      setSearchQuery(s);
    }
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?s=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e);
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-sm c rounded-2xl">
      <div className="container mx-auto flex flex-row justify-between">
        <div className="flex-1">
          <Link to={"/"} className="btn btn-ghost text-xl">
            NovaF
          </Link>
        </div>
        <div className="flex gap-2">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              placeholder="Search"
              className="input input-bordered w-24 md:w-auto"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
            />
          </form>
          {user ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full flex justify-center items-center bg-slate-200">
                  <p className="text-3xl text-slate-500">
                    {user.username.slice(0, 1).toUpperCase()}
                  </p>
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
              >
                <li>
                  <Link to="/new">Nowy post</Link>
                </li>
                <li>
                  <Link to="/logout">Wyloguj się</Link>
                </li>
              </ul>
            </div>
          ) : (
            <Link className="my-auto uppercase" to={"/login"}>
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
