import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Forgetpassword() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        otp: "",
        newpassword: "",
        confirmpassword: ""
    });

    const [error, setError] = useState({});
    const [otpSent, setOtpSent] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    const sendOtp = async () => {
        if (!form.email) {
            setError({ email: "Email is required" });
            return;
        }
        try {
            const result = await axios.post(`${import.meta.env.VITE_API_URL}/user/send-otp`, { email: form.email });
            alert(result.data.message);
            setOtpSent(true);
            setError({});
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let obj = {};

        if (!form.email) obj.email = "Email is required";
        if (!form.otp) obj.otp = "OTP is required";
        if (!form.newpassword) obj.newpassword = "New Password is required";
        if (!form.confirmpassword) obj.confirmpassword = "Confirm Password is required";

        if (Object.keys(obj).length > 0) {
            setError(obj);
            return;
        }

        try {
            const result = await axios.post(`${import.meta.env.VITE_API_URL}/user/forget-password`, form);

            alert(result.data.message);
            navigate("/");
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
                            🔑
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
                    <p className="text-sm text-slate-400 mt-1">Enter your email to receive an OTP</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col text-left">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-slate-900/90 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${error.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'}`}
                        />
                        {error.email && (
                            <p className="text-red-400 text-xs mt-1 font-medium">{error.email}</p>
                        )}
                    </div>

                    {!otpSent ? (
                        <button
                            type="button"
                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-200 cursor-pointer active:scale-95"
                            onClick={sendOtp}
                        >
                            Send OTP via Email
                        </button>
                    ) : (
                        <>
                            <div className="flex flex-col text-left">
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">OTP Code</label>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    name="otp"
                                    value={form.otp}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-slate-900/90 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${error.otp ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'}`}
                                />
                                {error.otp && (
                                    <p className="text-red-400 text-xs mt-1 font-medium">{error.otp}</p>
                                )}
                            </div>

                            <div className="flex flex-col text-left">
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    name="newpassword"
                                    value={form.newpassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-slate-900/90 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${error.newpassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'}`}
                                />
                                {error.newpassword && (
                                    <p className="text-red-400 text-xs mt-1 font-medium">{error.newpassword}</p>
                                )}
                            </div>

                            <div className="flex flex-col text-left">
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    name="confirmpassword"
                                    value={form.confirmpassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-slate-900/90 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${error.confirmpassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'}`}
                                />
                                {error.confirmpassword && (
                                    <p className="text-red-400 text-xs mt-1 font-medium">{error.confirmpassword}</p>
                                )}
                            </div>

                            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 cursor-pointer active:scale-95">
                                Forget Password
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-700/50 text-slate-300 font-semibold text-sm rounded-xl border border-slate-700 transition-all duration-200 cursor-pointer mt-1"
                    >
                        ← Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Forgetpassword;
