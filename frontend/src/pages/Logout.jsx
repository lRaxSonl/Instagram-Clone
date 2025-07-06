import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addRefreshTokenToBlacklist } from '../api/auth';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      const refreshToken = localStorage.getItem('refresh');

      // Удаляем токены
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');

      // Отправляем refresh-токен в чёрный список
      if (refreshToken) {
        try {
          await addRefreshTokenToBlacklist({ refresh_token: refreshToken });
        } catch (error) {
          console.error('Не удалось добавить токен в чёрный список', error);
        }
      }

      // Перенаправляем пользователя
      navigate('/', { replace: true });
    };

    handleLogout();
  }, [navigate]);

  return null;
};

export default Logout;