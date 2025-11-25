'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);
    if (success) {
      navigate('/home');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFC5C5 0%, #FFFFFF 23%)' }}>
      <div className="w-full max-w-md px-8">
        <div className="flex justify-center mb-8">
          <div className="flex gap-1">
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px]" style={{ borderBottomColor: '#B60000' }}></div>
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px]" style={{ borderBottomColor: '#B60000' }}></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>Welcome to Libbsy</h1>
          <p className="mb-6" style={{ color: '#929292' }}>Please sign in below with an admin account</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2" style={{ color: '#000000' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: '#EBEBEB', color: '#B3B3B3' }}
                placeholder="bobby.smith@csdata.com"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block mb-2" style={{ color: '#000000' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: '#EBEBEB', color: '#B3B3B3' }}
                placeholder="bobby.smith@csdata.com"
                required
              />
            </div>
            
            {error && (
              <div className="mb-4 text-sm" style={{ color: '#DF0000' }}>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-3 rounded-lg text-white font-semibold"
              style={{ backgroundColor: '#B60000' }}
            >
              Log in
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="mb-2" style={{ color: '#000000' }}>Having issues logging in?</p>
            <p style={{ color: '#DF0000' }}>Please contact contact@csdata.com</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between text-sm" style={{ color: '#929292' }}>
          <span>Developed by CS 4347 Team 4</span>
          <span>2025 @ Libbsy</span>
        </div>
      </div>
    </div>
  );
}

