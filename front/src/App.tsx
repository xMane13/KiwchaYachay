import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Materials from './pages/Materials';
import MaterialDetail from './pages/MaterialDetail';
import MyMaterials from './pages/MyMaterials';
import Favorites from './pages/Favorites';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import EmailConfirmation from './pages/auth/EmailConfirmation';
import Error404 from './pages/Error404';
import Error403 from './pages/Error403';
import AuthGuard from './components/AuthGuard';

// *** IMPORTA LA NUEVA PÁGINA ***
import MaterialUpload from './pages/MaterialUpload';

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/materials/:id" element={<MaterialDetail />} />
            <Route path="/my-materials" element={
              <AuthGuard>
                <MyMaterials />
              </AuthGuard>
            } />
            {/* ---- NUEVA RUTA PARA SUBIR MATERIAL ---- */}
            <Route path="/material-upload" element={
              <AuthGuard>
                <MaterialUpload />
              </AuthGuard>
            } />
            <Route path="/favorites" element={
              <AuthGuard>
                <Favorites />
              </AuthGuard>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:uid/:token/" element={<EmailConfirmation />} />
            <Route path="/403" element={<Error403 />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </Layout>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
