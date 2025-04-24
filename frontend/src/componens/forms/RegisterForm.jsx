import React, { useState } from 'react';
import '../../css/AuthPage.css';
import { registerUser } from '../../api/users';
import { getToken } from '../../api/auth';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const RegisterForm = ({ switchForm }) => {

    const navigate = useNavigate();
    const [username , setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    //Form handler
    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
        const regResponse = await registerUser({ email, username, password })
        
        if (regResponse.status === 201) {
            const response = await getToken({ email, password })

            if (response.status === 200) {
                //save tokens
                localStorage.setItem('access', response.data.access)
                localStorage.setItem('refresh', response.data.refresh)

                axios.defaults.headers.Authorization = `Bearer ${response.data.access}`;

                //Redirect to posts
                navigate('/feed')
            }
        }
    }catch (err) {
        console.error(err)
        setError("Something error")
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
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="auth-input"
        required
    />
    <input
        type="text"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="auth-input"
        required
    />
    <button type="submit" className="auth-btn">Sign up</button>
    </form>
    <div className="auth-footer">
        <span>Already have a account | <button onClick={switchForm} className='switch-btn'>Sign in</button></span>
    </div>
    </>
)}


export default RegisterForm;
