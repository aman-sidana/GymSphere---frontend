import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    function handleChange(e) {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        if (!form.email || !form.password) {
            setError("Email and Password are required")
            return;
        }

        setLoading(true)
        try {
            const result = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`, form)
            const token = result?.data?.token
            const currentuser = result?.data?.user

            localStorage.setItem('currentuser', JSON.stringify(currentuser))

            if (token) {
                localStorage.setItem('token', token)
                const role = currentuser?.role || "user";
                if (role === "superadmin") navigate('/superadmin');
                else if (role === "admin") navigate('/admin');
                else if (role === "gym_manager") navigate('/manager');
                else if (role === "trainer") navigate('/trainer');
                else navigate('/user');

                setForm({ email: "", password: "" })
            } else {
                setError("Password is incorrect")
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
                            🏋️‍♂️
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to GymSphere</h2>
                    <p className="text-sm text-slate-400 mt-1">Please sign in to continue to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col text-left">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    <div className="flex flex-col text-left">
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-semibold text-slate-300">Password</label>
                            <span
                                onClick={() => navigate('/forget-password')}
                                className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
                            >
                                Forgot?
                            </span>
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-medium text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                    <p className="text-xs text-slate-400 text-center mt-2">
                        Don't have an account?{" "}
                        <span
                            onClick={() => navigate("/signup")}
                            className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                        >
                            Sign up
                        </span>
                    </p>

                    <div className="relative flex items-center justify-center my-3">
                        <div className="w-full border-t border-slate-700"></div>
                        <span className="absolute bg-slate-800 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">OR</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/adminrequest')}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-700/50 text-blue-400 font-semibold text-sm rounded-xl border border-blue-500/40 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                    >
                        📝 Admin / Gym Request
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login