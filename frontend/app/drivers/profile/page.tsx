"use client";

import { api } from "@/lib/api";
import React, { useState, useEffect } from "react";

interface DriverProfileState {
  name: string;
  email: string;
  vehicleId: string;
  vehicleType: string;
  batteryCapacity: number;
  currentSoc: number;
  consumptionRate: number;
  minReserve: number;
  profileImage: string;
  totalDistanceKm: number;
  co2SavedKg: number;
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

export const getRouteOptimizationPayload = (
  profile: DriverProfileState
) => ({
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

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [profile, setProfile] = useState<DriverProfileState>({
    name: "",
    email: "",
    vehicleId: "",
    vehicleType: "",
    batteryCapacity: 0,
    currentSoc: 0,
    consumptionRate: 0,
    minReserve: 0,
    profileImage: "",
    totalDistanceKm: 0,
    co2SavedKg: 0,
  });

  const [journeys, setJourneys] = useState<Journey[]>([]);

  // Load the saved profile when the page opens.
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const savedEmail = localStorage.getItem("userEmail");

        if (!token || !savedEmail) return;

        const response = await api.get(
          `/auth/users/me?email=${savedEmail}`
        );

        setProfile((current) => ({
          ...current,
          name: response.data.full_name,
          email: response.data.email,
          totalDistanceKm:
            response.data.total_distance_km ?? 0,
          co2SavedKg:
            response.data.co2_saved_kg ?? 0,
        }));

        // Vehicle failure should NOT stop journey loading
        try {
          const vehicleResponse = await api.get(
            `/vehicle/user/${response.data.id}`
          );

          setProfile((current) => ({
            ...current,
            vehicleId: String(vehicleResponse.data.id),
            vehicleType:
              vehicleResponse.data.vehicle_type,
            batteryCapacity:
              vehicleResponse.data.battery_capacity_kwh ?? 0,
            currentSoc:
              vehicleResponse.data.current_battery_percentage ?? 0,
          }));
        } catch (error) {
          console.log("No vehicle saved yet.");
        }

        // Always load journey history independently
        try {
          const journeyResponse = await api.get(
            `/journey/user/${response.data.id}`
          );

          setJourneys(
            journeyResponse.data.map((journey: any) => ({
              id: String(journey.id),
              date: new Date(journey.completed_at)
                .toISOString()
                .split("T")[0],
              source: journey.source,
              destination: journey.destination,
              distanceKm: journey.distance_km,
              energyUsedKwh:
                journey.energy_used_kwh,
              co2SavedKg:
                journey.co2_saved_kg,
            }))
          );
        } catch (error) {
          console.error(
            "Failed to load journey history:",
            error
          );
        }
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );
      }
    };

    loadProfile();
  }, []);

  const saveProfile = (
    updatedProfile = profile
  ) => {
    try {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );
    } catch (error) {
      console.error(
        "Failed to save driver profile:",
        error
      );
    }
  };

  const totalTrips = journeys.length;

  const totalDistance =
    profile.totalDistanceKm ?? 0;

  const totalEnergyUsed = journeys.reduce(
    (acc, j) => acc + j.energyUsedKwh,
    0
  );

  // Use the actual completed journeys for
  // consumption calculation.
  const totalJourneyDistance = journeys.reduce(
    (acc, j) => acc + j.distanceKm,
    0
  );

  const totalCo2Saved =
    profile.co2SavedKg ?? 0;

  const fuelDisplacedLiters =
    totalEnergyUsed * 0.1;

  // Automatically calculated:
  // Total energy used / total distance
  const calculatedConsumptionRate =
    totalJourneyDistance > 0
      ? totalEnergyUsed / totalJourneyDistance
      : 0;

  // Keep the automatically calculated
  // consumption rate available for route optimization.
  useEffect(() => {
    if (journeys.length === 0) return;

    try {
      const savedProfile =
        localStorage.getItem(
          PROFILE_STORAGE_KEY
        );

      const storedProfile = savedProfile
        ? JSON.parse(savedProfile)
        : {};

      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({
          ...storedProfile,
          consumptionRate:
            calculatedConsumptionRate,
        })
      );
    } catch (error) {
      console.error(
        "Failed to sync calculated consumption rate:",
        error
      );
    }
  }, [
    journeys,
    calculatedConsumptionRate,
  ]);

  const saveVehicle = async () => {
    try {
      const userId =
        localStorage.getItem("userId");

      if (!userId) return;

      const updatedProfile = {
        ...profile,
        consumptionRate:
          calculatedConsumptionRate,
      };

      await api.post("/vehicle/save", {
        user_id: Number(userId),
        vehicle_name:
          updatedProfile.vehicleId,
        vehicle_type:
          updatedProfile.vehicleType,
        battery_capacity_kwh:
          updatedProfile.batteryCapacity,
        current_battery_percentage:
          updatedProfile.currentSoc,
        range_km: null,
      });

      localStorage.setItem(
        "userVehicle",
        JSON.stringify(updatedProfile)
      );

      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );

      setProfile(updatedProfile);
      setIsEditingVehicle(false);
    } catch (error) {
      console.error(
        "Failed to save vehicle:",
        error
      );
    }
  };

  // Change password
  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const email =
        localStorage.getItem("userEmail");

      if (!email) {
        setPasswordError(
          "Unable to identify your account."
        );
        return;
      }

      await api.post(
        "/auth/change-password",
        {
          email,
          current_password:
            currentPassword,
          new_password: newPassword,
        }
      );

      setPasswordSuccess(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess("");
      }, 1500);
    } catch (error: any) {
      setPasswordError(
        error.response?.data?.detail ||
          "Unable to change password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setProfile({
          ...profile,
          profileImage:
            reader.result as string,
        });
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-10 max-w-7xl mx-auto font-sans">

      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Profile
        </h1>

        <p className="text-base text-slate-400 mt-2">
          Manage your account credentials, vehicle specifications,
          and sustainability performance.
        </p>
      </div>

      {/* SECTION 1: Personal Information */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl relative">

        <div className="flex items-center justify-between border-b border-slate-800 pb-5">

          <div className="flex items-center space-x-3">

            <h3 className="text-xl font-bold text-white">
              Personal Information
            </h3>

            <div className="relative">

              <button
                onClick={() =>
                  setInfoCard(
                    infoCard === "profile"
                      ? null
                      : "profile"
                  )
                }
                className="w-7 h-7 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 text-sm font-bold flex items-center justify-center hover:bg-cyan-500/20 transition-all"
              >
                i
              </button>

              {infoCard === "profile" && (
                <div className="absolute left-0 mt-2 w-80 p-4 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl z-20 text-sm text-slate-300 leading-relaxed">

                  <p className="font-semibold text-white mb-1">
                    Your Account Details
                  </p>

                  View and update your personal details, secure
                  password, and upload your profile picture for
                  identification.

                </div>
              )}

            </div>
          </div>

          <button
            onClick={() => {
              if (isEditingProfile) {
                saveProfile();
              }

              setIsEditingProfile(
                !isEditingProfile
              );
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/20 transition-all"
          >
            {isEditingProfile
              ? "Save Changes"
              : "Edit Profile"}
          </button>

        </div>

        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center gap-8">

          {/* Large Profile Photo Upload Section */}
          <div className="flex items-center space-x-6">

            <div className="w-28 h-28 rounded-3xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden relative shadow-inner">

              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Driver"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-slate-400">
                  {profile.name.charAt(0)}
                </span>
              )}

            </div>

            {isEditingProfile && (
              <div>

                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Upload Profile Photo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-sm text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer"
                />

              </div>
            )}

          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 w-full">

            {/* Full Name */}
            <div>

              <label className="block text-sm font-medium text-slate-400 mb-2">
                Full Name
              </label>

              {isEditingProfile ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      name: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-white text-base focus:outline-none focus:border-cyan-500"
                />
              ) : (
                <p className="text-lg font-semibold text-white px-1 py-2">
                  {profile.name}
                </p>
              )}

            </div>

            {/* Email */}
            <div>

              <label className="block text-sm font-medium text-slate-400 mb-2">
                Email Address
              </label>

              {isEditingProfile ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      email: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-white text-base focus:outline-none focus:border-cyan-500"
                />
              ) : (
                <p className="text-lg font-semibold text-white px-1 py-2">
                  {profile.email}
                </p>
              )}

            </div>

            {/* Password */}
            <div>

              <label className="block text-sm font-medium text-slate-400 mb-2">
                Password
              </label>

              {!isEditingProfile ? (
                <p className="text-lg font-semibold text-slate-500 px-1 py-2">
                  ••••••••
                </p>
              ) : (
                <div className="flex items-center gap-3">

                  <p className="text-lg font-semibold text-slate-500 px-1 py-2">
                    ••••••••
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswordModal(
                        true
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold hover:bg-cyan-500/20 transition-all"
                  >
                    Change Password
                  </button>

                </div>
              )}

            </div>

          </div>
        </div>
      </div>

      {/* SECTION 2: Vehicle & EV Parameters */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl relative">

        <div className="flex items-center justify-between border-b border-slate-800 pb-5">

          <div className="flex items-center space-x-3">

            <h3 className="text-xl font-bold text-white">
              Vehicle & EV Parameters
            </h3>

            <div className="relative">

              <button
                onClick={() =>
                  setInfoCard(
                    infoCard === "vehicle"
                      ? null
                      : "vehicle"
                  )
                }
                className="w-7 h-7 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 text-sm font-bold flex items-center justify-center hover:bg-cyan-500/20 transition-all"
              >
                i
              </button>

              {infoCard === "vehicle" && (
                <div className="absolute left-0 mt-2 w-80 p-4 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl z-20 text-sm text-slate-300 leading-relaxed">

                  <p className="font-semibold text-white mb-1">
                    Electric Vehicle Settings
                  </p>

                  Configure your car's battery range, efficiency,
                  and safety reserve limits so the app can precisely
                  map out optimal charging stops and routes for you.

                </div>
              )}

            </div>
          </div>

          <button
            onClick={() => {
              if (isEditingVehicle) {
                saveVehicle();
              }

              setIsEditingVehicle(
                !isEditingVehicle
              );
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/20 transition-all"
          >
            {isEditingVehicle
              ? "Save Parameters"
              : "Edit Vehicle"}
          </button>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">

          {/* Vehicle ID */}
          <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">

            <p className="text-sm text-slate-400 font-medium">
              Vehicle ID
            </p>

            {isEditingVehicle ? (
              <input
                type="text"
                value={profile.vehicleId}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    vehicleId:
                      e.target.value,
                  })
                }
                placeholder="Enter vehicle ID"
                className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base focus:outline-none focus:border-cyan-500"
              />
            ) : (
              <p className="text-2xl font-bold text-white mt-2">
                {profile.vehicleId}
              </p>
            )}

          </div>

          {/* Vehicle Type */}
          <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">

            <p className="text-sm text-slate-400 font-medium">
              Vehicle Type
            </p>

            {isEditingVehicle ? (
              <input
                type="text"
                value={profile.vehicleType}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    vehicleType:
                      e.target.value,
                  })
                }
                placeholder="Enter vehicle type"
                className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base focus:outline-none focus:border-cyan-500"
              />
            ) : (
              <p className="text-2xl font-bold text-white mt-2">
                {profile.vehicleType}
              </p>
            )}

          </div>

          {/* Battery Capacity */}
          <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">

            <p className="text-sm text-slate-400 font-medium">
              Battery Capacity
            </p>

            {isEditingVehicle ? (
              <input
                type="text"
                inputMode="decimal"
                value={
                  profile.batteryCapacity === 0
                    ? ""
                    : profile.batteryCapacity
                }
                onChange={(e) => {
                  const value =
                    e.target.value;

                  if (
                    /^\d*\.?\d*$/.test(value)
                  ) {
                    setProfile({
                      ...profile,
                      batteryCapacity:
                        value === ""
                          ? 0
                          : Number(value),
                    });
                  }
                }}
                placeholder="Enter battery capacity"
                className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base focus:outline-none focus:border-cyan-500"
              />
            ) : (
              <p className="text-2xl font-bold text-white mt-2">
                {profile.batteryCapacity} kWh
              </p>
            )}

          </div>

          {/* Current SOC */}
          <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">

            <p className="text-sm text-slate-400 font-medium">
              Current SOC
            </p>

            {isEditingVehicle ? (
              <input
                type="text"
                inputMode="numeric"
                value={
                  profile.currentSoc === 0
                    ? ""
                    : profile.currentSoc
                }
                onChange={(e) => {
                  const value =
                    e.target.value;

                  if (/^\d*$/.test(value)) {
                    const numericValue =
                      value === ""
                        ? 0
                        : Number(value);

                    if (
                      numericValue <= 100
                    ) {
                      setProfile({
                        ...profile,
                        currentSoc:
                          numericValue,
                      });
                    }
                  }
                }}
                placeholder="Enter SOC (0-100%)"
                className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base focus:outline-none focus:border-cyan-500"
              />
            ) : (
              <p className="text-2xl font-bold text-cyan-400 mt-2">
                {profile.currentSoc}%
              </p>
            )}

          </div>

          {/* Consumption Rate */}
          <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">

            <p className="text-sm text-slate-400 font-medium">
              Consumption Rate
            </p>

            <p className="text-2xl font-bold text-white mt-2">
              {calculatedConsumptionRate > 0
                ? calculatedConsumptionRate.toFixed(
                    3
                  )
                : "Not available"}{" "}
              {calculatedConsumptionRate > 0 &&
                "kWh/km"}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Automatically calculated from all completed journeys
            </p>

          </div>

          {/* Min Reserve Floor */}
          <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">

            <p className="text-sm text-slate-400 font-medium">
              Min Reserve Floor
            </p>

            {isEditingVehicle ? (
              <input
                type="text"
                inputMode="decimal"
                value={
                  profile.minReserve === 0
                    ? ""
                    : profile.minReserve
                }
                onChange={(e) => {
                  const value =
                    e.target.value;

                  if (
                    /^\d*\.?\d*$/.test(value)
                  ) {
                    const numericValue =
                      value === ""
                        ? 0
                        : Number(value);

                    if (
                      numericValue <= 100
                    ) {
                      setProfile({
                        ...profile,
                        minReserve:
                          numericValue,
                      });
                    }
                  }
                }}
                placeholder="Enter minimum reserve"
                className="w-full mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base focus:outline-none focus:border-cyan-500"
              />
            ) : (
              <p className="text-2xl font-bold text-amber-400 mt-2">
                {profile.minReserve}%
              </p>
            )}

          </div>

        </div>
      </div>

      {/* SECTION 3: Carbon Credits & Sustainability Impact */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl relative">

        <div className="flex items-center justify-between border-b border-slate-800 pb-5">

          <div className="flex items-center space-x-3">

            <h3 className="text-xl font-bold text-white">
              Carbon Credits & Sustainability Impact
            </h3>

            <div className="relative">

              <button
                onClick={() =>
                  setInfoCard(
                    infoCard === "carbon"
                      ? null
                      : "carbon"
                  )
                }
                className="w-7 h-7 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 text-sm font-bold flex items-center justify-center hover:bg-cyan-500/20 transition-all"
              >
                i
              </button>

              {infoCard === "carbon" && (
                <div className="absolute left-0 mt-2 w-88 p-4 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl z-20 text-sm text-slate-300 space-y-2">

                  <p className="font-semibold text-white">
                    How CO2 Savings Are Calculated:
                  </p>

                  <p>
                    We compare your electric vehicle travel footprint
                    against a standard petrol/diesel car emissions
                    baseline:
                  </p>

                  <div className="bg-slate-900 p-3 rounded-xl font-mono text-cyan-300 text-xs overflow-x-auto">
                    CO₂ Saved (kg) = Distance (km) × 0.22 kg/km
                  </div>

                  <p className="text-xs text-slate-400">
                    Assuming an average fossil-fuel vehicle emits
                    roughly 0.22 kg of CO2 per kilometer driven.
                  </p>

                </div>
              )}

            </div>
          </div>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 text-center">

          {/* Total Trips */}
          <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">

            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Total Trips
            </p>

            <p className="text-3xl font-extrabold text-white mt-3">
              {totalTrips}
            </p>

          </div>

          {/* Distance */}
          <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">

            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Distance Covered
            </p>

            <p className="text-3xl font-extrabold text-white mt-3">
              {totalDistance.toFixed(1)} km
            </p>

          </div>

          {/* Fuel */}
          <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">

            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Fuel Displaced
            </p>

            <p className="text-3xl font-extrabold text-amber-400 mt-3">
              {fuelDisplacedLiters.toFixed(1)} L
            </p>

          </div>

          {/* CO2 */}
          <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800/80">

            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              CO2 Saved
            </p>

            <p className="text-3xl font-extrabold text-emerald-400 mt-3">
              {totalCo2Saved.toFixed(1)} kg
            </p>

          </div>

        </div>
      </div>

      {/* SECTION 4: Journey History Log */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl relative">

        <div className="flex items-center justify-between border-b border-slate-800 pb-5">

          <div className="flex items-center space-x-3">

            <h3 className="text-xl font-bold text-white">
              Journey History Log
            </h3>

            <div className="relative">

              <button
                onClick={() =>
                  setInfoCard(
                    infoCard === "history"
                      ? null
                      : "history"
                  )
                }
                className="w-7 h-7 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 text-sm font-bold flex items-center justify-center hover:bg-cyan-500/20 transition-all"
              >
                i
              </button>

              {infoCard === "history" && (
                <div className="absolute left-0 mt-2 w-80 p-4 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl z-20 text-sm text-slate-300 leading-relaxed">

                  <p className="font-semibold text-white mb-1">
                    Past Travel Log
                  </p>

                  Review a complete chronological record of all
                  your completed trips, distance tracked, energy
                  used, and carbon saved.

                </div>
              )}

            </div>
          </div>

        </div>

        <div className="mt-8 overflow-x-auto">

          <table className="w-full text-left text-base">

            <thead>

              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">

                <th className="pb-4 px-4">
                  Date
                </th>

                <th className="pb-4 px-4">
                  Route Path
                </th>

                <th className="pb-4 px-4">
                  Distance
                </th>

                <th className="pb-4 px-4">
                  Energy Consumed
                </th>

                <th className="pb-4 px-4">
                  CO2 Offset
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-800/50">

              {journeys.length === 0 ? (
                <tr>

                  <td
                    colSpan={5}
                    className="py-10 px-4 text-center text-slate-400"
                  >
                    No completed journeys yet.
                  </td>

                </tr>
              ) : (
                journeys.map((j) => (
                  <tr
                    key={`${j.date}-${j.source}-${j.destination}`}
                    className="hover:bg-slate-950/40 transition-all"
                  >

                    {/* Date only */}
                    <td className="py-5 px-4">

                      <p className="font-bold text-white text-base">
                        {j.date}
                      </p>

                    </td>

                    <td className="py-5 px-4 text-slate-200 font-medium">
                      {j.source} &rarr;{" "}
                      {j.destination}
                    </td>

                    <td className="py-5 px-4 font-bold text-white">
                      {j.distanceKm} km
                    </td>

                    <td className="py-5 px-4 text-cyan-400 font-bold">
                      {j.energyUsedKwh} kWh
                    </td>

                    <td className="py-5 px-4 text-emerald-400 font-bold">
                      {j.co2SavedKg} kg
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">

              <div>

                <h3 className="text-xl font-bold text-white">
                  Change Password
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Keep your account secure with a strong password.
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>

            </div>

            <div className="space-y-5">

              {/* Current Password */}
              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 pr-16 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-cyan-400"
                  >
                    {showCurrentPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>
              </div>

              {/* New Password */}
              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 pr-16 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Minimum 8 characters"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-cyan-400"
                  >
                    {showNewPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

                {newPassword && (
                  <p
                    className={`text-xs mt-2 ${
                      newPassword.length >= 8
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {newPassword.length >= 8
                      ? "✓ Password meets minimum requirements"
                      : "Use at least 8 characters"}
                  </p>
                )}

              </div>

              {/* Confirm Password */}
              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 pr-16 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Re-enter new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-cyan-400"
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>
              </div>

              {/* Error */}
              {passwordError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {passwordError}
                </div>
              )}

              {/* Success */}
              {passwordSuccess && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                  {passwordSuccess}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                  className="flex-1 rounded-xl border border-slate-700 py-3 font-semibold text-slate-300 hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleChangePassword
                  }
                  disabled={passwordLoading}
                  className="flex-1 rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-all"
                >
                  {passwordLoading
                    ? "Updating..."
                    : "Update Password"}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}