import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

function SuperAdminOverview() {
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalGyms: 0,
    totalMembers: 0,
    totalAdminEarnings: 0,
    totalGymEarnings: 0,
  });

  const [adminSearch, setAdminSearch] = useState("");
  const [adminSort, setAdminSort] = useState("desc");
  const [adminPage, setAdminPage] = useState(1);
  const [adminLimit, setAdminLimit] = useState(5);
  const [adminData, setAdminData] = useState([]);
  const [totalAdminPages, setTotalAdminPages] = useState(1);
  const [totalAdminsCount, setTotalAdminsCount] = useState(0);

  const [gymSearch, setGymSearch] = useState("");
  const [gymSort, setGymSort] = useState("desc");
  const [gymPage, setGymPage] = useState(1);
  const [gymLimit, setGymLimit] = useState(5);
  const [gymData, setGymData] = useState([]);
  const [totalGymPages, setTotalGymPages] = useState(1);
  const [totalGymsCount, setTotalGymsCount] = useState(0);

  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await axios.get(`${API_BASE}/superadmin/dashboard-stats`);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAdminEarnings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/superadmin/admin-earnings`, {
        params: {
          search: adminSearch,
          sort: adminSort,
          page: adminPage,
          limit: adminLimit,
        },
      });
      if (res.data?.success) {
        setAdminData(res.data.adminEarnings || []);
        setTotalAdminPages(res.data.totalPages || 1);
        setTotalAdminsCount(res.data.totalAdmins || 0);
      }
    } catch (err) {
      console.error("Error fetching admin earnings:", err);
    }
  };

  const fetchGymEarnings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/superadmin/gym-earnings`, {
        params: {
          search: gymSearch,
          sort: gymSort,
          page: gymPage,
          limit: gymLimit,
        },
      });
      if (res.data?.success) {
        setGymData(res.data.gymEarnings || []);
        setTotalGymPages(res.data.totalPages || 1);
        setTotalGymsCount(res.data.totalGyms || 0);
      }
    } catch (err) {
      console.error("Error fetching gym earnings:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchAdminEarnings();
  }, [adminSearch, adminSort, adminPage, adminLimit]);

  useEffect(() => {
    fetchGymEarnings();
  }, [gymSearch, gymSort, gymPage, gymLimit]);

  const getBadgeStyle = (status) => {
    const s = (status || "approved").toLowerCase();
    if (s === "approved" || s === "active") {
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    }
    if (s === "pending") {
      return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
    }
    return "bg-red-500/15 text-red-400 border border-red-500/30";
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Admins</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">
              👨‍💼
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white my-1.5">
            {loadingStats ? "..." : stats.totalAdmins}
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            Active platform admins
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Gyms</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">
              🏋️‍♂️
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white my-1.5">
            {loadingStats ? "..." : stats.totalGyms}
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            Registered fitness centers
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Gym Members</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">
              👥
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white my-1.5">
            {loadingStats ? "..." : stats.totalMembers}
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            Active gym subscribers
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Admin Earnings</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">
              💰
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white my-1.5">
            ₹{loadingStats ? "..." : stats.totalAdminEarnings.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            Total admin commission
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Gym Revenue</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">
              🏦
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white my-1.5">
            ₹{loadingStats ? "..." : stats.totalGymEarnings.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            Total revenue earned by gyms
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white m-0">📊 Admin Earnings Analytics</h2>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 mb-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap flex-1">
            <div className="relative min-w-[200px] flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Search admin by name, email..."
                value={adminSearch}
                onChange={(e) => {
                  setAdminSearch(e.target.value);
                  setAdminPage(1);
                }}
              />
            </div>
            <select
              className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
              value={adminSort}
              onChange={(e) => setAdminSort(e.target.value)}
            >
              <option value="desc">Earnings: High to Low</option>
              <option value="asc">Earnings: Low to High</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-700">
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">#</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Admin Name</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Email</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Phone</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Status</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Earned Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/80">
              {adminData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-400">
                    No admin earnings data found.
                  </td>
                </tr>
              ) : (
                adminData.map((admin, idx) => (
                  <tr key={admin._id || idx} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-3.5 py-2.5 text-slate-300">{(adminPage - 1) * adminLimit + idx + 1}</td>
                    <td className="px-3.5 py-2.5 font-semibold text-white">{admin.name}</td>
                    <td className="px-3.5 py-2.5 text-slate-300">{admin.email}</td>
                    <td className="px-3.5 py-2.5 text-slate-300">{admin.phone}</td>
                    <td className="px-3.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${getBadgeStyle(admin.status)}`}>
                        {admin.status || "approved"}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-bold text-emerald-400">
                      ₹{(admin.earnedAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex flex-wrap justify-between items-center px-3.5 py-2.5 bg-slate-900 border-t border-slate-700 text-xs gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-slate-400">
                Showing {adminData.length} of {totalAdminsCount} admins (Page {adminPage} of {totalAdminPages})
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Rows per page:</span>
                <select
                  className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 rounded-lg text-xs outline-none cursor-pointer focus:border-blue-500"
                  value={adminLimit}
                  onChange={(e) => {
                    setAdminLimit(Number(e.target.value));
                    setAdminPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                disabled={adminPage <= 1}
                onClick={() => setAdminPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="text-xs px-2 text-slate-300">
                {adminPage} / {totalAdminPages}
              </span>
              <button
                className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                disabled={adminPage >= totalAdminPages}
                onClick={() => setAdminPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white m-0">🏋️ Gym Revenue & Earnings</h2>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 mb-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap flex-1">
            <div className="relative min-w-[200px] flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Search gym by name, owner..."
                value={gymSearch}
                onChange={(e) => {
                  setGymSearch(e.target.value);
                  setGymPage(1);
                }}
              />
            </div>
            <select
              className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
              value={gymSort}
              onChange={(e) => setGymSort(e.target.value)}
            >
              <option value="desc">Earnings: High to Low</option>
              <option value="asc">Earnings: Low to High</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-700">
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">#</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Gym Name</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Owner Name</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Managing Admin</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Members Count</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Status</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Total Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/80">
              {gymData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-400">
                    No gym earnings data found.
                  </td>
                </tr>
              ) : (
                gymData.map((gym, idx) => (
                  <tr key={gym._id || idx} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-3.5 py-2.5 text-slate-300">{(gymPage - 1) * gymLimit + idx + 1}</td>
                    <td className="px-3.5 py-2.5 font-semibold text-white">{gym.gymName}</td>
                    <td className="px-3.5 py-2.5 text-slate-300">{gym.ownerName}</td>
                    <td className="px-3.5 py-2.5 text-slate-300">{gym.adminId?.name || "Direct Platform"}</td>
                    <td className="px-3.5 py-2.5 text-slate-300">{gym.memberCount || 0} members</td>
                    <td className="px-3.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${getBadgeStyle(gym.status)}`}>
                        {gym.status || "approved"}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-bold text-emerald-400">
                      ₹{(gym.earnings || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex flex-wrap justify-between items-center px-3.5 py-2.5 bg-slate-900 border-t border-slate-700 text-xs gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-slate-400">
                Showing {gymData.length} of {totalGymsCount} gyms (Page {gymPage} of {totalGymPages})
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Rows per page:</span>
                <select
                  className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 rounded-lg text-xs outline-none cursor-pointer focus:border-blue-500"
                  value={gymLimit}
                  onChange={(e) => {
                    setGymLimit(Number(e.target.value));
                    setGymPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                disabled={gymPage <= 1}
                onClick={() => setGymPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="text-xs px-2 text-slate-300">
                {gymPage} / {totalGymPages}
              </span>
              <button
                className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                disabled={gymPage >= totalGymPages}
                onClick={() => setGymPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminOverview;
