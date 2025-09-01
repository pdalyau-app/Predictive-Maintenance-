// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import AssetDetail from "./pages/AssetDetail";
import Connections from "./pages/Connections";
import Alarms from "./pages/Alarms";
import WorkOrders from "./pages/WorkOrders";
import Schedule from "./pages/Schedule";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
        <Header />
        <main>
          {/* Outer container spans the viewport with comfortable gutters */}
          <div
            style={{
              width: "100%",
              padding: "0 24px",
              boxSizing: "border-box",
              margin: "12px 0 24px",
            }}
          >
            {/* Inner grid is wider (up to 1440px) and left+right centered */}
            <div
              style={{
                maxWidth: 1440,
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "260px 1fr",
                gap: 20,
              }}
            >
              <Sidebar />
              <div>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/assets/:assetId" element={<AssetDetail />} />
                  <Route path="/connections" element={<Connections />} />
                  <Route path="/alarms" element={<Alarms />} />
                  <Route path="/workorders" element={<WorkOrders />} />
                  <Route path="/schedule" element={<Schedule />} />
                </Routes>
              </div>
            </div>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
