import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/admin');
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Gagal login. Pastikan Anda menggunakan akun yang terdaftar sebagai Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-4">
       <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
          <h1 className="text-3xl font-serif font-bold text-brand-dark mb-2">Admin CMS</h1>
          <p className="text-gray-500 mb-8">Silakan login untuk mengelola konten website Gipang Cilegon.</p>
          
          {error && <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-xl text-sm text-left">{error}</div>}

          <button
             onClick={handleLogin}
             disabled={loading}
             className="w-full flex items-center justify-center p-4 bg-brand-dark text-white rounded-xl hover:bg-brand-caramel-dark transition-colors disabled:opacity-50"
          >
             {loading ? 'Memproses...' : 'Login dengan Google'}
          </button>
       </div>
    </div>
  );
}
