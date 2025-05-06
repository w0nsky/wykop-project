import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const auth = useAuth();
  const user = auth?.user;

  return (
    <div className="navbar bg-base-100 shadow-sm c rounded-2xl">
      <div className="container mx-auto flex flex-row justify-between">
        <div className="flex-1">
          <Link to={"/"} className="btn btn-ghost text-xl">
            Wykop project
          </Link>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-24 md:w-auto"
          />
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
                  <a className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </a>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li>
                  <Link to="/logout">Log out</Link>
                </li>
              </ul>
            </div>
          ) : (
            <Link to={"/login"}>Login</Link>
          )}
        </div>
      </div>
    </div>
  );
}
