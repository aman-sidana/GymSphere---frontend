import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [selectedAdminDetails, setSelectedAdminDetails] = useState(null);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/all`, {
        params: {
          search,
          sort,
          status: statusFilter !== "all" ? statusFilter : undefined,
          page,
          limit,
        },
      });
      if (res.data?.success) {
        setAdmins(res.data.admins || []);
        setTotalAdmins(res.data.totalAdmins || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [search, sort, statusFilter, page, limit]);

  const handleApprove = async (id) => {
    try {
      const res = await axios.patch(`${API_BASE}/admin/approve/${id}`);
      if (res.data?.generatedPassword) {
        alert(`Admin approved successfully! 🎉\nGenerated Password: ${res.data.generatedPassword}\nLogin credentials have been sent via email to ${res.data.admin?.email}.`);
      } else {
        alert("Admin approved successfully!");
      }
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve admin");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`${API_BASE}/admin/reject/${id}`);
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject admin");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin account?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/delete/${id}`);
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete admin");
    }
  };

  const handleDirectAddAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/add`, {
        name,
        email,
        password,
        phone,
      });
      setShowAddModal(false);
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add admin");
    }
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white m-0">👨‍💼 Manage Platform Admins</h2>
        <button
          className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border-none"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Direct Add Admin
        </button>
      </div>

      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          <div className="relative min-w-[200px] flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          <div className="flex bg-slate-900 border border-slate-700 p-0.5 rounded-lg">
            <button
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer transition-colors ${statusFilter === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              onClick={() => { setStatusFilter("all"); setPage(1); }}
            >
              All
            </button>
            <button
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer transition-colors ${statusFilter === "pending" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              onClick={() => { setStatusFilter("pending"); setPage(1); }}
            >
              Pending
            </button>
            <button
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer transition-colors ${statusFilter === "approved" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              onClick={() => { setStatusFilter("approved"); setPage(1); }}
            >
              Approved
            </button>
            <button
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer transition-colors ${statusFilter === "rejected" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              onClick={() => { setStatusFilter("rejected"); setPage(1); }}
            >
              Rejected
            </button>
          </div>
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
              <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Joined Date</th>
              <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/80">
            {admins.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-slate-400">
                  No admin records found.
                </td>
              </tr>
            ) : (
              admins.map((adm, idx) => (
                <tr key={adm._id} className="hover:bg-slate-700/40 transition-colors">
                  <td className="px-3.5 py-2.5 text-slate-300">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-3.5 py-2.5 font-semibold text-white">{adm.name}</td>
                  <td className="px-3.5 py-2.5 text-slate-300">{adm.email}</td>
                  <td className="px-3.5 py-2.5 text-slate-300">{adm.phone}</td>
                  <td className="px-3.5 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${getBadgeStyle(adm.status)}`}>
                      {adm.status || "approved"}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-300">{new Date(adm.createdAt).toLocaleDateString()}</td>
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-sky-600 hover:bg-sky-500 text-white border-none flex items-center gap-1"
                        onClick={() => setSelectedAdminDetails(adm)}
                      >
                        👁️ View Details
                      </button>
                      {adm.status !== "approved" && (
                        <button
                          className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-emerald-600 hover:bg-emerald-500 text-white border-none"
                          onClick={() => handleApprove(adm._id)}
                        >
                          Approve
                        </button>
                      )}
                      {adm.status !== "rejected" && (
                        <button
                          className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-amber-600 hover:bg-amber-500 text-white border-none"
                          onClick={() => handleReject(adm._id)}
                        >
                          Reject
                        </button>
                      )}
                      <button
                        className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-red-600 hover:bg-red-500 text-white border-none"
                        onClick={() => handleDelete(adm._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex flex-wrap justify-between items-center px-3.5 py-2.5 bg-slate-900 border-t border-slate-700 text-xs gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-slate-400">
              Showing {admins.length} of {totalAdmins} admins (Page {page} of {totalPages})
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
            <span className="text-xs px-2 text-slate-300">
              {page} / {totalPages}
            </span>
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

      {selectedAdminDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-left relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">👨‍💼</span>
                <h3 className="text-base font-bold text-white m-0">Admin Details</h3>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white flex items-center justify-center border-none text-base cursor-pointer transition-colors"
                onClick={() => setSelectedAdminDetails(null)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700/60 flex items-center gap-3">
                {selectedAdminDetails.profileImage ? (
                  <img src={selectedAdminDetails.profileImage} alt="" className="w-14 h-14 rounded-full object-cover border border-slate-700" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-2xl border border-slate-700">
                    👤
                  </div>
                )}
                <div>
                  <h4 className="text-base font-bold text-white m-0">{selectedAdminDetails.name}</h4>
                  <span className="text-xs text-blue-400 font-semibold">Platform Admin / Gym Owner</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <span className="text-slate-200">{selectedAdminDetails.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone Number</span>
                  <span className="text-slate-200">{selectedAdminDetails.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Account Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize mt-1 ${getBadgeStyle(selectedAdminDetails.status)}`}>
                    {selectedAdminDetails.status || "approved"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Joined Date</span>
                  <span className="text-slate-200">{new Date(selectedAdminDetails.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white m-0">Direct Add New Admin</h3>
              <button className="bg-transparent border-none text-slate-400 text-lg cursor-pointer hover:text-white" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleDirectAddAdmin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Full Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Set initial password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-3">
                <button
                  type="button"
                  className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer border-none"
                >
                  Create Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;
