import React, { useState } from 'react';
import '../../css/authPage.css';
import { getToken } from '../../api/auth';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const LoginForm = ({ switchForm }) => {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    //Form handler
    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }

    try {
        const response = await getToken({ email, password })

        //save tokens
        localStorage.setItem('access', response.data.access)
        localStorage.setItem('refresh', response.data.refresh)

        axios.defaults.headers.Authorization = `Bearer ${response.data.access}`;

        //Redirect to posts
        navigate('/feed')
    }catch (err) {
        //console.error(err);
        setError('Invalid email or password');
    }

  };

  return (
   <>
   <form onSubmit={handleSubmit} className="auth-form">
    {error && <div className="error-message">{error}</div>}
    <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="auth-input"
        required
    />
    <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="auth-input"
        required
    />
    <button type="submit" className="auth-btn">Sign in</button>
    </form>
    <div className="auth-footer">
        <span>Don't not have a account | <button onClick={switchForm} className='switch-btn'>Sing up</button></span>
    </div>
    </>
)}

export default LoginForm;
