import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenExpired } from '../api/axiosInstance';
import { getRefreshToken } from '../api/auth';

const PrivateRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const access = localStorage.getItem('access');
      const refresh = localStorage.getItem('refresh');

      if (!access && !refresh) {
        setIsAuthorized(false);
        return;
      }

      if (!isTokenExpired(access)) {
        setIsAuthorized(true);
        return;
      }

      //if the access period has expired, we tried to update
      if (refresh && !isTokenExpired(refresh)) {
        try {
          const response = await getRefreshToken({ refresh });
          const newAccess = response.data.access;
          localStorage.setItem('access', newAccess);
          setIsAuthorized(true);
        } catch (err) {
          console.error('Error token update', err);
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
