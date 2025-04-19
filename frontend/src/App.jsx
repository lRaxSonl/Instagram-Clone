import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from './componens/PrivateRoute';
import AuthPage from './pages/AuthPage';
import PostsPage from './pages/PostsPage';
import Logout from './pages/Logout';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} /> {/* Маршрут для страницы входа */}

        <Route path='/posts' element={<PrivateRoute>
          <PostsPage />
        </PrivateRoute>} />

        <Route path='/logout' element={<Logout />} />

      </Routes>
    </Router>
  );
};

export default App;