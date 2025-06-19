import { useState } from "react";
import Navbar from "../components/Navbar";


export default function CollisionChecker(){
  const [norad1, setNorad1] = useState("");
  const [norad2, setNorad2] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    setError("");
    setResults([]);
    try {
      const res = await fetch(`http://localhost:8000/api/collision?norad1=${norad1}&norad2=${norad2}`);
      if (!res.ok) throw new Error("One or both satellites not found");
      const data = await res.json();
      setResults(data.close_approaches);
      console.log(results)
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    
    <div className="min-h-screen bg-gray-900 text-white p-10">
        <Navbar />
      <h1 className="text-3xl font-bold mb-6">🛰️ Satellite Collision Checker</h1>
      
      <div className="flex gap-4 mb-6">
        <input
          className="px-4 py-2 rounded bg-gray-800 border border-gray-600 w-64"
          placeholder="Enter NORAD ID 1"
          value={norad1}
          onChange={(e) => setNorad1(e.target.value)}
        />
        <input
          className="px-4 py-2 rounded bg-gray-800 border border-gray-600 w-64"
          placeholder="Enter NORAD ID 2"
          value={norad2}
          onChange={(e) => setNorad2(e.target.value)}
        />
        <button
          onClick={handleCheck}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Check Collision
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {results.length > 0 ? (
        <table className="w-full border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="py-2 px-4 border border-gray-700">Time</th>
              <th className="py-2 px-4 border border-gray-700">Distance (km)</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => (
              <tr key={idx} className="bg-gray-700">
                <td className="py-2 px-4 border border-gray-800">{r.time}</td>
                <td className="py-2 px-4 border border-gray-800">{r.distance_km}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No close approaches found or not yet checked.</p>
      )}
    </div>
  );
}


