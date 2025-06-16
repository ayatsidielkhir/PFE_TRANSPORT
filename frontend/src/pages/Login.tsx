import React, { useState } from 'react';
import './login.css';
import axios from '../utils/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../logoMme-.png';

const API = process.env.REACT_APP_API_URL;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);

      if (user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      }
    } catch (err) {
      toast.error('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-box" onSubmit={handleSubmit}>
        <img src={logo} alt="Logo MEXPRESS" className="login-logo" />
        <h2>Connexion Admin</h2>
        <input
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default Login;
