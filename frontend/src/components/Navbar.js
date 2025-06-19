import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-md flex justify-between items-center">

      <div className="space-x-6">
        <Link to="/" className="hover:text-blue-400">Dashboard</Link>
        <Link to="/check" className="hover:text-blue-400">Check</Link>
        <Link to="/map" className="hover:text-blue-400">Map</Link> {/* coming soon */}
      </div>
    </nav>
  );
}