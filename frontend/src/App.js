import React, { useState } from "react";

function App() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const login = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    console.log(data);

    // 🔥 guardar token
    if (data.access) {
      localStorage.setItem("token", data.access);
      alert("Login exitoso");
    } else {
      alert("Error en login");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login</h1>

      <input
        name="username"
        placeholder="Username"
        onChange={handleChange}
      /><br />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      /><br />

      <br />
      <button onClick={login}>
        Iniciar sesión
      </button>
    </div>
  );
}

export default App;