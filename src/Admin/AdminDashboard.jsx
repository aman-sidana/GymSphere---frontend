import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || null;
  const [activeTab, setActiveTab] = useState("overview"); 
  const [selectedGymId, setSelectedGymId] = useState("all");
  const [adminGyms, setAdminGyms] = useState([]);
  const [stats, setStats] = useState({
    totalGyms: 0,
    totalManagers: 0,
    totalTrainers: 0,
    totalMembers: 0,
    totalEarnings: 0,
  });

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [dataList, setDataList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedItemDetails, setSelectedItemDetails] = useState(null);

  const [gymForm, setGymForm] = useState({
    gymName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    stateId: "",
    districtId: "",
    cityId: "",
    images: [],
  });

  const [userForm, setUserForm] = useState({
    name: "", email: "", password: "", phone: "", gymId: "", profileImage: "",
  });

  const [planForm, setPlanForm] = useState({
    planName: "", durationMonths: 1, price: 999, description: "", gymId: "",
  });

  const fetchLocationDropdowns = async () => {
    try {
      const [stRes, dstRes, ctRes] = await Promise.all([
        axios.get(`${API_BASE}/state/all`, { params: { limit: 1000 } }),
        axios.get(`${API_BASE}/district/all`, { params: { limit: 1000 } }),
        axios.get(`${API_BASE}/city/all`, { params: { limit: 1000 } }),
      ]);
      setStatesList(stRes.data?.states || []);
      setDistrictsList(dstRes.data?.districts || []);
      setCitiesList(ctRes.data?.cities || []);
    } catch (err) {
      console.error("Error fetching location dropdowns:", err);
    }
  };

  useEffect(() => {
    fetchLocationDropdowns();
  }, []);

  const fetchDashboard = async () => {
    try {
      const adminId = currentUser?.role === "admin" ? currentUser?._id : undefined;
      const res = await axios.get(`${API_BASE}/admin-role/dashboard`, {
        params: { adminId, gymId: selectedGymId },
      });
      if (res.data?.success) {
        setStats(res.data.stats);
        if (res.data.adminGyms) setAdminGyms(res.data.adminGyms);
      }
    } catch (err) {
      console.error("Error fetching admin dashboard:", err);
    }
  };

  const fetchTabData = async () => {
    try {
      let endpoint = "";
      if (activeTab === "gyms") endpoint = `${API_BASE}/admin-role/gym/all`;
      else if (activeTab === "managers") endpoint = `${API_BASE}/admin-role/manager/all`;
      else if (activeTab === "trainers") endpoint = `${API_BASE}/admin-role/trainer/all`;
      else if (activeTab === "members") endpoint = `${API_BASE}/admin-role/member/all`;
      else if (activeTab === "plans") endpoint = `${API_BASE}/admin-role/membership-plan/all`;
      else return;

      const adminId = currentUser?.role === "admin" ? currentUser?._id : undefined;

      const res = await axios.get(endpoint, {
        params: {
          adminId,
          search,
          sort,
          gymId: selectedGymId,
          page,
          limit,
        },
      });

      if (res.data?.success) {
        const listKey = activeTab === "gyms" ? "gyms"
          : activeTab === "managers" ? "managers"
            : activeTab === "trainers" ? "trainers"
              : activeTab === "members" ? "members" : "plans";

        const countKey = activeTab === "gyms" ? "totalGyms"
          : activeTab === "managers" ? "totalManagers"
            : activeTab === "trainers" ? "totalTrainers"
              : activeTab === "members" ? "totalMembers" : "totalPlans";

        setDataList(res.data[listKey] || []);
        setTotalRecords(res.data[countKey] || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching tab data:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedGymId]);

  useEffect(() => {
    setPage(1);
    fetchTabData();
  }, [activeTab, selectedGymId, search, sort, limit]);

  useEffect(() => {
    fetchTabData();
  }, [page]);

  const handleGymImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append(`file${i}`, files[i]);
    }

    try {
      setUploading(true);
      const res = await axios.post(`${API_BASE}/upload/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.urls) {
        setGymForm((prev) => ({
          ...prev,
          images: [...prev.images, ...res.data.urls],
        }));
      }
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post(`${API_BASE}/upload/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.urls?.[0]) {
        setUserForm((prev) => ({ ...prev, profileImage: res.data.urls[0] }));
      }
    } catch (err) {
      alert("Profile image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddGymSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...gymForm,
        adminId: gymForm.adminId || (currentUser?.role === "admin" ? currentUser?._id : undefined),
      };
      await axios.post(`${API_BASE}/admin-role/gym/add`, payload);
      alert("Gym add request submitted to SuperAdmin for approval!");
      setShowModal(false);
      setGymForm({
        gymName: "", ownerName: "", email: "", phone: "", address: "",
        stateId: "", districtId: "", cityId: "", images: [],
      });
      fetchTabData();
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add gym");
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === "managers"
        ? `${API_BASE}/admin-role/manager/add`
        : `${API_BASE}/admin-role/trainer/add`;

      await axios.post(endpoint, userForm);
      setShowModal(false);
      setUserForm({ name: "", email: "", password: "", phone: "", gymId: "", profileImage: "" });
      fetchTabData();
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add user");
    }
  };

  const handleAddPlanSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin-role/membership-plan/add`, planForm);
      setShowModal(false);
      setPlanForm({ planName: "", durationMonths: 1, price: 999, description: "", gymId: "" });
      fetchTabData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add plan");
    }
  };

  const handleSoftDeleteGym = async (id) => {
    try {
      await axios.patch(`${API_BASE}/admin-role/gym/soft-delete/${id}`);
      fetchTabData();
    } catch (err) {
      alert("Soft delete failed");
    }
  };

  const handleRestoreGym = async (id) => {
    try {
      await axios.patch(`${API_BASE}/admin-role/gym/restore/${id}`);
      fetchTabData();
    } catch (err) {
      alert("Restore failed");
    }
  };

  const handleDeleteGym = async (id) => {
    if (!window.confirm("Hard delete this gym?")) return;
    try {
      await axios.delete(`${API_BASE}/admin-role/gym/delete/${id}`);
      fetchTabData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleDeleteManager = async (id) => {
    if (!window.confirm("Delete this manager?")) return;
    try {
      await axios.delete(`${API_BASE}/admin-role/manager/delete/${id}`);
      fetchTabData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentuser");
    navigate("/");
  };

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row text-left">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div>
          <div className="mb-5 pb-4 border-b border-slate-800">
            <h1 className="text-lg font-bold text-white flex items-center gap-2 m-0 p-0">
              💼 <span>Admin Console</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 m-0">Gym Owner Management</p>
          </div>

          <div className="mb-5 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">🏛️ Select Gym Context:</label>
            <select
              className="w-full bg-slate-900 text-white border border-blue-500/80 px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer"
              value={selectedGymId}
              onChange={(e) => setSelectedGymId(e.target.value)}
            >
              <option value="all">🌟 All Owned Gyms</option>
              {adminGyms.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.gymName} ({g.status})
                </option>
              ))}
            </select>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("overview")}
            >
              <span className="text-base">📊</span> Dashboard Analytics
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "gyms"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("gyms")}
            >
              <span className="text-base">🏋️</span> Manage Gyms
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "managers"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("managers")}
            >
              <span className="text-base">👔</span> Gym Managers
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "trainers"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("trainers")}
            >
              <span className="text-base">💪</span> Trainers
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "members"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("members")}
            >
              <span className="text-base">👥</span> Members
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "plans"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("plans")}
            >
              <span className="text-base">💳</span> Membership Plans
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
                  {(currentUser?.name || "Admin").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate m-0 p-0">
                  {currentUser?.name || "Gym Admin"}
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase m-0 mt-0.5 truncate">
                  ADMIN
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Gyms Count</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">🏋️‍♂️</div>
          </div>
          <div className="text-2xl font-extrabold text-white my-1.5">{stats.totalGyms}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">Active & Pending Gyms</div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Managers</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">👔</div>
          </div>
          <div className="text-2xl font-extrabold text-white my-1.5">{stats.totalManagers}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">Gym operational managers</div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Trainers</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">💪</div>
          </div>
          <div className="text-2xl font-extrabold text-white my-1.5">{stats.totalTrainers}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">Fitness trainers</div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Members</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">👥</div>
          </div>
          <div className="text-2xl font-extrabold text-white my-1.5">{stats.totalMembers}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">Enrolled subscribers</div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Earnings</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">💰</div>
          </div>
          <div className="text-2xl font-extrabold text-white my-1.5">₹{stats.totalEarnings.toLocaleString()}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">Filtered revenue</div>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700/80">
          <h2 className="text-lg font-bold text-white m-0">📈 Gym Performance Analytics</h2>
          <p className="text-xs text-slate-400 mt-1">
            Showing performance metrics for {selectedGymId === "all" ? "All Owned Gyms" : "Selected Gym"}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {adminGyms.map((gym) => (
              <div key={gym._id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-md">
                <h3 className="text-base font-bold text-blue-400 m-0 mb-2">{gym.gymName}</h3>
                <div className="text-xs text-slate-300">Status: <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${getBadgeStyle(gym.status)}`}>{gym.status}</span></div>
                <div className="text-xs text-slate-300 mt-1.5">Revenue: <strong className="text-emerald-400">₹{(gym.earnings || 0).toLocaleString()}</strong></div>
                <div className="text-xs text-slate-300 mt-1">Members: <strong>{gym.memberCount || 0}</strong></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab !== "overview" && (
        <div>
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 mb-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap flex-1">
              <div className="relative min-w-[200px] flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={`Search ${activeTab}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="desc">Newest / High First</option>
                <option value="asc">Oldest / Low First</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              {(activeTab === "gyms" || activeTab === "managers" || activeTab === "trainers" || activeTab === "plans") && (
                <button
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border-none"
                  onClick={() => setShowModal(true)}
                >
                  ➕ Add New {activeTab.slice(0, -1)}
                </button>
              )}
            </div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                {activeTab === "gyms" && (
                  <tr className="bg-slate-900 border-b border-slate-700">
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">#</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Gym Name</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Owner Name</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Contact</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Location</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Status</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Images</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Actions</th>
                  </tr>
                )}
                {activeTab === "managers" && (
                  <tr className="bg-slate-900 border-b border-slate-700">
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">#</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Manager Name</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Email</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Phone</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Gym</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Actions</th>
                  </tr>
                )}
                {activeTab === "trainers" && (
                  <tr className="bg-slate-900 border-b border-slate-700">
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">#</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Profile</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Trainer Name</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Email</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Phone</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Gym</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Actions</th>
                  </tr>
                )}
                {activeTab === "members" && (
                  <tr className="bg-slate-900 border-b border-slate-700">
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">#</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Member Name</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Email</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Gym</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Assigned Trainer</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Plan</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Actions</th>
                  </tr>
                )}
                {activeTab === "plans" && (
                  <tr className="bg-slate-900 border-b border-slate-700">
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">#</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Plan Name</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Duration</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Price</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Description</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Actions</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-700/80">
                {dataList.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-slate-400">
                      No {activeTab} data found.
                    </td>
                  </tr>
                ) : (
                  dataList.map((item, idx) => (
                    <tr key={item._id || idx} className="hover:bg-slate-700/40 transition-colors">
                      <td className="px-3.5 py-2.5 text-slate-300">{(page - 1) * limit + idx + 1}</td>

                      {activeTab === "gyms" && (
                        <>
                          <td className="px-3.5 py-2.5 font-semibold text-white">{item.gymName}</td>
                          <td className="px-3.5 py-2.5 text-slate-300">{item.ownerName}</td>
                          <td className="px-3.5 py-2.5 text-slate-300">{item.email} ({item.phone})</td>
                          <td className="px-3.5 py-2.5 text-slate-300">
                            {item.cityId?.cityName || ""}{item.cityId ? ", " : ""}
                            {item.districtId?.districtName || ""}{item.districtId ? ", " : ""}
                            {item.stateId?.stateName || "Location not set"}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${getBadgeStyle(item.status)}`}>{item.status}</span>
                            {item.isDeleted && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize bg-red-500/15 text-red-400 border border-red-500/30 ml-1">Soft Deleted</span>}
                          </td>
                          <td className="px-3.5 py-2.5">
                            {item.images && item.images.length > 0 ? (
                              <span className="text-blue-400 font-medium">📷 {item.images.length} uploaded</span>
                            ) : (
                              <span className="text-slate-400">No images</span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-sky-600 hover:bg-sky-500 text-white border-none" onClick={() => setSelectedItemDetails(item)}>👁️ View</button>
                              {!item.isDeleted ? (
                                <button className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-amber-600 hover:bg-amber-500 text-white border-none" onClick={() => handleSoftDeleteGym(item._id)}>Soft Delete</button>
                              ) : (
                                <button className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-emerald-600 hover:bg-emerald-500 text-white border-none" onClick={() => handleRestoreGym(item._id)}>Restore</button>
                              )}
                              <button className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-red-600 hover:bg-red-500 text-white border-none" onClick={() => handleDeleteGym(item._id)}>Delete</button>
                            </div>
                          </td>
                        </>
                      )}

                      {activeTab === "managers" && (
                        <>
                          <td className="px-3.5 py-2.5 font-semibold text-white">{item.name}</td>
                          <td className="px-3.5 py-2.5 text-slate-300">{item.email}</td>
                          <td className="px-3.5 py-2.5 text-slate-300">{item.phone}</td>
                          <td className="px-3.5 py-2.5 text-slate-300">{item.gymId?.gymName || "All Gyms"}</td>
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <button className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-sky-600 hover:bg-sky-500 text-white border-none" onClick={() => setSelectedItemDetails(item)}>👁️ View</button>
                              <button className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-red-600 hover:bg-red-500 text-white border-none" onClick={() => handleDeleteManager(item._id)}>Delete</button>
                            </div>
                          </td>
                        </>
                      )}

                      {activeTab === "trainers" && (
                        <>
                          <td className="px-3.5 py-2.5">
                            {item.profileImage ? (
                              <img src={item.profileImage} alt="" className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              "👤"
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 font-semibold text-white">{item.name}</td>
                          <td className="px-3.5 py-2.5 text-slate-300">{item.email}</td>
                          <td className="px-3.5 py-2.5 text-slate-300">{item.phone}</td>
                          <td className="px-3.5 py-2.5 text-slate-300">{item.gymId?.gymName || "All Gyms"}</td>
                          <td className="px-3.5 py-2.5">
                            <button className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-sky-600 hover:bg-sky-500 text-white border-none" onClick={() => setSelectedItemDetails(item)}>👁️ View Details</button>
                          </td>
                        </>
                      )}

                      {activeTab === "members" && (
                        <>
                          <td className="px-3.5 py-2.5 font-semibold text-white">{item.name}</td>
                          <td className="px-3.5 py-2.5 text-slate-300">{item.email}</td>
                          <td className="px-3.5 py-2.5 text-slate-300">{item.gymId?.gymName || "Unassigned"}</td>
                          <td className="px-3.5 py-2.5">
                            {item.assignedTrainerId?.name ? (
                              <span className="text-purple-400 font-bold flex items-center gap-1">💪 {item.assignedTrainerId.name}</span>
                            ) : (
                              <span className="text-slate-500 italic">Not assigned</span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-300">{item.membershipPlanId?.planName || "Standard"}</td>
                          <td className="px-3.5 py-2.5">
                            <button className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-sky-600 hover:bg-sky-500 text-white border-none" onClick={() => setSelectedItemDetails(item)}>👁️ View Details</button>
                          </td>
                        </>
                      )}

                      {activeTab === "plans" && (
                        <>
                          <td className="px-3.5 py-2.5 font-semibold text-white">{item.planName}</td>
                          <td className="px-3.5 py-2.5 text-slate-300">{item.durationMonths} Months</td>
                          <td className="px-3.5 py-2.5 text-emerald-400 font-bold">₹{item.price}</td>
                          <td className="px-3.5 py-2.5 text-slate-300">{item.description || "-"}</td>
                          <td className="px-3.5 py-2.5">
                            <button className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-sky-600 hover:bg-sky-500 text-white border-none" onClick={() => setSelectedItemDetails(item)}>👁️ View Details</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex flex-wrap justify-between items-center px-3.5 py-2.5 bg-slate-900 border-t border-slate-700 text-xs gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-slate-400">
                  Showing {dataList.length} of {totalRecords} records (Page {page} of {totalPages})
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Rows per page:</span>
                  <select
                    className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 rounded-lg text-xs outline-none cursor-pointer focus:border-blue-500"
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className="text-xs px-2 text-slate-300">{page} / {totalPages}</span>
                <button
                  className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedItemDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-left relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="text-base font-bold text-white m-0 capitalize">{activeTab.slice(0, -1)} Details</h3>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white flex items-center justify-center border-none text-base cursor-pointer transition-colors"
                onClick={() => setSelectedItemDetails(null)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              {activeTab === "gyms" && (
                <>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700/60">
                    <div className="text-xs text-slate-400">Gym Name</div>
                    <div className="text-base font-bold text-white">{selectedItemDetails.gymName}</div>
                    <div className="text-xs text-slate-400 mt-1">Owner: {selectedItemDetails.ownerName}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email</span>
                      <span className="text-slate-200">{selectedItemDetails.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Phone</span>
                      <span className="text-slate-200">{selectedItemDetails.phone}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Location</span>
                    <span className="text-white font-medium">
                      {selectedItemDetails.cityId?.cityName || ""}{selectedItemDetails.cityId ? ", " : ""}
                      {selectedItemDetails.districtId?.districtName || ""}{selectedItemDetails.districtId ? ", " : ""}
                      {selectedItemDetails.stateId?.stateName || "Not set"}
                    </span>
                  </div>

                  {selectedItemDetails.images && selectedItemDetails.images.length > 0 && (
                    <div>
                      <span className="text-slate-400 block text-[11px] mb-1">Gym Images</span>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedItemDetails.images.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-full h-20 object-cover rounded-lg border border-slate-700" />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {(activeTab === "managers" || activeTab === "trainers" || activeTab === "members") && (
                <>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700/60 flex items-center gap-3">
                    {selectedItemDetails.profileImage ? (
                      <img src={selectedItemDetails.profileImage} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl">👤</div>
                    )}
                    <div>
                      <div className="text-base font-bold text-white">{selectedItemDetails.name}</div>
                      <div className="text-xs text-blue-400 capitalize">{selectedItemDetails.role || activeTab.slice(0, -1)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email</span>
                      <span className="text-slate-200">{selectedItemDetails.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Phone</span>
                      <span className="text-slate-200">{selectedItemDetails.phone || "N/A"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Gym</span>
                    <span className="text-white font-medium">{selectedItemDetails.gymId?.gymName || "All Gyms"}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Fitness Trainer</span>
                    <span className="text-purple-400 font-bold block mt-0.5">
                      {selectedItemDetails.assignedTrainerId?.name
                        ? `💪 ${selectedItemDetails.assignedTrainerId.name} (${selectedItemDetails.assignedTrainerId.email || "No Email"})`
                        : "Not assigned yet"}
                    </span>
                  </div>
                </>
              )}

              {activeTab === "plans" && (
                <>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700/60">
                    <div className="text-xs text-slate-400">Plan Name</div>
                    <div className="text-base font-bold text-blue-400">{selectedItemDetails.planName}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Duration</span>
                      <span className="text-white font-bold">{selectedItemDetails.durationMonths} Months</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Price</span>
                      <span className="text-emerald-400 font-bold text-sm">₹{selectedItemDetails.price}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Description</span>
                    <span className="text-slate-200">{selectedItemDetails.description || "No description provided"}</span>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {showModal && activeTab === "gyms" && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white m-0">Add Gym (Request to SuperAdmin)</h3>
              <button className="bg-transparent border-none text-slate-400 text-lg cursor-pointer hover:text-white" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddGymSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gym Name *</label>
                  <input type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required value={gymForm.gymName} onChange={(e) => setGymForm({ ...gymForm, gymName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Name *</label>
                  <input type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required value={gymForm.ownerName} onChange={(e) => setGymForm({ ...gymForm, ownerName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                  <input type="email" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required value={gymForm.email} onChange={(e) => setGymForm({ ...gymForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone *</label>
                  <input type="tel" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required value={gymForm.phone} onChange={(e) => setGymForm({ ...gymForm, phone: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    value={gymForm.stateId}
                    onChange={(e) =>
                      setGymForm({
                        ...gymForm,
                        stateId: e.target.value,
                        districtId: "",
                        cityId: "",
                      })
                    }
                  >
                    <option value="">-- State --</option>
                    {statesList.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.stateName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">District</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    value={gymForm.districtId}
                    onChange={(e) =>
                      setGymForm({
                        ...gymForm,
                        districtId: e.target.value,
                        cityId: "",
                      })
                    }
                  >
                    <option value="">-- District --</option>
                    {districtsList
                      .filter((dst) => !gymForm.stateId || (dst.stateId?._id || dst.stateId) === gymForm.stateId)
                      .map((dst) => (
                        <option key={dst._id} value={dst._id}>
                          {dst.districtName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    value={gymForm.cityId}
                    onChange={(e) =>
                      setGymForm({
                        ...gymForm,
                        cityId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- City --</option>
                    {citiesList
                      .filter((ct) => !gymForm.districtId || (ct.districtId?._id || ct.districtId) === gymForm.districtId)
                      .map((ct) => (
                        <option key={ct._id} value={ct._id}>
                          {ct.cityName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address</label>
                <input type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={gymForm.address} onChange={(e) => setGymForm({ ...gymForm, address: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Upload Multiple Gym Images (Cloudinary) 📸</label>
                <input type="file" multiple accept="image/*" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" onChange={handleGymImageUpload} />
                {uploading && <p className="text-xs text-blue-400 mt-1">Uploading images to Cloudinary...</p>}
                <div className="flex gap-2.5 flex-wrap mt-2.5">
                  {gymForm.images.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-700" />
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 justify-end pt-3">
                <button type="button" className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer border-none">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (activeTab === "managers" || activeTab === "trainers") && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white m-0">Add {activeTab === "managers" ? "Gym Manager" : "Fitness Trainer"}</h3>
              <button className="bg-transparent border-none text-slate-400 text-lg cursor-pointer hover:text-white" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddUserSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Name *</label>
                <input type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                <input type="email" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              </div>
              {activeTab !== "trainers" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone *</label>
                <input type="tel" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign to Gym</label>
                <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer" value={userForm.gymId} onChange={(e) => setUserForm({ ...userForm, gymId: e.target.value })}>
                  <option value="">-- Select Gym --</option>
                  {adminGyms.map((g) => (
                    <option key={g._id} value={g._id}>{g.gymName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Profile Picture (Cloudinary) 👤</label>
                <input type="file" accept="image/*" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" onChange={handleProfileImageUpload} />
                {uploading && <p className="text-xs text-blue-400 mt-1">Uploading image...</p>}
                {userForm.profileImage && (
                  <img src={userForm.profileImage} alt="" className="w-14 h-14 rounded-full mt-2 object-cover" />
                )}
              </div>

              <div className="flex gap-2.5 justify-end pt-3">
                <button type="button" className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer border-none">
                  {activeTab === "trainers" ? "Add Trainer" : activeTab === "managers" ? "Add Gym Manager" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && activeTab === "plans" && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white m-0">Add Membership Plan</h3>
              <button className="bg-transparent border-none text-slate-400 text-lg cursor-pointer hover:text-white" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddPlanSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Name *</label>
                <input type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. Premium VIP Plan" required value={planForm.planName} onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Months) *</label>
                  <input type="number" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" min="1" required value={planForm.durationMonths} onChange={(e) => setPlanForm({ ...planForm, durationMonths: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₹) *</label>
                  <input type="number" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" min="0" required value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Features</label>
                <input type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. Unlimited access + Trainer included" value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} />
              </div>
              <div className="flex gap-2.5 justify-end pt-3">
                <button type="button" className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer border-none">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

export default AdminDashboard;
