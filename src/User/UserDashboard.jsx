import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

function UserDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || null;
  const [activeTab, setActiveTab] = useState("overview"); 
  const [memberProfile, setMemberProfile] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [dietPlan, setDietPlan] = useState(null);
  const [habitHistory, setHabitHistory] = useState([]);

  const [workoutCompleted, setWorkoutCompleted] = useState(true);
  const [dietFollowed, setDietFollowed] = useState(true);
  const [waterIntake, setWaterIntake] = useState(3.0);
  const [sleepHours, setSleepHours] = useState(8);
  const [currentWeight, setCurrentWeight] = useState(70);
  const [logNotes, setLogNotes] = useState("");
  const [logging, setLogging] = useState(false);

  const userId = currentUser?._id || currentUser?.id || "64e000000000000000000001";

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/member/profile/${userId}`);
      if (res.data?.user) {
        setMemberProfile(res.data.user);
        if (res.data.user.weight) setCurrentWeight(res.data.user.weight);
      }
    } catch (err) {
      console.error("Error fetching member profile:", err);
    }
  };

  const fetchPlans = async () => {
    try {
      const [wRes, dRes, hRes] = await Promise.all([
        axios.get(`${API_BASE}/trainer/workout-plan/${userId}`),
        axios.get(`${API_BASE}/trainer/diet-plan/${userId}`),
        axios.get(`${API_BASE}/member/habit-history`, { params: { userId, limit: 15 } }),
      ]);
      if (wRes.data?.workoutPlan) setWorkoutPlan(wRes.data.workoutPlan);
      if (dRes.data?.dietPlan) setDietPlan(dRes.data.dietPlan);
      if (hRes.data?.logs) setHabitHistory(hRes.data.logs);
    } catch (err) {
      console.error("Error fetching member plans:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchPlans();
  }, []);

  const handleHabitSubmit = async (e) => {
    e.preventDefault();
    try {
      setLogging(true);
      const res = await axios.post(`${API_BASE}/member/log-habit`, {
        userId,
        workoutCompleted,
        dietFollowed,
        waterIntakeLiters: waterIntake,
        sleepHours,
        weight: currentWeight,
        notes: logNotes,
      });

      alert(`Daily habit logged! Your Fitness Streak is now 🔥 ${res.data.streak} Days!`);
      fetchProfile();
      fetchPlans();
      setActiveTab("overview");
    } catch (err) {
      alert("Failed to log habit");
    } finally {
      setLogging(false);
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
          <div className="mb-5 pb-4 border-b border-slate-800">
            <h1 className="text-lg font-bold text-white flex items-center gap-2 m-0 p-0">
              🏋️ <span>Member Hub</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 m-0">Welcome, {memberProfile?.name || "Member"}!</p>
          </div>

          <div className="mb-5 bg-gradient-to-br from-amber-500 to-red-500 text-white p-3 rounded-xl flex items-center gap-3 shadow-md shadow-amber-500/20">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-xl font-extrabold">{memberProfile?.streak || 0} Days</div>
              <div className="text-[10px] opacity-90 font-medium">Fitness Streak</div>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "overview"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("overview")}
            >
              <span className="text-base">📊</span> Membership & Stats
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "workout"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("workout")}
            >
              <span className="text-base">🏋️</span> Workout Routine
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "diet"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("diet")}
            >
              <span className="text-base">🥗</span> Diet Plan
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "habit-log"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("habit-log")}
            >
              <span className="text-base">📝</span> Log Today's Habits
            </button>
            <button
              className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none text-left ${activeTab === "history"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              onClick={() => setActiveTab("history")}
            >
              <span className="text-base">📜</span> Habit Log History
            </button>
          </nav>
        </div>

        {/* User Profile Card & Logout */}
        <div className="pt-4 border-t border-slate-800/80 mt-6">
          <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-2xl flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentUser?.profileImage || memberProfile?.profileImage ? (
                <img
                  src={currentUser?.profileImage || memberProfile?.profileImage}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border-2 border-amber-500/50 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-amber-400/30">
                  {(currentUser?.name || memberProfile?.name || "Member").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate m-0 p-0">
                  {currentUser?.name || memberProfile?.name || "Fitness Member"}
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase m-0 mt-0.5 truncate">
                  MEMBER
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

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">

      {/* Overview View */}
      {activeTab === "overview" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Fitness Streak</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">🔥</div>
              </div>
              <div className="text-2xl font-extrabold text-amber-400 my-1.5">
                {memberProfile?.streak || 0} Days
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">Consecutive workout logs</div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Current Weight</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">⚖️</div>
              </div>
              <div className="text-2xl font-extrabold text-white my-1.5">
                {memberProfile?.weight ? `${memberProfile.weight} kg` : "70 kg"}
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">Tracked weight</div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Assigned Gym</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">🏛️</div>
              </div>
              <div className="text-xl font-extrabold text-white my-1.5">
                {memberProfile?.gymId?.gymName || "Gold's Gym"}
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">Fitness Center</div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Personal Trainer</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-blue-500/15 text-blue-400">💪</div>
              </div>
              <div className="text-xl font-extrabold text-white my-1.5">
                {memberProfile?.assignedTrainerId?.name || "Assigning Soon"}
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">Personal Fitness Coach</div>
            </div>
          </div>

          <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700/80">
            <h3 className="text-base font-bold text-white m-0 mb-4">💳 Membership Plan Details</h3>
            <div className="flex gap-5 flex-wrap">
              <div className="bg-slate-900 px-6 py-4 rounded-xl border border-blue-500/60">
                <div className="text-xs text-slate-400">Plan Name</div>
                <div className="text-xl font-bold text-blue-400 mt-1">
                  {memberProfile?.membershipPlanId?.planName || "VIP Premium Annual Membership"}
                </div>
              </div>
              <div className="bg-slate-900 px-6 py-4 rounded-xl border border-emerald-500/60">
                <div className="text-xs text-slate-400">Status</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  Active ✅
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Plan View */}
      {activeTab === "workout" && (
        <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700/80">
          <h2 className="text-lg font-bold text-white m-0">
            🏋️ {workoutPlan?.title || "Weekly Workout Routine"}
          </h2>
          {workoutPlan?.schedule ? (
            <div className="grid grid-cols-1 gap-4 mt-5">
              {workoutPlan.schedule.map((day, dIdx) => (
                <div key={dIdx} className="bg-slate-900 p-4 rounded-xl border border-slate-700/80">
                  <h3 className="text-base font-bold text-blue-400 m-0 mb-3">{day.day}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {day.exercises.map((ex, eIdx) => (
                      <div key={eIdx} className="flex justify-between items-center bg-slate-800/90 px-3.5 py-2.5 rounded-lg border border-slate-700/60">
                        <span className="font-semibold text-white text-xs">{ex.name}</span>
                        <span className="text-slate-300 text-xs">{ex.sets} Sets × {ex.reps} Reps ({ex.weight} kg)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-3">No assigned workout plan yet. Your trainer will publish your routine soon!</p>
          )}
        </div>
      )}

      {/* Diet Plan View */}
      {activeTab === "diet" && (
        <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700/80">
          <h2 className="text-lg font-bold text-white m-0">
            🥗 {dietPlan?.title || "Daily Nutrition Plan"}
          </h2>
          <div className="bg-slate-900 px-5 py-3.5 rounded-xl inline-flex gap-2.5 items-center my-4 border border-slate-700/60">
            <span className="text-xl">💧</span>
            <div>
              <span className="text-xs text-slate-400">Target Water Intake: </span>
              <strong className="text-sky-400">{dietPlan?.waterTargetLiters || 3.5} Liters / day</strong>
            </div>
          </div>

          {dietPlan?.meals ? (
            <div className="grid grid-cols-1 gap-3">
              {dietPlan.meals.map((meal, mIdx) => (
                <div key={mIdx} className="bg-slate-900 p-4 rounded-xl flex justify-between items-center border border-slate-700/60">
                  <div>
                    <h4 className="text-emerald-400 font-bold m-0 mb-1 text-sm">{meal.mealType}</h4>
                    <div className="text-slate-200 text-xs">{meal.items}</div>
                  </div>
                  <div className="font-bold text-amber-400 text-xs">{meal.calories} kcal</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-3">No assigned diet plan yet. Check back soon!</p>
          )}
        </div>
      )}

      {/* Log Habits Form View */}
      {activeTab === "habit-log" && (
        <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700/80 max-w-xl">
          <h2 className="text-lg font-bold text-white m-0 mb-4">📝 Log Today's Habits & Maintain Streak 🔥</h2>
          <form onSubmit={handleHabitSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Did you complete your workout today? 🏋️</label>
              <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer" value={workoutCompleted ? "true" : "false"} onChange={(e) => setWorkoutCompleted(e.target.value === "true")}>
                <option value="true">Yes, Workout Completed! ✅</option>
                <option value="false">No, Rest Day / Skipped ❌</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Did you follow your diet plan today? 🥗</label>
              <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer" value={dietFollowed ? "true" : "false"} onChange={(e) => setDietFollowed(e.target.value === "true")}>
                <option value="true">Yes, Followed Diet! ✅</option>
                <option value="false">No, Cheat Day / Skipped ❌</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Water Intake (Liters) 💧</label>
                <input type="number" step="0.5" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={waterIntake} onChange={(e) => setWaterIntake(Number(e.target.value))} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sleep Hours 😴</label>
                <input type="number" step="0.5" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={sleepHours} onChange={(e) => setSleepHours(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Log Today's Weight (kg) ⚖️</label>
              <input type="number" step="0.1" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={currentWeight} onChange={(e) => setCurrentWeight(Number(e.target.value))} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Feeling</label>
              <input type="text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. Great chest workout today!" value={logNotes} onChange={(e) => setLogNotes(e.target.value)} />
            </div>

            <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer border-none shadow-md shadow-blue-600/30" disabled={logging}>
              {logging ? "Logging..." : "Log Habit & Keep Streak 🔥"}
            </button>
          </form>
        </div>
      )}

      {/* Habit History View */}
      {activeTab === "history" && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-700">
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Date</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Workout Status</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Diet Status</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Water Intake</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Sleep Hours</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Weight (kg)</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/80">
              {habitHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-400">
                    No habit logs recorded yet. Start logging your daily habits!
                  </td>
                </tr>
              ) : (
                habitHistory.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-3.5 py-2.5 font-semibold text-white">{log.date}</td>
                    <td className="px-3.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        log.workoutCompleted ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
                      }`}>
                        {log.workoutCompleted ? "Completed ✅" : "Skipped"}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        log.dietFollowed ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
                      }`}>
                        {log.dietFollowed ? "Followed 🥗" : "Skipped"}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-300">{log.waterIntakeLiters || 0} L</td>
                    <td className="px-3.5 py-2.5 text-slate-300">{log.sleepHours || 0} hrs</td>
                    <td className="px-3.5 py-2.5 text-slate-300"><strong>{log.weight || "-"} kg</strong></td>
                    <td className="px-3.5 py-2.5 text-slate-300">{log.notes || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      </main>
    </div>
  );
}

export default UserDashboard;
