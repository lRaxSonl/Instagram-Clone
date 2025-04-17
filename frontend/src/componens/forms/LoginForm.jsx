import React, { useState } from 'react';
import '../../css/AuthPage.css';

const LoginForm = ({ switchForm }) => {

    //Состояние для хранения значений полей
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    //Обработчик отправки формы
    const handleSubmit = (e) => {
    e.preventDefault();

    //Проверка на пустые поля (можно улучшить в будущем)
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }

    //Логика авторизации (например, запрос на сервер)
    //Здесь можно добавить API-запрос для реальной авторизации

    console.log('Авторизация с:', { email, password });
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
    <button type="submit" className="auth-btn">Sing in</button>
    </form>
    <div className="auth-footer">
        <span>Does not have a account | <button onClick={switchForm} className='switch-btn'>Sing up</button></span>
    </div>
    </>
)}

export default LoginForm;