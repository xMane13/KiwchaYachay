import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle } from 'lucide-react';

const EmailConfirmation: React.FC = () => {
  const { t } = useTranslation();
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    // Llama a tu backend para verificar la cuenta
    const verify = async () => {
      setStatus('loading');
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/verify-email/${uid}/${token}/`,
          { method: 'GET' }
        );
        if (res.ok) {
          setStatus('success');
          // Puedes hacer aquí un redirect automático tras unos segundos, si lo deseas
          // setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
        }
      } catch (e) {
        setStatus('error');
      }
    };
    if (uid && token) {
      verify();
    } else {
      setStatus('error');
    }
    // eslint-disable-next-line
  }, [uid, token]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('common.loading')}...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.register.verifyEmail') || 'Verificando cuenta...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              status === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {status === 'success' ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <XCircle className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'success' ? t('auth.emailConfirmation.success') : t('auth.emailConfirmation.error')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {status === 'success' 
              ? t('auth.register.checkInbox') || 'Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.'
              : 'El enlace de verificación es inválido o ha expirado. Solicita un nuevo enlace.'
            }
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="text-purple-600 hover:text-purple-500 font-medium"
            >
              {t('auth.emailConfirmation.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
