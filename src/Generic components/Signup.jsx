import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Signup() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" })
    const [error, setError] = useState("")

    function handleChange(e) {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
        if (error) setError("")
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.name || !form.email || !form.password) {
            setError("All fields are required")
            return
        }
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/user/signup`, form)
            navigate('/')
            setForm({ name: "", email: "", password: "", phone: "" })
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred during signup")
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
                            🏋️‍♂️
                        </div>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-1">
                        Create Account
                    </p>
                    <h2 className="text-2xl font-bold text-white">Join GymSphere</h2>
                    <p className="text-sm text-slate-400 mt-1">Start your fitness journey with us today</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col text-left">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    <div className="flex flex-col text-left">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    <div className="flex flex-col text-left">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    <div className="flex flex-col text-left">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
                        <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            name="phone"
                            value={form.phone}
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
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 cursor-pointer active:scale-95 mt-1"
                    >
                        Create Account
                    </button>
                </form>

                <div className="mt-5 pt-4 border-t border-slate-700/80 text-center">
                    <p className="text-xs text-slate-400">
                        Already have an account?{" "}
                        <Link to="/" className="text-sky-400 font-semibold hover:text-sky-300 transition-colors">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signup