import React, { useState } from 'react';
import LoginForm from '../componens/forms/LoginForm';
import RegisterForm from '../componens/forms/RegisterForm';
import '../css/authPage.css';
import logo from '../img/logo/InstaClone_logo-removebg.png'


const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)

  const switchForm = () => {
    setIsLogin((prev) => !prev);
  }

  return (
    <div className="auth-container">
    <div className="auth-image">
      <img src={logo} alt="Instagram Clone" />
    </div>
    <div className="auth-box">
      <h1 className="auth-title">InstaClone</h1>
      {isLogin ? (
        <LoginForm switchForm={switchForm} />
      ) : (
        <RegisterForm switchForm={switchForm} />
      )}
    </div>
  </div>
  );
};

export default AuthPage;
