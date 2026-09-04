import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

function GymRequestForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submittedAdmin, setSubmittedAdmin] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file0", file);

    try {
      setUploading(true);
      const res = await axios.post(`${API_BASE}/upload/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.urls && res.data.urls.length > 0) {
        setForm((prev) => ({ ...prev, profileImage: res.data.urls[0] }));
      }
    } catch (err) {
      alert("Profile image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.phone) {
      setError("Full Name, Email, Password, and Phone are required");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/admin/request`, form);
      if (res.data?.admin) {
        setSubmittedAdmin(res.data.admin);
      }
    } catch (err) {
      setError(err.response?.data?.message ? err.response.data.message : "Failed to submit admin request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
              💼
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Registration</h2>
          <p className="text-sm text-slate-400 mt-1">
            Register as a Gym Owner to manage multiple gyms, trainers & members
          </p>
        </div>

        {submittedAdmin ? (
          <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-lg font-bold text-emerald-400 mb-1">Admin Request Submitted!</h3>
            <p className="text-sm text-slate-300 mb-4">
              Your registration request for <strong className="text-white">{submittedAdmin.name}</strong> has been sent to SuperAdmin for approval.
            </p>

            <div className="bg-slate-900 p-4 rounded-xl text-left text-xs text-slate-400 flex flex-col gap-1 mb-6 border border-slate-700">
              <div><strong className="text-slate-300">Admin Name:</strong> {submittedAdmin.name}</div>
              <div><strong className="text-slate-300">Email:</strong> {submittedAdmin.email}</div>
              <div><strong className="text-slate-300">Phone:</strong> {submittedAdmin.phone}</div>
              <div><strong className="text-slate-300">Status:</strong> <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">Pending SuperAdmin Approval</span></div>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Once approved by SuperAdmin, you can log in to your Admin Console to add and manage all your gyms, managers, trainers, and equipment.
            </p>

            <button
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 cursor-pointer"
              onClick={() => navigate("/")}
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-medium text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col text-left">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Owner Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Alex Mercer"
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col text-left">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="owner@gymsphere.com"
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col text-left">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password *</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col text-left">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g. 9876543210"
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col text-left">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Profile Picture (Cloudinary) 📸</label>
              <input type="file" accept="image/*" className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500" onChange={handleImageUpload} />
              {uploading && <p className="text-xs text-blue-400 mt-1">Uploading profile picture...</p>}
              {form.profileImage && (
                <img src={form.profileImage} alt="Profile preview" className="w-16 h-16 rounded-full object-cover border border-slate-700 mt-2" />
              )}
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 cursor-pointer active:scale-95 mt-2" disabled={loading}>
              {loading ? "Submitting Request..." : "Submit Admin Registration Request"}
            </button>

            <div className="text-center mt-2">
              <span className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer" onClick={() => navigate("/")}>
                ← Back to Login
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default GymRequestForm;
