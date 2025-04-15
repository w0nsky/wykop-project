import React, { useState } from "react";
import { login } from "../lib/auth";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      setLoggedIn(true);
    } else {
      setError(result.error);
    }
  };

  if (loggedIn) {
    return (
      <div>
        <h2>Zalogowano pomyślnie!</h2>
        {/* Możesz przekierować lub wyświetlić inne treści */}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Logowanie</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Hasło"
        required
      />
      <button type="submit">Zaloguj</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default LoginForm;
