import Link from 'next/link';
import { Fragment } from 'react';
import { Home } from 'lucide-react';

export const Header = () => {
  const navLinks = [
    { href: '/', text: 'Home' },
  ];

  return (
    <div className="flex flex-row h-full">
      <header className="bg-background text-white flex flex-col justify-between items-center h-full p-[1rem] rounded-[1rem] border border-[#EBEBEB]">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-[2rem]">
          <Link href="/">
            <img src="/Logo.png" alt="Logo" className="h-8" />
          </Link>

            <nav>
            <ul className="bg-[#F6F6F6] p-[0.5rem] rounded-[0.25rem]">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <Home
                    color='#DF0000'
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div>
          <Link href="/login" className="hover:underline font-black">
            Login
          </Link>
        </div>
      </header>
    </div>
  );
};