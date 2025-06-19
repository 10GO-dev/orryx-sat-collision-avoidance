import { Await } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";



export default function Dashboard() {
    const [totalSatellites, setTotalSatellites] = useState([]);
    const [lastSync, setLastSync] = useState([]);
    const [error, setError] = useState("");
    const [closeApproachesCount, setcloseApproachesCount] = useState([]);
    const [topCollision, settopCollision] = useState([]);
    const [lasttleFetchTime, setLasttleFetchTime] = useState([]);

    // To fetch summary Dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
          try {
            // Fetch summary
            const summaryRes = await fetch("http://localhost:8000/api/summary");
            if (!summaryRes.ok) throw new Error("Failed to fetch summary");
            const summaryData = await summaryRes.json();
            console.log("Summary Data:", summaryData);
            setTotalSatellites(summaryData.total_satellites);
            setLastSync(summaryData.last_sync);
            setcloseApproachesCount(summaryData.collision_count);
            setLasttleFetchTime(summaryData.last_fetch_time);
          } catch (err) {
            setError(err.message);
          }
        };
    
        fetchDashboardData();
      }, []);

      

    //   To fetch top 5 close approaches from collisionAlert table
    useEffect(()=>{
        const fetchTopCloseApproaches = async () => {
            try {
                const approachRes = await fetch("http://localhost:8000/api/top-collision");
                if (!approachRes.ok) throw new Error("Failed to fetch top collision");
                const approacheData = await approachRes.json();
                settopCollision(approacheData);

            } catch(err){
                setError(err.message);
            }
        };

        fetchTopCloseApproaches();
    },[]);
    
     
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">🛰️ Satellite Dashboard</h1>
        <div className="grid grid-cols-3 gap-4 mb-10">
        <SummaryCard title="Total Satellites" value={totalSatellites} color="text-green-400" />
        <SummaryCard title="Predicted Close Approaches (Threshold: 100 km, Interval: 10 min)" value={closeApproachesCount} color="text-red-400" />
        <SummaryCard title="Last TLE Fetch Time" value={lasttleFetchTime} color="text-blue-400" />
        </div>
        <div className="mt-100">
        <h2 className="text-x1 font-semibold mb-4">Top 5 closest Approaches</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-300 bg-gray-800 border border-gray-700 rounded">
            <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Satellite A</th>
                <th className="px-4 py-2">Satellite B</th>
                <th className="px-4 py-2">Distance (km)</th>
                </tr>
            </thead>
            <tbody>
                {topCollision.map((item, index) => (
                <tr key={index} className="border-t border-gray-700 hover:bg-gray-900">
                    <td className="px-4 py-2">{item.time}</td>
                    <td className="px-4 py-2">{item.sat_a}</td>
                    <td className="px-4 py-2">{item.sat_b}</td>
                    <td className="px-4 py-2 text-red-400 font-medium">
                    {item.distance_km.toFixed(3)}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}

      </div>
    </div>
  );
}

function SummaryCard({ title, value, color }) {
    return (
      <div className="bg-gray-800 p-4 rounded shadow text-center">
        <h2 className="text-sm text-gray-400">{title}</h2>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    );
  }