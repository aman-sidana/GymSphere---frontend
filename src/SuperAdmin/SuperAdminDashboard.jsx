import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SuperAdminOverview from "./SuperAdminOverview";
import LocationManagement from "./LocationManagement";
import AdminManagement from "./AdminManagement";
import GymManagement from "./GymManagement";

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || null;
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentuser");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row text-left">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div>
          <div className="mb-6 pb-4 border-b border-slate-800">
            <h1 className="text-lg font-bold text-white flex items-center gap-2 m-0 p-0">
              🏋️‍♂️ <span>SuperAdmin</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 m-0">Platform Owner Console</p>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("overview")}
            >
              <span className="text-base">📊</span> Dashboard
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "locations"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("locations")}
            >
              <span className="text-base">🗺️</span> Locations
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "admins"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("admins")}
            >
              <span className="text-base">👨‍💼</span> Admins
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "gyms"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("gyms")}
            >
              <span className="text-base">🏋️</span> Gyms
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80 mt-6">
          <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-2xl flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentUser?.profileImage ? (
                <img
                  src={currentUser.profileImage}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border-2 border-blue-500/50 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-blue-400/30">
                  {(currentUser?.name || "SuperAdmin").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate m-0 p-0">
                  {currentUser?.name || "Super Admin"}
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase m-0 mt-0.5 truncate">
                  SUPER ADMIN
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer shrink-0 flex items-center justify-center active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
        {activeTab === "overview" && <SuperAdminOverview />}
        {activeTab === "locations" && <LocationManagement />}
        {activeTab === "admins" && <AdminManagement />}
        {activeTab === "gyms" && <GymManagement />}
      </main>
    </div>
  );
}

export default SuperAdminDashboard;
