import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

function LocationManagement() {
  const [activeSubTab, setActiveSubTab] = useState("states"); 

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const [states, setStates] = useState([]);
  const [totalStates, setTotalStates] = useState(0);
  const [totalStatePages, setTotalStatePages] = useState(1);

  const [districts, setDistricts] = useState([]);
  const [totalDistricts, setTotalDistricts] = useState(0);
  const [totalDistrictPages, setTotalDistrictPages] = useState(1);

  const [cities, setCities] = useState([]);
  const [totalCities, setTotalCities] = useState(0);
  const [totalCityPages, setTotalCityPages] = useState(1);

  const [allStatesList, setAllStatesList] = useState([]);
  const [allDistrictsList, setAllDistrictsList] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formCountry, setFormCountry] = useState("India");
  const [formStateName, setFormStateName] = useState("");
  const [formDistrictName, setFormDistrictName] = useState("");
  const [formCityName, setFormCityName] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  const handleSubTabChange = (tab) => {
    setActiveSubTab(tab);
    setSearch("");
    setSort("asc");
    setStatusFilter("all");
    setPage(1);
  };

  const fetchStates = async () => {
    try {
      const res = await axios.get(`${API_BASE}/state/all`, {
        params: {
          search,
          sort,
          status: statusFilter !== "all" ? statusFilter : undefined,
          page,
          limit,
        },
      });
      if (res.data?.states) {
        setStates(res.data.states);
        setTotalStates(res.data.totalStates || 0);
        setTotalStatePages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching states:", err);
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/district/all`, {
        params: {
          search,
          sort: sort === "asc" ? "districtAsc" : "districtDesc",
          status: statusFilter !== "all" ? statusFilter : undefined,
          page,
          limit,
        },
      });
      if (res.data?.districts) {
        setDistricts(res.data.districts);
        setTotalDistricts(res.data.totalDistricts || 0);
        setTotalDistrictPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/city/all`, {
        params: {
          search,
          sort: sort === "asc" ? "cityAsc" : "cityDesc",
          status: statusFilter !== "all" ? statusFilter : undefined,
          page,
          limit,
        },
      });
      if (res.data?.cities) {
        setCities(res.data.cities);
        setTotalCities(res.data.totalCities || 0);
        setTotalCityPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  const fetchAllStatesDropdown = async () => {
    try {
      const res = await axios.get(`${API_BASE}/state/all`, { params: { limit: 1000 } });
      if (res.data?.states) {
        setAllStatesList(res.data.states);
      }
    } catch (err) {
      console.error("Error fetching states dropdown:", err);
    }
  };

  const fetchAllDistrictsDropdown = async () => {
    try {
      const res = await axios.get(`${API_BASE}/district/all`, { params: { limit: 1000 } });
      if (res.data?.districts) {
        setAllDistrictsList(res.data.districts);
      }
    } catch (err) {
      console.error("Error fetching districts dropdown:", err);
    }
  };

  const fetchInitialCounts = async () => {
    try {
      const [sRes, dRes, cRes] = await Promise.all([
        axios.get(`${API_BASE}/state/all`, { params: { limit: 1 } }),
        axios.get(`${API_BASE}/district/all`, { params: { limit: 1 } }),
        axios.get(`${API_BASE}/city/all`, { params: { limit: 1 } }),
      ]);
      if (sRes.data?.totalStates !== undefined) setTotalStates(sRes.data.totalStates);
      if (dRes.data?.totalDistricts !== undefined) setTotalDistricts(dRes.data.totalDistricts);
      if (cRes.data?.totalCities !== undefined) setTotalCities(cRes.data.totalCities);
    } catch (err) {
      console.error("Error fetching initial location counts:", err);
    }
  };

  useEffect(() => {
    fetchAllStatesDropdown();
    fetchAllDistrictsDropdown();
    fetchInitialCounts();
  }, []);

  useEffect(() => {
    if (activeSubTab === "states") fetchStates();
    else if (activeSubTab === "districts") fetchDistricts();
    else if (activeSubTab === "cities") fetchCities();
  }, [activeSubTab, search, sort, statusFilter, page, limit]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      if (activeSubTab === "states") {
        await axios.post(`${API_BASE}/state/add`, {
          countryName: formCountry,
          stateName: formStateName,
        });
        fetchStates();
        fetchAllStatesDropdown();
      } else if (activeSubTab === "districts") {
        await axios.post(`${API_BASE}/district/add`, {
          districtName: formDistrictName,
          stateId: selectedStateId,
        });
        fetchDistricts();
        fetchAllDistrictsDropdown();
      } else if (activeSubTab === "cities") {
        await axios.post(`${API_BASE}/city/add`, {
          cityName: formCityName,
          districtId: selectedDistrictId,
        });
        fetchCities();
      }
      setShowAddModal(false);
      resetForms();
      fetchInitialCounts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add item");
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    try {
      if (activeSubTab === "states") {
        await axios.put(`${API_BASE}/state/update?id=${selectedItem._id}`, {
          stateName: formStateName,
        });
        fetchStates();
      } else if (activeSubTab === "districts") {
        await axios.put(`${API_BASE}/district/update?id=${selectedItem._id}`, {
          districtName: formDistrictName,
          stateId: selectedStateId,
        });
        fetchDistricts();
      } else if (activeSubTab === "cities") {
        await axios.put(`${API_BASE}/city/update?id=${selectedItem._id}`, {
          cityName: formCityName,
          districtId: selectedDistrictId,
        });
        fetchCities();
      }
      setShowEditModal(false);
      resetForms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update item");
    }
  };

  const handleToggleStatus = async (item) => {
    const isCurrentlyActive = item.status;
    const action = isCurrentlyActive ? "soft-delete" : "restore";
    const endpoint = `${API_BASE}/${activeSubTab === "states" ? "state" : activeSubTab === "districts" ? "district" : "city"}/${action}?id=${item._id}`;
    try {
      await axios.patch(endpoint);
      if (activeSubTab === "states") fetchStates();
      else if (activeSubTab === "districts") fetchDistricts();
      else if (activeSubTab === "cities") fetchCities();
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    const endpoint = `${API_BASE}/${activeSubTab === "states" ? "state" : activeSubTab === "districts" ? "district" : "city"}/delete?id=${id}`;
    try {
      await axios.delete(endpoint);
      if (activeSubTab === "states") fetchStates();
      else if (activeSubTab === "districts") fetchDistricts();
      else if (activeSubTab === "cities") fetchCities();
      fetchInitialCounts();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleDownloadPDF = () => {
    const type = activeSubTab === "states" ? "state" : activeSubTab === "districts" ? "district" : "city";
    window.open(`${API_BASE}/${type}/pdf?search=${search}&sort=${sort}&status=${statusFilter}`, "_blank");
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    if (activeSubTab === "states") {
      setFormStateName(item.stateName);
      setFormCountry(item.countryName || "India");
    } else if (activeSubTab === "districts") {
      setFormDistrictName(item.districtName);
      setSelectedStateId(item.stateId?._id || item.stateId || "");
    } else if (activeSubTab === "cities") {
      setFormCityName(item.cityName);
      const districtObj = item.districtId;
      const parentStateId = districtObj?.stateId?._id || districtObj?.stateId || "";
      setSelectedStateId(parentStateId);
      setSelectedDistrictId(districtObj?._id || districtObj || "");
    }
    setShowEditModal(true);
  };

  const resetForms = () => {
    setFormCountry("India");
    setFormStateName("");
    setFormDistrictName("");
    setFormCityName("");
    setSelectedStateId("");
    setSelectedDistrictId("");
    setSelectedItem(null);
  };

  return (
    <div>
      <div className="flex gap-2.5 mb-5">
        <button
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeSubTab === "states"
            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
            : "bg-slate-800 border border-slate-700/80 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200"
            }`}
          onClick={() => handleSubTabChange("states")}
        >
          📍 States ({totalStates})
        </button>
        <button
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeSubTab === "districts"
            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
            : "bg-slate-800 border border-slate-700/80 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200"
            }`}
          onClick={() => handleSubTabChange("districts")}
        >
          🏙️ Districts ({totalDistricts})
        </button>
        <button
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeSubTab === "cities"
            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
            : "bg-slate-800 border border-slate-700/80 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200"
            }`}
          onClick={() => handleSubTabChange("cities")}
        >
          🌆 Cities ({totalCities})
        </button>
      </div>

      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          <div className="relative min-w-[200px] flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder={`Search ${activeSubTab}...`}
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
            <option value="asc">Name: A to Z</option>
            <option value="desc">Name: Z to A</option>
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
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer transition-colors ${statusFilter === "active" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              onClick={() => { setStatusFilter("active"); setPage(1); }}
            >
              Active
            </button>
            <button
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-pointer transition-colors ${statusFilter === "inactive" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              onClick={() => { setStatusFilter("inactive"); setPage(1); }}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="flex gap-2.5 items-center">
          <button
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border-none"
            onClick={handleDownloadPDF}
          >
            📄 Download PDF
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border-none"
            onClick={() => { resetForms(); setShowAddModal(true); }}
          >
            ➕ Add {activeSubTab.slice(0, -1)}
          </button>
        </div>
      </div>

      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            {activeSubTab === "states" && (
              <tr className="bg-slate-900 border-b border-slate-700">
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">#</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Country</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">State Name</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Status</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Actions</th>
              </tr>
            )}
            {activeSubTab === "districts" && (
              <tr className="bg-slate-900 border-b border-slate-700">
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">#</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">District Name</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">State</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Status</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Actions</th>
              </tr>
            )}
            {activeSubTab === "cities" && (
              <tr className="bg-slate-900 border-b border-slate-700">
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">#</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">City Name</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">District</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Status</th>
                <th className="text-slate-400 font-semibold px-3.5 py-2.5 uppercase tracking-wider text-[11px]">Actions</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-700/80">
            {activeSubTab === "states" &&
              (states.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-slate-400">
                    No states found.
                  </td>
                </tr>
              ) : (
                states.map((st, idx) => (
                  <tr key={st._id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-3.5 py-2.5 text-slate-300">{(page - 1) * limit + idx + 1}</td>
                    <td className="px-3.5 py-2.5 text-slate-300">{st.countryName || "India"}</td>
                    <td className="px-3.5 py-2.5 font-semibold text-white">{st.stateName}</td>
                    <td className="px-3.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${st.status ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
                        }`}>
                        {st.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-blue-600 hover:bg-blue-500 text-white border-none"
                          onClick={() => openEdit(st)}
                        >
                          Edit
                        </button>
                        <button
                          className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors border-none ${st.status ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"
                            }`}
                          onClick={() => handleToggleStatus(st)}
                        >
                          {st.status ? "Soft Delete" : "Restore"}
                        </button>
                        <button
                          className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-red-600 hover:bg-red-500 text-white border-none"
                          onClick={() => handleDeleteItem(st._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ))}

            {activeSubTab === "districts" &&
              (districts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-slate-400">
                    No districts found.
                  </td>
                </tr>
              ) : (
                districts.map((dst, idx) => (
                  <tr key={dst._id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-3.5 py-2.5 text-slate-300">{(page - 1) * limit + idx + 1}</td>
                    <td className="px-3.5 py-2.5 font-semibold text-white">{dst.districtName}</td>
                    <td className="px-3.5 py-2.5 text-slate-300">{dst.stateId?.stateName || "-"}</td>
                    <td className="px-3.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${dst.status ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
                        }`}>
                        {dst.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-blue-600 hover:bg-blue-500 text-white border-none"
                          onClick={() => openEdit(dst)}
                        >
                          Edit
                        </button>
                        <button
                          className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors border-none ${dst.status ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"
                            }`}
                          onClick={() => handleToggleStatus(dst)}
                        >
                          {dst.status ? "Soft Delete" : "Restore"}
                        </button>
                        <button
                          className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-red-600 hover:bg-red-500 text-white border-none"
                          onClick={() => handleDeleteItem(dst._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ))}

            {activeSubTab === "cities" &&
              (cities.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-slate-400">
                    No cities found.
                  </td>
                </tr>
              ) : (
                cities.map((ct, idx) => (
                  <tr key={ct._id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-3.5 py-2.5 text-slate-300">{(page - 1) * limit + idx + 1}</td>
                    <td className="px-3.5 py-2.5 font-semibold text-white">{ct.cityName}</td>
                    <td className="px-3.5 py-2.5 text-slate-300">{ct.districtId?.districtName || "-"}</td>
                    <td className="px-3.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${ct.status ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
                        }`}>
                        {ct.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-blue-600 hover:bg-blue-500 text-white border-none"
                          onClick={() => openEdit(ct)}
                        >
                          Edit
                        </button>
                        <button
                          className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors border-none ${ct.status ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"
                            }`}
                          onClick={() => handleToggleStatus(ct)}
                        >
                          {ct.status ? "Soft Delete" : "Restore"}
                        </button>
                        <button
                          className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors bg-red-600 hover:bg-red-500 text-white border-none"
                          onClick={() => handleDeleteItem(ct._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ))}
          </tbody>
        </table>

        <div className="flex flex-wrap justify-between items-center px-3.5 py-2.5 bg-slate-900 border-t border-slate-700 text-xs gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-slate-400">
              Showing Page {page} of{" "}
              {activeSubTab === "states"
                ? totalStatePages
                : activeSubTab === "districts"
                  ? totalDistrictPages
                  : totalCityPages}
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
              {page}
            </span>
            <button
              className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              disabled={
                page >=
                (activeSubTab === "states"
                  ? totalStatePages
                  : activeSubTab === "districts"
                    ? totalDistrictPages
                    : totalCityPages)
              }
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white m-0">Add New {activeSubTab.slice(0, -1)}</h3>
              <button className="bg-transparent border-none text-slate-400 text-lg cursor-pointer hover:text-white" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3.5">
              {activeSubTab === "states" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Country Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">State Name *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g. Maharashtra"
                      value={formStateName}
                      onChange={(e) => setFormStateName(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {activeSubTab === "districts" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Select State *</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      value={selectedStateId}
                      onChange={(e) => setSelectedStateId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose State --</option>
                      {allStatesList.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.stateName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">District Name *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g. Mumbai Suburban"
                      value={formDistrictName}
                      onChange={(e) => setFormDistrictName(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {activeSubTab === "cities" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Select State *</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      value={selectedStateId}
                      onChange={(e) => {
                        setSelectedStateId(e.target.value);
                        setSelectedDistrictId("");
                      }}
                      required
                    >
                      <option value="">-- Choose State --</option>
                      {allStatesList.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.stateName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Select District *</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      value={selectedDistrictId}
                      onChange={(e) => setSelectedDistrictId(e.target.value)}
                      disabled={!selectedStateId}
                      required
                    >
                      <option value="">
                        {selectedStateId ? "-- Choose District --" : "-- Select State First --"}
                      </option>
                      {allDistrictsList
                        .filter((dst) => (dst.stateId?._id || dst.stateId) === selectedStateId)
                        .map((dst) => (
                          <option key={dst._id} value={dst._id}>
                            {dst.districtName}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City Name *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g. Andheri"
                      value={formCityName}
                      onChange={(e) => setFormCityName(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white m-0">Edit {activeSubTab.slice(0, -1)}</h3>
              <button className="bg-transparent border-none text-slate-400 text-lg cursor-pointer hover:text-white" onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            <form onSubmit={handleEditItem} className="space-y-3.5">
              {activeSubTab === "states" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">State Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={formStateName}
                    onChange={(e) => setFormStateName(e.target.value)}
                    required
                  />
                </div>
              )}

              {activeSubTab === "districts" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Select State *</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      value={selectedStateId}
                      onChange={(e) => setSelectedStateId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose State --</option>
                      {allStatesList.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.stateName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">District Name *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={formDistrictName}
                      onChange={(e) => setFormDistrictName(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {activeSubTab === "cities" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Select State *</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      value={selectedStateId}
                      onChange={(e) => {
                        setSelectedStateId(e.target.value);
                        setSelectedDistrictId("");
                      }}
                      required
                    >
                      <option value="">-- Choose State --</option>
                      {allStatesList.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.stateName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Select District *</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      value={selectedDistrictId}
                      onChange={(e) => setSelectedDistrictId(e.target.value)}
                      disabled={!selectedStateId}
                      required
                    >
                      <option value="">
                        {selectedStateId ? "-- Choose District --" : "-- Select State First --"}
                      </option>
                      {allDistrictsList
                        .filter((dst) => (dst.stateId?._id || dst.stateId) === selectedStateId)
                        .map((dst) => (
                          <option key={dst._id} value={dst._id}>
                            {dst.districtName}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City Name *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={formCityName}
                      onChange={(e) => setFormCityName(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2.5 justify-end pt-3">
                <button
                  type="button"
                  className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer border-none"
                >
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationManagement;
