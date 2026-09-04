import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

function GymManagement() {
  const [gyms, setGyms] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalGyms, setTotalGyms] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [adminsList, setAdminsList] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [gymName, setGymName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [earnings, setEarnings] = useState(0);

  const [selectedGymDetails, setSelectedGymDetails] = useState(null);

  const fetchGyms = async () => {
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
      if (res.data?.success) {
        setGyms(res.data.gyms || []);
        setTotalGyms(res.data.totalGyms || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching gyms:", err);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [stRes, dstRes, ctRes, admRes] = await Promise.all([
        axios.get(`${API_BASE}/state/all`, { params: { limit: 1000 } }),
        axios.get(`${API_BASE}/district/all`, { params: { limit: 1000 } }),
        axios.get(`${API_BASE}/city/all`, { params: { limit: 1000 } }),
        axios.get(`${API_BASE}/admin/all`, { params: { limit: 1000 } }),
      ]);
      setStatesList(stRes.data?.states || []);
      setDistrictsList(dstRes.data?.districts || []);
      setCitiesList(ctRes.data?.cities || []);
      setAdminsList(admRes.data?.admins || []);
    } catch (err) {
      console.error("Error fetching location & admin dropdowns:", err);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchGyms();
  }, [search, sort, statusFilter, page, limit]);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`${API_BASE}/gym/approve/${id}`);
      fetchGyms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve gym");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`${API_BASE}/gym/reject/${id}`);
      fetchGyms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject gym");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this gym record?")) return;
    try {
      await axios.delete(`${API_BASE}/gym/delete/${id}`);
      fetchGyms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete gym");
    }
  };

  const handleDirectAddGym = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/gym/add`, {
        gymName,
        ownerName,
        email,
        phone,
        address,
        adminId: selectedAdminId || null,
        stateId: selectedState || null,
        districtId: selectedDistrict || null,
        cityId: selectedCity || null,
        earnings,
      });
      setShowAddModal(false);
      setGymName("");
      setOwnerName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setSelectedAdminId("");
      setSelectedState("");
      setSelectedDistrict("");
      setSelectedCity("");
      setEarnings(0);
      fetchGyms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add gym");
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
        <h2 className="text-xl font-bold text-white m-0">🏋️‍♂️ Manage Fitness Gyms</h2>
        <button
          className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border-none"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Direct Add Gym
        </button>
      </div>

      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          <div className="relative min-w-[200px] flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Search gym, owner, email..."
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
              <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Gym Name</th>
              <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Owner Name</th>
              <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Contact Info</th>
              <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Location</th>
              <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Status</th>
              <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/80">
            {gyms.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-slate-400">
                  No gym records found.
                </td>
              </tr>
            ) : (
              gyms.map((g, idx) => (
                <tr key={g._id} className="hover:bg-slate-700/40 transition-colors">
                  <td className="px-3.5 py-2.5 text-slate-300">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-3.5 py-2.5 font-semibold text-white">{g.gymName}</td>
                  <td className="px-3.5 py-2.5 text-slate-300">{g.ownerName}</td>
                  <td className="px-3.5 py-2.5">
                    <div className="text-slate-200">{g.email}</div>
                    <div className="text-slate-400 text-xs">{g.phone}</div>
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-300">
                    {g.cityId?.cityName || ""}{g.cityId ? ", " : ""}
                    {g.districtId?.districtName || ""}{g.districtId ? ", " : ""}
                    {g.stateId?.stateName || "Location not set"}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${getBadgeStyle(g.status)}`}>
                      {g.status || "approved"}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-sky-600 hover:bg-sky-500 text-white border-none flex items-center gap-1"
                        onClick={() => setSelectedGymDetails(g)}
                      >
                        👁️ View Details
                      </button>
                      {g.status !== "approved" && (
                        <button
                          className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-emerald-600 hover:bg-emerald-500 text-white border-none"
                          onClick={() => handleApprove(g._id)}
                        >
                          Approve
                        </button>
                      )}
                      {g.status !== "rejected" && (
                        <button
                          className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-amber-600 hover:bg-amber-500 text-white border-none"
                          onClick={() => handleReject(g._id)}
                        >
                          Reject
                        </button>
                      )}
                      <button
                        className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-red-600 hover:bg-red-500 text-white border-none"
                        onClick={() => handleDelete(g._id)}
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
              Showing {gyms.length} of {totalGyms} gyms (Page {page} of {totalPages})
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

      {selectedGymDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-left relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏢</span>
                <h3 className="text-base font-bold text-white m-0">Gym Details</h3>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white flex items-center justify-center border-none text-base cursor-pointer transition-colors"
                onClick={() => setSelectedGymDetails(null)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-700/60">
                <div>
                  <span className="text-slate-400 block text-[11px]">Gym Name</span>
                  <strong className="text-white text-sm">{selectedGymDetails.gymName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Owner Name</span>
                  <strong className="text-white text-sm">{selectedGymDetails.ownerName}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <span className="text-slate-200">{selectedGymDetails.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone Number</span>
                  <span className="text-slate-200">{selectedGymDetails.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize mt-1 ${getBadgeStyle(selectedGymDetails.status)}`}>
                    {selectedGymDetails.status || "approved"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Members Enrolled</span>
                  <strong className="text-emerald-400 text-sm">{selectedGymDetails.memberCount || 0} Members</strong>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Location (State, District, City)</span>
                <span className="text-white font-medium">
                  {selectedGymDetails.cityId?.cityName || ""}{selectedGymDetails.cityId ? ", " : ""}
                  {selectedGymDetails.districtId?.districtName || ""}{selectedGymDetails.districtId ? ", " : ""}
                  {selectedGymDetails.stateId?.stateName || "Not set"}
                </span>
              </div>

              {selectedGymDetails.address && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Street Address</span>
                  <span className="text-slate-200">{selectedGymDetails.address}</span>
                </div>
              )}

              {selectedGymDetails.images && selectedGymDetails.images.length > 0 && (
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1.5">Uploaded Gym Images 📸</span>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedGymDetails.images.map((imgUrl, i) => (
                      <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer">
                        <img src={imgUrl} alt={`Gym ${i + 1}`} className="w-full h-20 object-cover rounded-lg border border-slate-700 hover:opacity-90 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white m-0">Direct Add New Gym</h3>
              <button className="bg-transparent border-none text-slate-400 text-lg cursor-pointer hover:text-white" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleDirectAddGym} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gym Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Gold's Gym"
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Name *</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    value={selectedAdminId}
                    onChange={(e) => {
                      const adminId = e.target.value;
                      setSelectedAdminId(adminId);
                      const chosenAdmin = adminsList.find((a) => a._id === adminId);
                      if (chosenAdmin) {
                        setOwnerName(chosenAdmin.name || "");
                        setEmail(chosenAdmin.email || "");
                        setPhone(chosenAdmin.phone ? String(chosenAdmin.phone) : "");
                      } else {
                        setOwnerName("");
                        setEmail("");
                        setPhone("");
                      }
                    }}
                    required
                  >
                    <option value="">-- Select Admin --</option>
                    {adminsList.map((adm) => (
                      <option key={adm._id} value={adm._id}>
                        {adm.name} {adm.email ? `(${adm.email})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="gym@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone *</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedDistrict("");
                      setSelectedCity("");
                    }}
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
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedCity("");
                    }}
                  >
                    <option value="">-- District --</option>
                    {districtsList
                      .filter((dst) => !selectedState || (dst.stateId?._id || dst.stateId) === selectedState)
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
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="">-- City --</option>
                    {citiesList
                      .filter((ct) => !selectedDistrict || (ct.districtId?._id || ct.districtId) === selectedDistrict)
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
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Street address / Landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Revenue / Earnings (₹)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={earnings}
                  onChange={(e) => setEarnings(Number(e.target.value))}
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
                  Create Gym Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GymManagement;
