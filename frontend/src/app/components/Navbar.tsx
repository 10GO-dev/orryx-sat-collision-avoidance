"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg tracking-wide">Sat Collision Avoidance</span>
      </div>
      <div className="flex gap-4">
        <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
        <Link href="/collision-checker" className="hover:text-blue-400 transition-colors">Collision Checker</Link>
        <Link href="/top-collisions" className="hover:text-blue-400 transition-colors">Top Collisions</Link>
      </div>
    </nav>
  );
}
