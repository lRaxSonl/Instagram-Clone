import React, { useState } from 'react';
import '../../css/AuthPage.css';

const RegisterForm = ({ switchForm }) => {

    //Состояние для хранения значений полей
    const [username , setUseraname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    //Обработчик отправки формы
    const handleSubmit = (e) => {
    e.preventDefault();

    //Проверка на пустые поля (можно улучшить в будущем)
    if (!username || !email || !password) {
      setError('Пожалуйста, заполните все поля.');
      return;
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
        onChange={(e) => setUseraname(e.target.value)}
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
    <button type="submit" className="auth-btn">Sing up</button>
    </form>
    <div className="auth-footer">
        <span>Already have a account | <button onClick={switchForm} className='switch-btn'>Sing in</button></span>
    </div>
    </>
)}


export default RegisterForm;
