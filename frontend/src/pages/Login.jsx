import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#f1f2f6] via-[#dfe6e9] to-[#a4b0be]">
      <form className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm space-y-6" onSubmit={handleLogin}>
        <h2 className="text-3xl font-semibold text-gray-800 text-center">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <div>
          <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6305a] focus:border-[#d6305a] transition duration-300"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6305a] focus:border-[#d6305a] transition duration-300"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#d6305a] text-white py-3 rounded-lg hover:bg-[#bf2a4f] transition duration-200"
        >
          Login
        </button>

       
      </form>
    </div>
  );
}
