import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

function ManagerDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || null;
  const [activeTab, setActiveTab] = useState("equipments"); 
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

  const [equipments, setEquipments] = useState([]);
  const [totalEquipments, setTotalEquipments] = useState(0);
  const [totalEqPages, setTotalEqPages] = useState(1);

  const [membersList, setMembersList] = useState([]);
  const [trainersList, setTrainersList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [showAddEqModal, setShowAddEqModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [eqForm, setEqForm] = useState({
    equipmentName: "", quantity: 1, category: "Strength", condition: "Good", gymId: "", image: "",
  });

  const [assignForm, setAssignForm] = useState({ memberId: "", trainerId: "" });

  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [trainerForm, setTrainerForm] = useState({
    name: "", email: "", password: "", phone: "", gymId: "", profileImage: "",
  });

  const fetchEquipments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/manager/equipment/all`, {
        params: { search, sort, page, limit },
      });
      if (res.data?.success) {
        setEquipments(res.data.equipments || []);
        setTotalEquipments(res.data.totalEquipments || 0);
        setTotalEqPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching equipments:", err);
    }
  };

  const fetchMembersAndTrainers = async () => {
    try {
      const [memRes, trRes, logRes] = await Promise.all([
        axios.get(`${API_BASE}/admin-role/member/all`, { params: { limit: 100 } }),
        axios.get(`${API_BASE}/admin-role/trainer/all`, { params: { limit: 100 } }),
        axios.get(`${API_BASE}/manager/activity-logs`, { params: { limit: 20 } }),
      ]);
      setMembersList(memRes.data?.members || []);
      setTrainersList(trRes.data?.trainers || []);
      setActivityLogs(logRes.data?.logs || []);
    } catch (err) {
      console.error("Error fetching members/trainers:", err);
    }
  };

  useEffect(() => {
    fetchMembersAndTrainers();
  }, []);

  useEffect(() => {
    if (activeTab === "equipments") fetchEquipments();
  }, [activeTab, search, sort, page, limit]);

  const handleEquipmentImageUpload = async (e) => {
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
        setEqForm((prev) => ({ ...prev, image: res.data.urls[0] }));
      }
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddEquipmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const gymIdToUse = eqForm.gymId || membersList[0]?.gymId?._id || "64e000000000000000000000";
      await axios.post(`${API_BASE}/manager/equipment/add`, {
        ...eqForm,
        gymId: gymIdToUse,
      });
      setShowAddEqModal(false);
      setEqForm({ equipmentName: "", quantity: 1, category: "Strength", condition: "Good", gymId: "", image: "" });
      fetchEquipments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add equipment");
    }
  };

  const handleAssignTrainerSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${API_BASE}/manager/assign-trainer`, assignForm);
      alert("Trainer assigned to member successfully!");
      setAssignForm({ memberId: "", trainerId: "" });
      fetchMembersAndTrainers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign trainer");
    }
  };

  const handleTrainerProfileImageUpload = async (e) => {
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
        setTrainerForm((prev) => ({ ...prev, profileImage: res.data.urls[0] }));
      }
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddTrainerSubmit = async (e) => {
    e.preventDefault();
    try {
      const gymIdToUse = trainerForm.gymId || membersList[0]?.gymId?._id || "64e000000000000000000000";
      await axios.post(`${API_BASE}/manager/trainer/add`, {
        ...trainerForm,
        gymId: gymIdToUse,
      });
      alert("Fitness Trainer added successfully! Credentials sent to trainer's email.");
      setShowAddTrainerModal(false);
      setTrainerForm({ name: "", email: "", password: "", phone: "", gymId: "", profileImage: "" });
      fetchMembersAndTrainers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add trainer");
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (!window.confirm("Delete equipment?")) return;
    try {
      await axios.delete(`${API_BASE}/manager/equipment/delete/${id}`);
      fetchEquipments();
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row text-left">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div>
          <div className="mb-6 pb-4 border-b border-slate-800">
            <h1 className="text-lg font-bold text-white flex items-center gap-2 m-0 p-0">
              🛠️ <span>Gym Manager</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 m-0">Daily Operations & Maintenance</p>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "equipments"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("equipments")}
            >
              <span className="text-base">🏋️</span> Gym Equipments ({totalEquipments})
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "assign-trainer"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("assign-trainer")}
            >
              <span className="text-base">🤝</span> Assign Trainers
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "activity"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("activity")}
            >
              <span className="text-base">📈</span> Activity Monitor
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
                  className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500/50 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-emerald-400/30">
                  {(currentUser?.name || "Manager").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate m-0 p-0">
                  {currentUser?.name || "Gym Manager"}
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase m-0 mt-0.5 truncate">
                  GYM MANAGER
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

      {activeTab === "equipments" && (
        <div>
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap flex-1">
              <div className="relative min-w-[200px] flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Search equipment by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="asc">Name: A to Z</option>
                <option value="desc">Name: Z to A</option>
              </select>
            </div>

            <button
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border-none"
              onClick={() => setShowAddEqModal(true)}
            >
              ➕ Add Gym Equipment
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {equipments.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-400">
                No gym equipments found. Add new equipment above!
              </div>
            ) : (
              equipments.map((eq) => (
                <div key={eq._id} className="bg-slate-800 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                  {eq.image ? (
                    <img src={eq.image} alt="" className="w-full h-40 object-cover bg-slate-900" />
                  ) : (
                    <div className="w-full h-40 bg-slate-900 flex items-center justify-center text-4xl text-slate-500">
                      🏋️
                    </div>
                  )}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-bold text-white m-0">{eq.equipmentName}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {eq.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-2">
                        Quantity: <strong>{eq.quantity} units</strong>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        Condition: <span className={eq.condition === "Good" ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>{eq.condition}</span>
                      </div>
                    </div>

                    <button
                      className="mt-3.5 w-full py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors bg-red-600 hover:bg-red-500 text-white border-none"
                      onClick={() => handleDeleteEquipment(eq._id)}
                    >
                      Delete Equipment
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap justify-between items-center px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl mt-6 text-xs gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-slate-400">
                Showing {equipments.length} of {totalEquipments} equipments (Page {page} of {totalEqPages})
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
              <button className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span className="text-xs px-2 text-slate-300">{page} / {totalEqPages}</span>
              <button className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors" disabled={page >= totalEqPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "assign-trainer" && (
        <div className="space-y-6 max-w-xl">
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h2 className="text-base font-bold text-white m-0">🏋️‍♂️ Gym Fitness Trainers</h2>
              <p className="text-xs text-slate-400 m-0 mt-0.5">Add new trainers or assign trainers to gym members</p>
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border-none shadow-md shadow-blue-600/30"
              onClick={() => setShowAddTrainerModal(true)}
            >
              ➕ Add Fitness Trainer
            </button>
          </div>

          <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700/80">
            <h3 className="text-sm font-bold text-white m-0 mb-4">🤝 Assign Fitness Trainer to Member</h3>
            <form onSubmit={handleAssignTrainerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Gym Member *</label>
                <select
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  required
                  value={assignForm.memberId}
                  onChange={(e) => setAssignForm({ ...assignForm, memberId: e.target.value })}
                >
                  <option value="">-- Choose Member --</option>
                  {membersList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email}) {m.assignedTrainerId ? ` - [Current Trainer: ${m.assignedTrainerId.name || "Assigned"}]` : " - [No Trainer Assigned]"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Trainer *</label>
                <select
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  required
                  value={assignForm.trainerId}
                  onChange={(e) => setAssignForm({ ...assignForm, trainerId: e.target.value })}
                >
                  <option value="">-- Choose Trainer --</option>
                  {trainersList.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer border-none shadow-md shadow-blue-600/30">
                Assign Trainer Now
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-700">
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Date</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Member Name</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Workout Completed</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Diet Followed</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Water Intake</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Sleep Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/80">
              {activityLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-400">
                    No recent member activity logs recorded.
                  </td>
                </tr>
              ) : (
                activityLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-3.5 py-2.5 font-semibold text-white">{log.date}</td>
                    <td className="px-3.5 py-2.5 text-slate-300">{log.userId?.name || "Member"} ({log.userId?.email || ""})</td>
                    <td className="px-3.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${log.workoutCompleted ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
                        }`}>
                        {log.workoutCompleted ? "Yes ✅" : "No ❌"}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${log.dietFollowed ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
                        }`}>
                        {log.dietFollowed ? "Yes 🥗" : "No ❌"}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-300">{log.waterIntakeLiters || 0} Liters 💧</td>
                    <td className="px-3.5 py-2.5 text-slate-300">{log.sleepHours || 0} Hours 😴</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddEqModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white m-0">Add Gym Equipment</h3>
              <button className="bg-transparent border-none text-slate-400 text-lg cursor-pointer hover:text-white" onClick={() => setShowAddEqModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddEquipmentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Equipment Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Treadmill, Bench Press"
                  required
                  value={eqForm.equipmentName}
                  onChange={(e) => setEqForm({ ...eqForm, equipmentName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min="1"
                    required
                    value={eqForm.quantity}
                    onChange={(e) => setEqForm({ ...eqForm, quantity: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    value={eqForm.category}
                    onChange={(e) => setEqForm({ ...eqForm, category: e.target.value })}
                  >
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Free Weights">Free Weights</option>
                    <option value="Functional">Functional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Condition</label>
                <select
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  value={eqForm.condition}
                  onChange={(e) => setEqForm({ ...eqForm, condition: e.target.value })}
                >
                  <option value="Good">Good</option>
                  <option value="Needs Maintenance">Needs Maintenance</option>
                  <option value="Under Repair">Under Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Equipment Image (Cloudinary) 📸</label>
                <input type="file" accept="image/*" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" onChange={handleEquipmentImageUpload} />
                {uploading && <p className="text-xs text-blue-400 mt-1">Uploading image...</p>}
                {eqForm.image && (
                  <img src={eqForm.image} alt="" className="w-20 h-20 rounded-lg mt-2 object-cover border border-slate-700" />
                )}
              </div>

              <div className="flex gap-2.5 justify-end pt-3">
                <button type="button" className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setShowAddEqModal(false)}>Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer border-none">Save Equipment</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddTrainerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white m-0">Add Fitness Trainer</h3>
              <button className="bg-transparent border-none text-slate-400 text-lg cursor-pointer hover:text-white" onClick={() => setShowAddTrainerModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddTrainerSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Rohan"
                  required
                  value={trainerForm.name}
                  onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="trainer@example.com"
                  required
                  value={trainerForm.email}
                  onChange={(e) => setTrainerForm({ ...trainerForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone *</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 9876543210"
                  required
                  value={trainerForm.phone}
                  onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Profile Picture (Cloudinary) 👤</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  onChange={handleTrainerProfileImageUpload}
                />
                {uploading && <p className="text-xs text-blue-400 mt-1">Uploading image...</p>}
                {trainerForm.profileImage && (
                  <img src={trainerForm.profileImage} alt="" className="w-14 h-14 rounded-full mt-2 object-cover border border-slate-700" />
                )}
              </div>

              <div className="flex gap-2.5 justify-end pt-3">
                <button
                  type="button"
                  className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
                  onClick={() => setShowAddTrainerModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer border-none"
                >
                  Add Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

export default ManagerDashboard;
