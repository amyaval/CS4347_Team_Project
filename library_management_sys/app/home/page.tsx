'use client';

import { Header } from '../components/Header';
import { MainCard } from '../components/MainCard';

export default function Home() {
  return (
    <div className="h-screen bg-gradient-to-tr from-[#FFF9F8] to-[#FFF4F4] overflow-hidden">
      <div className="flex flex-row h-full space-x-4 px-[2rem] py-[2rem]">
        <Header />
        <main className="flex-1">
          <MainCard />
        </main>
      </div>
    </div>
  );
}