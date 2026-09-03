"use client";

import React, { useState, useEffect } from "react";

interface DriverProfileState {
    name: string;
    email: string;
    password: string;
    vehicleId: string;
    vehicleType: string;
    batteryCapacity: number;
    currentSoc: number;
    consumptionRate: number;
    minReserve: number;
    profileImage: string;
}

interface Journey {
    id: string;
    date: string;
    source: string;
    destination: string;
    distanceKm: number;
    energyUsedKwh: number;
    co2SavedKg: number;
}

const PROFILE_STORAGE_KEY = "ev_driver_profile";

export const getRouteOptimizationPayload = (profile: DriverProfileState) => ({
    vehicle: {
        vehicle_id: profile.vehicleId,
        vehicle_type: profile.vehicleType,
        battery_percentage: profile.currentSoc,
        battery_capacity_kwh: profile.batteryCapacity,
        consumption_kwh_per_km: profile.consumptionRate,
        minimum_reserve_pct: profile.minReserve,
        is_emergency: false,
    },
});

export default function DriverProfilePage() {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingVehicle, setIsEditingVehicle] = useState(false);
    const [infoCard, setInfoCard] = useState<string | null>(null);

    const [profile, setProfile] = useState<DriverProfileState>({
        name: "Alex Turner",
        email: "alex.turner@enav.com",
        password: "••••••••",
        vehicleId: "EV-2048",
        vehicleType: "Standard EV Sedan",
        batteryCapacity: 75.0,
        currentSoc: 85.0,
        consumptionRate: 0.15,
        minReserve: 15.0,
        profileImage: "",
    });

    // Load the saved profile when the page opens.
    useEffect(() => {
        try {
            const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
            if (savedProfile) {
                const parsedProfile = JSON.parse(savedProfile) as Partial<DriverProfileState>;
                setProfile((current) => ({ ...current, ...parsedProfile }));
            }
        } catch (error) {
            console.error("Failed to load saved driver profile:", error);
        }
    }, []);

    const saveProfile = (updatedProfile = profile) => {
        try {
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
        } catch (error) {
            console.error("Failed to save driver profile:", error);
        }
    };

    const [journeys] = useState<Journey[]>([
        { id: "J-101", date: "2026-09-02", source: "Kashmiri Gate", destination: "Connaught Place", distanceKm: 9.79, energyUsedKwh: 1.47, co2SavedKg: 2.1 },
        { id: "J-102", date: "2026-09-01", source: "Dwarka Sector 21", destination: "Gurugram Cyber City", distanceKm: 18.5, energyUsedKwh: 2.78, co2SavedKg: 4.0 },
        { id: "J-103", date: "2026-08-30", source: "Noida Sector 18", destination: "IGI Airport", distanceKm: 32.4, energyUsedKwh: 4.86, co2SavedKg: 7.1 },
    ]);

    const totalTrips = journeys.length;
    const totalDistance = journeys.reduce((acc, j) => acc + j.distanceKm, 0);
    const totalEnergyUsed = journeys.reduce((acc, j) => acc + j.energyUsedKwh, 0);
    const totalCo2Saved = journeys.reduce((acc, j) => acc + j.co2SavedKg, 0);
    const fuelDisplacedLiters = totalEnergyUsed * 0.1;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, profileImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-10 max-w-7xl mx-auto font-sans">
            {/* Header */}
            <div className="border-b border-slate-800 pb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Profile</h1>
                <p className="text-base text-slate-400 mt-2">Manage your account credentials, vehicle specifications, and sustainability performance.</p>
            </div>

            {/* SECTION 1: Personal Information */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-white">Personal Information</h3>
                        <div className="relative">
                            <button 
                                onClick={() => setInfoCard(infoCard === "profile" ? null : "profile")} 
                                className="w-7 h-7 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 text-sm font-bold flex items-center justify-center hover:bg-cyan-500/20 transition-all"
                            >
                                i
                            </button>
                            {infoCard === "profile" && (
                                <div className="absolute left-0 mt-2 w-80 p-4 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl z-20 text-sm text-slate-300 leading-relaxed">
                                    <p className="font-semibold text-white mb-1">Your Account Details</p>
                                    View and update your personal details, secure password, and upload your profile picture for identification.
                                </div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            if (isEditingProfile) saveProfile();
                            setIsEditingProfile(!isEditingProfile);
                        }} 
                        className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/20 transition-all"
                    >
                        {isEditingProfile ? "Save Changes" : "Edit Profile"}
                    </button>
                </div>

                <div className="mt-8 flex flex-col md:flex-row items-start md:items-center gap-8">
                    {/* Large Profile Photo Upload Section */}
                    <div className="flex items-center space-x-6">
                        <div className="w-28 h-28 rounded-3xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden relative shadow-inner">
                            {profile.profileImage ? (
                                <img src={profile.profileImage} alt="Driver" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-slate-400">{profile.name.charAt(0)}</span>
                            )}
                        </div>
                        {isEditingProfile && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Upload Profile Photo</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer" />
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 w-full">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                            {isEditingProfile ? (
                                <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-white text-base focus:outline-none focus:border-cyan-500" />
                            ) : (
                                <p className="text-lg font-semibold text-white px-1 py-2">{profile.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                            {isEditingProfile ? (
                                <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-white text-base focus:outline-none focus:border-cyan-500" />
                            ) : (
                                <p className="text-lg font-semibold text-white px-1 py-2">{profile.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                            {isEditingProfile ? (
                                <input type="password" value={profile.password} onChange={(e) => setProfile({...profile, password: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-white text-base focus:outline-none focus:border-cyan-500" />
                            ) : (
                                <p className="text-lg font-semibold text-white px-1 py-2">{profile.password}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: Vehicle & EV Parameters */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-white">Vehicle & EV Parameters</h3>
                        <div className="relative">
                            <button 
                                onClick={() => setInfoCard(infoCard === "vehicle" ? null : "vehicle")} 
                                className="w-7 h-7 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 text-sm font-bold flex items-center justify-center hover:bg-cyan-500/20 transition-all"
                            >
                                i
                            </button>
                            {infoCard === "vehicle" && (
                                <div className="absolute left-0 mt-2 w-80 p-4 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl z-20 text-sm text-slate-300 leading-relaxed">
                                    <p className="font-semibold text-white mb-1">Electric Vehicle Settings</p>
                                    Configure your car's battery range, efficiency, and safety reserve limits so the app can precisely map out optimal charging stops and routes for you.
                                </div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            if (isEditingVehicle) saveProfile();
                            setIsEditingVehicle(!isEditingVehicle);
                        }} 
                        className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/20 transition-all"
                    >
                        {isEditingVehicle ? "Save Parameters" : "Edit Vehicle"}
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">
                        <p className="text-sm text-slate-400 font-medium">Vehicle ID</p>
                        {isEditingVehicle ? (
                            <input
                                type="text"
                                value={profile.vehicleId}
                                onChange={(e) => setProfile({...profile, vehicleId: e.target.value})}
                                placeholder="Enter vehicle ID"
                                className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base focus:outline-none focus:border-cyan-500"
                            />
                        ) : (
                            <p className="text-2xl font-bold text-white mt-2">{profile.vehicleId}</p>
                        )}
                    </div>
                    <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">
                        <p className="text-sm text-slate-400 font-medium">Vehicle Type</p>
                        {isEditingVehicle ? (
                            <input
                                type="text"
                                value={profile.vehicleType}
                                onChange={(e) => setProfile({...profile, vehicleType: e.target.value})}
                                placeholder="Enter vehicle type"
                                className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base focus:outline-none focus:border-cyan-500"
                            />
                        ) : (
                            <p className="text-2xl font-bold text-white mt-2">{profile.vehicleType}</p>
                        )}
                    </div>
                    <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">
                        <p className="text-sm text-slate-400 font-medium">Battery Capacity</p>
                        {isEditingVehicle ? (
                            <input type="number" value={profile.batteryCapacity} onChange={(e) => setProfile({...profile, batteryCapacity: parseFloat(e.target.value)})} className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base" />
                        ) : (
                            <p className="text-2xl font-bold text-white mt-2">{profile.batteryCapacity} kWh</p>
                        )}
                    </div>
                    <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">
                        <p className="text-sm text-slate-400 font-medium">Current SOC</p>
                        {isEditingVehicle ? (
                            <input type="number" value={profile.currentSoc} onChange={(e) => setProfile({...profile, currentSoc: parseFloat(e.target.value)})} className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base" />
                        ) : (
                            <p className="text-2xl font-bold text-cyan-400 mt-2">{profile.currentSoc}%</p>
                        )}
                    </div>
                    <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">
                        <p className="text-sm text-slate-400 font-medium">Consumption Rate</p>
                        {isEditingVehicle ? (
                            <input type="number" step="0.01" value={profile.consumptionRate} onChange={(e) => setProfile({...profile, consumptionRate: parseFloat(e.target.value)})} className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base" />
                        ) : (
                            <p className="text-2xl font-bold text-white mt-2">{profile.consumptionRate} kWh/km</p>
                        )}
                    </div>
                    <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">
                        <p className="text-sm text-slate-400 font-medium">Min Reserve Floor</p>
                        {isEditingVehicle ? (
                            <input type="number" value={profile.minReserve} onChange={(e) => setProfile({...profile, minReserve: parseFloat(e.target.value)})} className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base" />
                        ) : (
                            <p className="text-2xl font-bold text-amber-400 mt-2">{profile.minReserve}%</p>
                        )}
                    </div>
                </div>
            </div>

            {/* SECTION 3: Carbon Credits & Sustainability Impact */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-white">Carbon Credits & Sustainability Impact</h3>
                        <div className="relative">
                            <button 
                                onClick={() => setInfoCard(infoCard === "carbon" ? null : "carbon")} 
                                className="w-7 h-7 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 text-sm font-bold flex items-center justify-center hover:bg-cyan-500/20 transition-all"
                            >
                                i
                            </button>
                            {infoCard === "carbon" && (
                                <div className="absolute left-0 mt-2 w-88 p-4 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl z-20 text-sm text-slate-300 space-y-2">
                                    <p className="font-semibold text-white">How CO2 Savings Are Calculated:</p>
                                    <p>We compare your electric vehicle travel footprint against a standard petrol/diesel car emissions baseline:</p>
                                    <div className="bg-slate-900 p-3 rounded-xl font-mono text-cyan-300 text-xs overflow-x-auto">
                                        CO₂ Saved (kg) = Distance (km) × 0.22 kg/km
                                    </div>
                                    <p className="text-xs text-slate-400">Assuming an average fossil-fuel vehicle emits roughly 0.22 kg of CO2 per kilometer driven.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 text-center">
                    <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">
                        <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Total Trips</p>
                        <p className="text-3xl font-extrabold text-white mt-3">{totalTrips}</p>
                    </div>
                    <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">
                        <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Distance Covered</p>
                        <p className="text-3xl font-extrabold text-white mt-3">{totalDistance.toFixed(1)} km</p>
                    </div>
                    <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">
                        <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Fuel Displaced</p>
                        <p className="text-3xl font-extrabold text-amber-400 mt-3">{fuelDisplacedLiters.toFixed(1)} L</p>
                    </div>
                    <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">
                        <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">CO2 Saved</p>
                        <p className="text-3xl font-extrabold text-emerald-400 mt-3">{totalCo2Saved.toFixed(1)} kg</p>
                    </div>
                </div>
            </div>

            {/* SECTION 4: Journey History Log */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-white">Journey History Log</h3>
                        <div className="relative">
                            <button 
                                onClick={() => setInfoCard(infoCard === "history" ? null : "history")} 
                                className="w-7 h-7 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 text-sm font-bold flex items-center justify-center hover:bg-cyan-500/20 transition-all"
                            >
                                i
                            </button>
                            {infoCard === "history" && (
                                <div className="absolute left-0 mt-2 w-80 p-4 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl z-20 text-sm text-slate-300 leading-relaxed">
                                    <p className="font-semibold text-white mb-1">Past Travel Log</p>
                                    Review a complete chronological record of all your completed trips, distance tracked, energy used, and carbon saved.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 overflow-x-auto">
                    <table className="w-full text-left text-base">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="pb-4 px-4">Journey ID & Date</th>
                                <th className="pb-4 px-4">Route Path</th>
                                <th className="pb-4 px-4">Distance</th>
                                <th className="pb-4 px-4">Energy Consumed</th>
                                <th className="pb-4 px-4">CO2 Offset</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {journeys.map((j) => (
                                <tr key={j.id} className="hover:bg-slate-950/40 transition-all">
                                    <td className="py-5 px-4">
                                        <p className="font-bold text-white text-base">{j.id}</p>
                                        <p className="text-sm text-slate-400 mt-1">{j.date}</p>
                                    </td>
                                    <td className="py-5 px-4 text-slate-200 font-medium">
                                        {j.source} &rarr; {j.destination}
                                    </td>
                                    <td className="py-5 px-4 font-bold text-white">{j.distanceKm} km</td>
                                    <td className="py-5 px-4 text-cyan-400 font-bold">{j.energyUsedKwh} kWh</td>
                                    <td className="py-5 px-4 text-emerald-400 font-bold">{j.co2SavedKg} kg</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}