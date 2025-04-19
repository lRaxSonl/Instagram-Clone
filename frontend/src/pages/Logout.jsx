import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    //Delete tokens
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');

    //Redirect to login page
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
};

export default Logout;
