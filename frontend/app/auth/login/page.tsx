'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from "@/lib/api";

export default function LoginPage() {
  const [accountCategory, setAccountCategory] = useState<'user' | 'government'>('user');
  const [userSubType, setUserSubType] = useState<'private' | 'gov_driver'>('private');
  const router = useRouter();

  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [driverId, setDriverId] = useState(""); // For gov_driver sub-type
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Call backend login endpoint
      const response = await api.post("/auth/login", { email, password });

      // 2. Save the returned JWT access token securely
      localStorage.setItem("token", response.data.access_token);

      // 3. Fetch user profile to check their actual role from database
      // (Hum query parameter mein email bhej rahe hain jo abhi humne backend par banaya hai)
      const profileResponse = await api.get(`/auth/users/me?email=${email}`);
      const userRole = profileResponse.data.role; // Yeh "user", "gov_driver", ya government role hoga

      // 4. Route based on the role fetched from backend
      if (userRole === "government" || accountCategory === "government") {
        router.push("/gov/dashboard");
      } else if (userRole === "gov_driver" || userSubType === "gov_driver") {
        router.push("/gov/driver-dashboard"); // Ya jo bhi driver ka route ho
      } else {
        router.push("/drivers/");
      }

    } catch (err: any) {
      // Handle error messages coming from FastAPI
      setError(err.response?.data?.detail || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex flex-col lg:flex-row">

      {/* Left Branding Panel */}
      <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-800/60 bg-gradient-to-br from-[#070b12] via-[#0b1326] to-[#070b12]">
        <div>
          <div className="flex items-center gap-2 mb-8 sm:mb-12">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold">
              ⚡
            </div>
            <span className="text-xl font-bold tracking-wider">EnaV</span>
            <span className="text-xs text-gray-400 ml-2 hidden sm:inline">AI-POWERED MOBILITY INTELLIGENCE</span>
          </div>

          <div className="max-w-lg">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Welcome Back
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-4 mb-4 leading-tight">
              Driving the future of <span className="text-cyan-400">smart mobility.</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Log in to access real-time emergency coordination, smart EV routing, and infrastructure dashboards.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 lg:mt-12">
          <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/80">
            <div className="text-cyan-400 text-lg mb-1">🚨</div>
            <h3 className="font-semibold text-sm">Emergency Response</h3>
            <p className="text-xs text-gray-400 mt-1">Faster coordination.</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/80">
            <div className="text-cyan-400 text-lg mb-1">🔋</div>
            <h3 className="font-semibold text-sm">EV Mobility</h3>
            <p className="text-xs text-gray-400 mt-1">Smarter electric fleets.</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/80">
            <div className="text-cyan-400 text-lg mb-1">⚡</div>
            <h3 className="font-semibold text-sm">Charging Network</h3>
            <p className="text-xs text-gray-400 mt-1">Intelligent infrastructure.</p>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-8 flex items-center gap-2">
          <span>🔒</span> Secure. Reliable. Always.
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-16 flex flex-col justify-center overflow-y-auto">
        <div className="max-w-md w-full mx-auto">

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Login to <span className="text-cyan-400">EnaV</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Access your dashboard and services.</p>
          </div>

          {/* Primary Account Category Selection */}
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => setAccountCategory('user')}
              className={`flex-1 py-3 px-4 rounded-xl border text-xs sm:text-sm font-medium tracking-wide transition ${accountCategory === 'user'
                  ? 'border-cyan-500 bg-cyan-500/10 text-white'
                  : 'border-gray-800 bg-gray-900/50 text-gray-400'
                }`}
            >
              USER / DRIVER
            </button>
            <button
              type="button"
              onClick={() => setAccountCategory('government')}
              className={`flex-1 py-3 px-4 rounded-xl border text-xs sm:text-sm font-medium tracking-wide transition ${accountCategory === 'government'
                  ? 'border-cyan-500 bg-cyan-500/10 text-white'
                  : 'border-gray-800 bg-gray-900/50 text-gray-400'
                }`}
            >
              GOVERNMENT OFFICIAL
            </button>
          </div>

          {/* Secondary Sub-Type Selection */}
          {accountCategory === 'user' && (
            <div className="mb-6 p-3 bg-gray-900/60 border border-gray-800 rounded-xl">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-2">Select User Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUserSubType('private')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition ${userSubType === 'private'
                      ? 'border-cyan-400 bg-cyan-500/20 text-white'
                      : 'border-gray-800 text-gray-400 bg-gray-900'
                    }`}
                >
                  Private / Normal User
                </button>
                <button
                  type="button"
                  onClick={() => setUserSubType('gov_driver')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition ${userSubType === 'gov_driver'
                      ? 'border-cyan-400 bg-cyan-500/20 text-white'
                      : 'border-gray-800 text-gray-400 bg-gray-900'
                    }`}
                >
                  Gov Driver / Operator
                </button>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Dynamic Login Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* 1. GOVERNMENT OFFICIAL */}
            {accountCategory === 'government' && (
              <>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="official@gov.in"
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </>
            )}

            {/* 2. USER -> GOV DRIVER */}
            {accountCategory === 'user' && userSubType === 'gov_driver' && (
              <>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Driver ID / Badge Number</label>
                  <input
                    type="text"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    placeholder="Enter official driver ID"
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </>
            )}

            {/* 3. USER -> PRIVATE / NORMAL USER */}
            {accountCategory === 'user' && userSubType === 'private' && (
              <>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-cyan-500/20 text-sm mt-2 disabled:opacity-50"
            >
              {loading ? "LOGGING IN..." : "LOGIN →"}
            </button>
          </form>

          {accountCategory === 'user' && (
            <div className="text-center mt-6 text-xs sm:text-sm text-gray-400">
              Don't have an account? <a href="/auth/signup" className="text-cyan-400 font-medium hover:underline">Create account</a>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}