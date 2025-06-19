import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CollisionChecker from "./pages/CollisionChecker";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/check" element={<CollisionChecker />} />
        {/* You can add a /map route later */}
      </Routes>
    </Router>
  );
}

export default App;