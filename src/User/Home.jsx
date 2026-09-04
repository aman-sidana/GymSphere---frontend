import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");

  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc"); 
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

  const [totalGyms, setTotalGyms] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchGyms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/gym/all`, {
        params: {
          search,
          sort,
          status: statusFilter !== "all" ? statusFilter : undefined,
          page,
          limit,
        },
      });

      if (res.data?.success || res.data?.gyms) {
        setGyms(res.data.gyms || []);
        setTotalGyms(res.data.totalGyms || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setGyms([]);
      }
    } catch (err) {
      console.error("Error fetching gyms:", err);
      setError("Failed to load gyms. Please check network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, [search, sort, statusFilter, page, limit]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleAuthAction = () => {
    if (token) {
      const role = currentUser?.role?.toLowerCase();
      if (role === "superadmin") navigate("/superadmin");
      else if (role === "admin") navigate("/admin");
      else if (role === "gym_manager") navigate("/manager");
      else if (role === "trainer") navigate("/trainer");
      else navigate("/user");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 text-left font-sans w-full">
      <div className="w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 mb-2">
              🏋️‍♂️ GymSphere Fitness Network
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
              Explore Gym Centers & Fitness Hubs
            </h1>
            <p className="text-slate-400 text-sm mt-1 m-0">
              Discover top-rated fitness facilities, verified gym locations, and active workout centers.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-lg">
                🏆
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Total Registered</div>
                <div className="text-sm font-bold text-white">{totalGyms} Gym Centers</div>
              </div>
            </div>

            <button
              onClick={handleAuthAction}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer border-none transform hover:scale-105 active:scale-95"
            >
              <span>{token ? "👤 Go to Dashboard" : "🔑 Login"}</span>
            </button>
          </div>
        </div>

        <div className="mt-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl w-full">
          <div className="relative w-full md:w-80">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search gyms by name, owner, email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-9 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-slate-800 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer border-none"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => handleStatusChange("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "all" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All Gyms
              </button>
              <button
                onClick={() => handleStatusChange("approved")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "approved" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => handleStatusChange("pending")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "pending" ? "bg-amber-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Pending
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={handleSortChange}
                className="bg-slate-950 border border-slate-700/80 text-slate-200 px-3 py-2 rounded-xl text-xs outline-none cursor-pointer focus:border-blue-500"
              >
                <option value="desc">Newest Added ⏱️</option>
                <option value="asc">Oldest Added ⏳</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button
              onClick={fetchGyms}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold cursor-pointer border-none"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-80 bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between animate-pulse"
              >
                <div className="w-full h-44 bg-slate-800"></div>
                <div className="p-4 space-y-3">
                  <div className="w-2/3 h-5 bg-slate-800 rounded"></div>
                  <div className="w-1/2 h-4 bg-slate-800 rounded"></div>
                  <div className="w-full h-4 bg-slate-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : gyms.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center max-w-lg mx-auto my-8 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mx-auto mb-4">
              🏋️
            </div>
            <h3 className="text-lg font-bold text-white m-0">No Gyms Found</h3>
            <p className="text-slate-400 text-xs mt-2 m-0">
              No fitness centers match your search <span className="text-blue-400">"{search}"</span> or filter selection.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPage(1);
              }}
              className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer border-none shadow-lg shadow-blue-600/30"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {gyms.map((gym) => {
              const mainImage = gym.images && gym.images.length > 0 ? gym.images[0] : null;
              const locationText = [gym.cityId?.cityName, gym.stateId?.stateName].filter(Boolean).join(", ") || gym.address || "India";

              return (
                <div
                  key={gym._id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative w-full h-44 bg-slate-950 overflow-hidden">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={gym.gymName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-950 flex flex-col items-center justify-center">
                          <span className="text-4xl mb-1">🏋️‍♂️</span>
                          <span className="text-xs text-slate-500 font-semibold">GymSphere Certified</span>
                        </div>
                      )}

                      <div className="absolute top-3 right-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-lg backdrop-blur-md ${
                            gym.status === "approved"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : gym.status === "pending"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                              : "bg-red-500/20 text-red-400 border border-red-500/40"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              gym.status === "approved" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                            }`}
                          ></span>
                          {gym.status || "Approved"}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 max-w-[85%]">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-950/80 text-slate-200 backdrop-blur-md border border-slate-800 truncate">
                          📍 {locationText}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors m-0 tracking-tight">
                        {gym.gymName}
                      </h3>
                      <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">👤 Owner:</span>
                          <strong className="text-white">{gym.ownerName}</strong>
                        </div>
                        {gym.email && (
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-slate-400">✉️ Email:</span>
                            <span className="text-slate-300 truncate">{gym.email}</span>
                          </div>
                        )}
                        {gym.phone && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">📞 Phone:</span>
                            <span className="text-slate-300">{gym.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between">
                    <div className="text-xs text-slate-400 flex items-center gap-1 pt-3">
                      <span>💪 Members:</span>
                      <strong className="text-emerald-400 font-bold">{gym.memberCount || 0} registered</strong>
                    </div>

                    <span className="text-[11px] font-semibold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 pt-3">
                      View Details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 flex flex-wrap justify-between items-center text-xs gap-3 shadow-xl">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-slate-400 font-medium">
              Showing <span className="text-white font-bold">{gyms.length}</span> of{" "}
              <span className="text-white font-bold">{totalGyms}</span> gyms (Page{" "}
              <span className="text-blue-400 font-bold">{page}</span> of {totalPages})
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Cards per page:</span>
              <select
                value={limit}
                onChange={handleLimitChange}
                className="bg-slate-950 border border-slate-700/80 text-slate-200 px-2.5 py-1 rounded-lg text-xs outline-none cursor-pointer focus:border-blue-500"
              >
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors shadow-sm"
            >
              ← Previous
            </button>

            <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-bold text-xs">
              {page} / {totalPages}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors shadow-sm"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
