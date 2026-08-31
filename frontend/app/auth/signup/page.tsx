'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();

  // Account category is locked to 'user' since Government Official option is removed
  const [accountCategory] = useState<'user'>('user');
  
  // Sub-type: 'private' or 'gov_driver'
  const [userSubType, setUserSubType] = useState<'private' | 'gov_driver'>('private');

  // Form field states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [driverId, setDriverId] = useState('');
  const [department, setDepartment] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Prepare payload based on the selected registration route
    const payload = {
      full_name: fullName,
      email,
      password,
      account_category: accountCategory,
      user_sub_type: userSubType,
      driver_id: userSubType === 'gov_driver' ? driverId : null,
      department: userSubType === 'gov_driver' ? department : null,
    };

    try {
      // 1. Call your backend registration endpoint
      const response = await api.post("/auth/register", payload);

      // 2. Automatically save token if returned upon registration
      if (response.data?.access_token) {
        localStorage.setItem("token", response.data.access_token);
      }

      // 3. Route to drivers dashboard
      router.push('/drivers/');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create account. Please try again.");
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
              Join EnaV
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-4 mb-4 leading-tight">
              Mobility intelligence for <span className="text-cyan-400">real-world response.</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              EnaV connects emergency mobility, electric vehicles and charging infrastructure through one intelligent platform.
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
            <a href="/auth/login" className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1 mb-2">
              ← Back to sign in
            </a>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Create your <span className="text-cyan-400">EnaV</span> account
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Register to access EnaV mobility services.</p>
          </div>

          {/* User Sub-Type Selection */}
          <div className="mb-6 p-3 bg-gray-900/60 border border-gray-800 rounded-xl">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-2">Select Account Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUserSubType('private')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  userSubType === 'private'
                    ? 'border-cyan-400 bg-cyan-500/20 text-white'
                    : 'border-gray-800 text-gray-400 bg-gray-900'
                }`}
              >
                Private / Normal User
              </button>
              <button
                type="button"
                onClick={() => setUserSubType('gov_driver')}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  userSubType === 'gov_driver'
                    ? 'border-cyan-400 bg-cyan-500/20 text-white'
                    : 'border-gray-800 text-gray-400 bg-gray-900'
                }`}
              >
                Gov Driver / Operator
              </button>
            </div>
          </div>

          {/* Error Message Container */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Dynamic Form Fields based on Sub-Type Selections */}
          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* 1. USER -> GOV DRIVER */}
            {userSubType === 'gov_driver' && (
              <>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name" 
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" 
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Driver ID / Badge Number</label>
                  <input 
                    type="text" 
                    required
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    placeholder="Enter official driver ID" 
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Department / Agency</label>
                  <input 
                    type="text" 
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., Municipal Transport" 
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password" 
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" 
                  />
                </div>
              </>
            )}

            {/* 2. USER -> PRIVATE / NORMAL USER */}
            {userSubType === 'private' && (
              <>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name" 
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" 
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password" 
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" 
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-cyan-500/20 text-sm mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
            </button>
          </form>

          <div className="text-center mt-6 text-xs sm:text-sm text-gray-400">
            Already have an account? <a href="/auth/login" className="text-cyan-400 font-medium hover:underline">Log in</a>
          </div>

        </div>
      </div>

    </div>
  );
}