import Link from 'next/link';
import { Fragment } from 'react';

export const Header = () => {
  const navLinks = [
    { href: '/', text: 'Home' },
    { href: '/about', text: 'About' },
    { href: '/contact', text: 'Contact' },
    { href: '/book_search', text: 'Catalog' },
  ];

  return (
    <div className="flex flex-row">
      <header className="bg-gray-800 text-white flex-col justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <img src="/logo.png" alt="Logo" className="h-8 mr-2" />
          </Link>
        </div>

        <nav>
          <ul className="flex space-x-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <Link href="/login" className="hover:underline">
            Login
          </Link>
        </div>
      </header>
    </div>
  );
};