import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

function TrainerDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("currentuser"));
  const [activeTab, setActiveTab] = useState("members");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const [members, setMembers] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMember, setSelectedMember] = useState("");

  const [workoutTitle, setWorkoutTitle] = useState("Weekly Strength & Hypertrophy");
  const [workoutSchedule, setWorkoutSchedule] = useState([
    { day: "Monday - Chest & Triceps", exercises: [{ name: "Bench Press", sets: 4, reps: 10, weight: 60 }] },
    { day: "Wednesday - Back & Biceps", exercises: [{ name: "Lat Pulldown", sets: 4, reps: 12, weight: 50 }] },
  ]);

  const [dietTitle, setDietTitle] = useState("High Protein Clean Muscle Gain");
  const [waterTarget, setWaterTarget] = useState(3.5);
  const [dietMeals, setDietMeals] = useState([
    { mealType: "Breakfast", items: "Oats, 4 Egg Whites, Almonds", calories: 450 },
    { mealType: "Lunch", items: "Grilled Chicken Breast, Brown Rice, Broccoli", calories: 650 },
  ]);

  const [alertSubject, setAlertSubject] = useState("Important Workout & Hydration Tip");
  const [alertMessage, setAlertMessage] = useState("Remember to complete your workout today and stay hydrated with at least 3.5L of water!");
  const [sendingAlert, setSendingAlert] = useState(false);

  const updateExercise = (dIdx, eIdx, field, val) => {
    workoutSchedule[dIdx].exercises[eIdx][field] = val;
    setWorkoutSchedule([...workoutSchedule]);
  };

  const updateDayTitle = (dIdx, val) => {
    workoutSchedule[dIdx].day = val;
    setWorkoutSchedule([...workoutSchedule]);
  };

  const trainerId = currentUser?._id || currentUser?.id || "64e000000000000000000000";

  const fetchAssignedMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/trainer/assigned-members`, {
        params: {
          trainerId,
          search,
          page,
          limit,
        },
      });
      if (res.data?.success) {
        setMembers(res.data.members || []);
        setTotalMembers(res.data.totalMembers || 0);
        setTotalPages(res.data.totalPages || 1);
        if (res.data.members?.length > 0 && !selectedMember) {
          setSelectedMember(res.data.members[0]._id);
        }
      }
    } catch (err) {
      console.error("Error fetching assigned members:", err);
    }
  };

  useEffect(() => {
    fetchAssignedMembers();
  }, [search, page, limit]);

  const handleWorkoutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) return alert("Select a member");
    try {
      await axios.post(`${API_BASE}/trainer/workout-plan/create`, {
        title: workoutTitle,
        memberId: selectedMember,
        trainerId,
        schedule: workoutSchedule,
      });
      alert("Workout plan assigned to member successfully! 💪");
    } catch (err) {
      alert("Failed to assign workout plan");
    }
  };

  const handleDietSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) return alert("Select a member");
    try {
      await axios.post(`${API_BASE}/trainer/diet-plan/create`, {
        title: dietTitle,
        memberId: selectedMember,
        trainerId,
        meals: dietMeals,
        waterTargetLiters: waterTarget,
      });
      alert("Diet plan assigned to member successfully! 🥗");
    } catch (err) {
      alert("Failed to assign diet plan");
    }
  };

  const handleSendAlertSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) return alert("Select a member");
    try {
      setSendingAlert(true);
      await axios.post(`${API_BASE}/trainer/send-recommendation`, {
        memberId: selectedMember,
        subject: alertSubject,
        message: alertMessage,
      });
      alert("Recommendation email sent to member via Brevo! 📧");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send email alert");
    } finally {
      setSendingAlert(false);
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
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="mb-6 pb-4 border-b border-slate-800">
            <h1 className="text-lg font-bold text-white flex items-center gap-2 m-0 p-0">
              💪 <span>Trainer Portal</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 m-0">Member Coaching & Nutrition</p>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "members"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("members")}
            >
              <span className="text-base">👥</span> Assigned Members ({totalMembers})
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "workout"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("workout")}
            >
              <span className="text-base">🏋️</span> Workout Plan
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "diet"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("diet")}
            >
              <span className="text-base">🥗</span> Diet Plan
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "alerts"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("alerts")}
            >
              <span className="text-base">📧</span> Send Recommendation
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
                  className="w-9 h-9 rounded-full object-cover border-2 border-purple-500/50 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-purple-400/30">
                  {(currentUser?.name || "Trainer").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate m-0 p-0">
                  {currentUser?.name || "Fitness Trainer"}
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase m-0 mt-0.5 truncate">
                  TRAINER
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

        {activeTab === "members" && (
          <div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap flex-1">
                <div className="relative min-w-[200px] flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                  <input
                    type="text"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Search member by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-700">
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">#</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Member Name</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Email</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Fitness Streak</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Current Weight</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Gym</th>
                    <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/80">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-6 text-slate-400">
                        No assigned members found.
                      </td>
                    </tr>
                  ) : (
                    members.map((m, idx) => (
                      <tr key={m._id} className="hover:bg-slate-700/40 transition-colors">
                        <td className="px-3.5 py-2.5 text-slate-300">{(page - 1) * limit + idx + 1}</td>
                        <td className="px-3.5 py-2.5 font-semibold text-white">{m.name}</td>
                        <td className="px-3.5 py-2.5 text-slate-300">{m.email}</td>
                        <td className="px-3.5 py-2.5">
                          <span className="text-amber-400 font-bold text-sm">
                            🔥 {m.streak || 0} Days
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-300">{m.weight ? `${m.weight} kg` : "Not set"}</td>
                        <td className="px-3.5 py-2.5 text-slate-300">{m.gymId?.gymName || "Main Gym"}</td>
                        <td className="px-3.5 py-2.5">
                          <button
                            className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-blue-600 hover:bg-blue-500 text-white border-none"
                            onClick={() => {
                              setSelectedMember(m._id);
                              setActiveTab("workout");
                            }}
                          >
                            Assign Plans
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="flex flex-wrap justify-between items-center px-3.5 py-2.5 bg-slate-900 border-t border-slate-700 text-xs gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="text-slate-400">
                    Showing {members.length} of {totalMembers} members (Page {page} of {totalPages})
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
                  <span className="text-xs px-2 text-slate-300">{page} / {totalPages}</span>
                  <button className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "workout" && (
          <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700/80 max-w-2xl">
            <h2 className="text-lg font-bold text-white m-0 mb-4">🏋️ Create Workout Routine</h2>
            <form onSubmit={handleWorkoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Member *</label>
                <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer" required value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
                  <option value="">-- Choose Member --</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Title *</label>
                <input type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required value={workoutTitle} onChange={(e) => setWorkoutTitle(e.target.value)} />
              </div>

              <div className="my-5">
                <h4 className="text-blue-400 font-bold m-0 mb-2.5 text-sm">Weekly Exercises</h4>
                {workoutSchedule.map((dayItem, dIdx) => (
                  <div key={dIdx} className="bg-slate-900 p-3.5 rounded-xl mb-3 border border-slate-700/60">
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs outline-none font-semibold mb-2"
                      value={dayItem.day}
                      onChange={(e) => updateDayTitle(dIdx, e.target.value)}
                    />
                    {dayItem.exercises.map((ex, eIdx) => (
                      <div key={eIdx} className="grid grid-cols-4 gap-2 mt-2">
                        <input
                          type="text"
                          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs outline-none"
                          placeholder="Exercise"
                          value={ex.name}
                          onChange={(e) => updateExercise(dIdx, eIdx, "name", e.target.value)}
                        />
                        <input
                          type="number"
                          className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs outline-none"
                          placeholder="Sets"
                          value={ex.sets}
                          onChange={(e) => updateExercise(dIdx, eIdx, "sets", Number(e.target.value))}
                        />
                        <input
                          type="number"
                          className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs outline-none"
                          placeholder="Reps"
                          value={ex.reps}
                          onChange={(e) => updateExercise(dIdx, eIdx, "reps", Number(e.target.value))}
                        />
                        <input
                          type="number"
                          className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs outline-none"
                          placeholder="Weight (kg)"
                          value={ex.weight}
                          onChange={(e) => updateExercise(dIdx, eIdx, "weight", Number(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer border-none shadow-md shadow-blue-600/30">
                Assign Workout Plan
              </button>
            </form>
          </div>
        )}

        {activeTab === "diet" && (
          <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700/80 max-w-2xl">
            <h2 className="text-lg font-bold text-white m-0 mb-4">🥗 Create Nutrition & Diet Plan</h2>
            <form onSubmit={handleDietSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Member *</label>
                <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer" required value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
                  <option value="">-- Choose Member --</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Diet Plan Title *</label>
                <input type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required value={dietTitle} onChange={(e) => setDietTitle(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Water Target (Liters) 💧</label>
                <input type="number" step="0.5" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={waterTarget} onChange={(e) => setWaterTarget(Number(e.target.value))} />
              </div>

              <div className="my-5">
                <h4 className="text-emerald-400 font-bold m-0 mb-2.5 text-sm">Meal Schedule</h4>
                {dietMeals.map((meal, mIdx) => (
                  <div key={mIdx} className="bg-slate-900 p-3 rounded-xl mb-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 border border-slate-700/60">
                    <input
                      type="text" className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs outline-none" value={meal.mealType}
                      onChange={(e) => {
                        const copy = [...dietMeals];
                        copy[mIdx].mealType = e.target.value;
                        setDietMeals(copy);
                      }}
                    />
                    <input
                      type="text" className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs outline-none" value={meal.items}
                      onChange={(e) => {
                        const copy = [...dietMeals];
                        copy[mIdx].items = e.target.value;
                        setDietMeals(copy);
                      }}
                    />
                    <input
                      type="number" className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs outline-none" placeholder="Calories" value={meal.calories}
                      onChange={(e) => {
                        const copy = [...dietMeals];
                        copy[mIdx].calories = Number(e.target.value);
                        setDietMeals(copy);
                      }}
                    />
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer border-none shadow-md shadow-blue-600/30">
                Assign Diet Plan
              </button>
            </form>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700/80 max-w-xl">
            <h2 className="text-lg font-bold text-white m-0 mb-4">📧 Send Recommendation Alert (via Brevo)</h2>
            <form onSubmit={handleSendAlertSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Member *</label>
                <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer" required value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
                  <option value="">-- Choose Member --</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject *</label>
                <input type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required value={alertSubject} onChange={(e) => setAlertSubject(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Recommendation Message *</label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows="4"
                  required
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer border-none shadow-md shadow-blue-600/30" disabled={sendingAlert}>
                {sendingAlert ? "Sending via Brevo..." : "Send Email Recommendation"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default TrainerDashboard;
