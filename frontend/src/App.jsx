import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from './componens/PrivateRoute';
import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';
import Logout from './pages/Logout';
import ProfilePage from './pages/ProfilePage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} /> {/* Маршрут для страницы входа */}

        <Route path='/feed' element={<PrivateRoute>
          <FeedPage />
        </PrivateRoute>} />

        <Route path='/logout' element={<Logout />} />

        <Route path="/profile/:slug" element={<PrivateRoute>
          <ProfilePage />
        </PrivateRoute>} />

      </Routes>
    </Router>
  );
};

export default App;