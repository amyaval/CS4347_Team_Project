'use client';

import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';

export default function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-row px-[2rem] py-[2rem]">
        <Header />
        <Header />
        {/* <aside className="w-20 min-h-screen p-4" style={{ backgroundColor: '#F6F6F6' }}>
          <div className="flex flex-col items-center">
            <div className="mb-8 flex gap-1">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[25px]" style={{ borderBottomColor: '#B60000' }}></div>
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[25px]" style={{ borderBottomColor: '#B60000' }}></div>
            </div>
            <div className="mb-4" style={{ color: '#B60000' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <div className="mt-auto" style={{ color: '#B60000' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
        </aside> */}
        
        <main className="flex-1">
          {/* <header className="h-16 border-b flex items-center justify-end px-6 gap-4" style={{ borderColor: '#EBEBEB' }}>
            <button className="px-4 py-2 rounded" style={{ color: '#000000' }}>Check In</button>
            <button className="px-4 py-2 rounded" style={{ color: '#000000' }}>Catalog</button>
            <button className="px-4 py-2 rounded" style={{ color: '#000000' }}>Find User</button>
            <button className="px-4 py-2 rounded text-white" style={{ backgroundColor: '#B60000' }}>Check Out</button>
            <button onClick={handleLogout} className="px-4 py-2 rounded" style={{ color: '#000000' }}>Logout</button>
          </header> */}
          
          {/* <div className="p-6">
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#000000' }}>Dashboard</h1>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="Quick search for a book"
                className="w-full max-w-md px-4 py-2 border rounded-lg"
                style={{ borderColor: '#EBEBEB', color: '#B3B3B3' }}
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg border" style={{ borderColor: '#EBEBEB' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: '#B60000' }}>Number of Users</span>
                  <span style={{ color: '#B60000' }}>ℹ</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: '#000000' }}>17</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border" style={{ borderColor: '#EBEBEB' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: '#B60000' }}>Circulation</span>
                  <span style={{ color: '#B60000' }}>ℹ</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: '#000000' }}>17</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border" style={{ borderColor: '#EBEBEB' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: '#B60000' }}>Items Checked Out</span>
                  <span style={{ color: '#B60000' }}>ℹ</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: '#000000' }}>17</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border" style={{ borderColor: '#EBEBEB' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: '#B60000' }}>Total Fines</span>
                  <span style={{ color: '#B60000' }}>ℹ</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: '#000000' }}>$17.00</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#000000' }}>Books</h2>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-lg border flex items-center justify-between" style={{ borderColor: '#EBEBEB' }}>
                      <div>
                        <p className="font-semibold" style={{ color: '#000000' }}>Houses of Wiliamsurg, Virginia</p>
                        <p className="text-sm" style={{ color: '#929292' }}>0923398364</p>
                        <p className="text-sm" style={{ color: '#929292' }}>John Smith</p>
                      </div>
                      <button className={`px-4 py-1 rounded text-white ${i === 3 ? 'bg-red-400' : 'bg-green-400'}`}>
                        {i === 3 ? 'Out' : 'In'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#000000' }}>Recent Users</h2>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-lg border flex items-center justify-between" style={{ borderColor: '#EBEBEB' }}>
                      <div>
                        <p className="font-semibold" style={{ color: '#000000' }}>FirstName Last Name</p>
                        <p className="text-sm" style={{ color: '#929292' }}>399999999999999</p>
                        <p className="text-sm" style={{ color: '#929292' }}>1600 Jade Street, Frisco Texas 75033</p>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#000000' }}>
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div> */}
        </main>
      </div>
    </div>
  );
}

