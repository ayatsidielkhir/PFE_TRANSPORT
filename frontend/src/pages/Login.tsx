import React, { useState } from 'react';
import './login.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { email, password });
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
    <div>
      <div className="login-wrapper">
        <form className="login-box" onSubmit={handleSubmit}>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={2000} aria-label="toast" />
      </div>
  );
};

export default Login;
