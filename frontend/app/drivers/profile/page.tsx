"use client";

import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BatteryCharging,
  Car,
  Camera,
  Check,
  ChevronDown,
  CircleUserRound,
  FileText,
  History,
  KeyRound,
  Pencil,
  Save,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type UserProfile = {
  fullName: string;
  email: string;
  driverId: string;
  department: string;
  avatar: string;
};

type VehicleProfile = {
  vehicleId: string;
  vehicleType: string;
  vehicleModel: string;
  registrationNumber: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  vehicleDocumentName: string;
  insuranceDocumentName: string;
};

type ExpandedHistory = string | null;

/* =========================================================
   DEFAULT DATA
========================================================= */

const defaultUser: UserProfile = {
  fullName: "Driver",
  email: "driver@enav.com",
  driverId: "EV-2048",
  department: "Emergency Mobility",
  avatar: "",
};

const defaultVehicle: VehicleProfile = {
  vehicleId: "EV-2048",
  vehicleType: "Electric Vehicle",
  vehicleModel: "E-SUV",
  registrationNumber: "DL-01-EV-2048",
  registrationExpiry: "31 Dec 2027",
  insuranceExpiry: "15 Aug 2027",
  vehicleDocumentName: "",
  insuranceDocumentName: "",
};

/* =========================================================
   PAGE
========================================================= */

export default function ProfilePage() {
  const [user, setUser] =
    useState<UserProfile>(defaultUser);

  const [vehicle, setVehicle] =
    useState<VehicleProfile>(defaultVehicle);

  const [personalDraft, setPersonalDraft] =
    useState<UserProfile>(defaultUser);

  const [vehicleDraft, setVehicleDraft] =
    useState<VehicleProfile>(defaultVehicle);

  const [editingPersonal, setEditingPersonal] =
    useState(false);

  const [editingVehicle, setEditingVehicle] =
    useState(false);

  const [savedMessage, setSavedMessage] =
    useState("");

  const [expandedHistory, setExpandedHistory] =
    useState<ExpandedHistory>(null);

  const avatarInputRef =
    useRef<HTMLInputElement | null>(null);

  const vehicleDocumentRef =
    useRef<HTMLInputElement | null>(null);

  const insuranceDocumentRef =
    useRef<HTMLInputElement | null>(null);

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem(
          "enav_registered_user",
        );

      if (savedUser) {
        const parsed = JSON.parse(savedUser);

        const loadedUser: UserProfile = {
          fullName:
            parsed.fullName ||
            defaultUser.fullName,
          email:
            parsed.email ||
            defaultUser.email,
          driverId:
            parsed.driverId ||
            defaultUser.driverId,
          department:
            parsed.department ||
            defaultUser.department,
          avatar:
            parsed.avatar ||
            defaultUser.avatar,
        };

        setUser(loadedUser);
        setPersonalDraft(loadedUser);
      }

      const savedVehicle =
        localStorage.getItem(
          "enav_driver_vehicle",
        );

      if (savedVehicle) {
        const parsed = JSON.parse(savedVehicle);

        const loadedVehicle: VehicleProfile = {
          vehicleId:
            parsed.vehicleId ||
            defaultVehicle.vehicleId,
          vehicleType:
            parsed.vehicleType ||
            defaultVehicle.vehicleType,
          vehicleModel:
            parsed.vehicleModel ||
            defaultVehicle.vehicleModel,
          registrationNumber:
            parsed.registrationNumber ||
            defaultVehicle.registrationNumber,
          registrationExpiry:
            parsed.registrationExpiry ||
            defaultVehicle.registrationExpiry,
          insuranceExpiry:
            parsed.insuranceExpiry ||
            defaultVehicle.insuranceExpiry,
          vehicleDocumentName:
            parsed.vehicleDocumentName ||
            defaultVehicle.vehicleDocumentName,
          insuranceDocumentName:
            parsed.insuranceDocumentName ||
            defaultVehicle.insuranceDocumentName,
        };

        setVehicle(loadedVehicle);
        setVehicleDraft(loadedVehicle);
      }
    } catch {
      setUser(defaultUser);
      setVehicle(defaultVehicle);
      setPersonalDraft(defaultUser);
      setVehicleDraft(defaultVehicle);
    }
  }, []);

  /* =======================================================
     AVATAR
  ======================================================= */

  function openAvatarPicker() {
    avatarInputRef.current?.click();
  }

  function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const avatar =
        typeof reader.result === "string"
          ? reader.result
          : "";

      if (!avatar) return;

      const updatedUser = {
        ...user,
        avatar,
      };

      setUser(updatedUser);
      setPersonalDraft(updatedUser);

      saveUserToStorage(updatedUser);

      showMessage("Profile photo updated");
    };

    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    const updatedUser = {
      ...user,
      avatar: "",
    };

    setUser(updatedUser);
    setPersonalDraft(updatedUser);

    saveUserToStorage(updatedUser);

    showMessage("Profile photo removed");
  }

  /* =======================================================
     PERSONAL EDIT
  ======================================================= */

  function startPersonalEdit() {
    setPersonalDraft(user);
    setEditingPersonal(true);
    setSavedMessage("");
  }

  function cancelPersonalEdit() {
    setPersonalDraft(user);
    setEditingPersonal(false);
  }

  function savePersonal(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanUser: UserProfile = {
      fullName:
        personalDraft.fullName.trim(),
      email:
        personalDraft.email.trim(),
      driverId:
        personalDraft.driverId.trim(),
      department:
        personalDraft.department.trim(),
      avatar: personalDraft.avatar,
    };

    if (!cleanUser.fullName) {
      showMessage("Enter your full name");
      return;
    }

    if (!cleanUser.email) {
      showMessage("Enter your email address");
      return;
    }

    if (!cleanUser.driverId) {
      showMessage(
        "Enter your Driver / Employee ID",
      );
      return;
    }

    if (!cleanUser.department) {
      showMessage("Enter your department");
      return;
    }

    setUser(cleanUser);
    setPersonalDraft(cleanUser);
    setEditingPersonal(false);

    saveUserToStorage(cleanUser);

    showMessage("Personal details saved");
  }

  /* =======================================================
     VEHICLE EDIT
  ======================================================= */

  function startVehicleEdit() {
    setVehicleDraft(vehicle);
    setEditingVehicle(true);
    setSavedMessage("");
  }

  function cancelVehicleEdit() {
    setVehicleDraft(vehicle);
    setEditingVehicle(false);
  }

  function saveVehicle(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanVehicle: VehicleProfile = {
      vehicleId:
        vehicleDraft.vehicleId.trim(),
      vehicleType:
        vehicleDraft.vehicleType.trim(),
      vehicleModel:
        vehicleDraft.vehicleModel.trim(),
      registrationNumber:
        vehicleDraft.registrationNumber.trim(),
      registrationExpiry:
        vehicleDraft.registrationExpiry.trim(),
      insuranceExpiry:
        vehicleDraft.insuranceExpiry.trim(),
      vehicleDocumentName:
        vehicleDraft.vehicleDocumentName,
      insuranceDocumentName:
        vehicleDraft.insuranceDocumentName,
    };

    if (!cleanVehicle.vehicleId) {
      showMessage("Enter your vehicle ID");
      return;
    }

    if (!cleanVehicle.vehicleType) {
      showMessage("Enter your vehicle type");
      return;
    }

    if (!cleanVehicle.vehicleModel) {
      showMessage("Enter your vehicle model");
      return;
    }

    if (!cleanVehicle.registrationNumber) {
      showMessage(
        "Enter your registration number",
      );
      return;
    }

    setVehicle(cleanVehicle);
    setVehicleDraft(cleanVehicle);
    setEditingVehicle(false);

    localStorage.setItem(
      "enav_driver_vehicle",
      JSON.stringify(cleanVehicle),
    );

    showMessage("Vehicle details saved");
  }

  /* =======================================================
     DOCUMENT UPLOAD
  ======================================================= */

  function handleVehicleDocument(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setVehicleDraft((current) => ({
      ...current,
      vehicleDocumentName: file.name,
    }));

    showMessage(
      "Vehicle document selected",
    );
  }

  function handleInsuranceDocument(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setVehicleDraft((current) => ({
      ...current,
      insuranceDocumentName: file.name,
    }));

    showMessage(
      "Insurance document selected",
    );
  }

  /* =======================================================
     HELPERS
  ======================================================= */

  function saveUserToStorage(
    profile: UserProfile,
  ) {
    try {
      const existing =
        localStorage.getItem(
          "enav_registered_user",
        );

      const parsed = existing
        ? JSON.parse(existing)
        : {};

      localStorage.setItem(
        "enav_registered_user",
        JSON.stringify({
          ...parsed,
          ...profile,
        }),
      );
    } catch {
      localStorage.setItem(
        "enav_registered_user",
        JSON.stringify(profile),
      );
    }
  }

  function showMessage(message: string) {
    setSavedMessage(message);

    window.setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  }

  function toggleHistory(id: string) {
    setExpandedHistory((current) =>
      current === id ? null : id,
    );
  }

  const initials = getInitials(
    user.fullName,
  );

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="flex items-start justify-between gap-4">

        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">
            Account
          </div>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Profile
          </h1>

          <p className="mt-1 max-w-xl text-[10px] leading-5 text-slate-500">
            Manage your driver account, vehicle and activity.
          </p>
        </div>

        <Link
          href="/drivers"
          className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-800 bg-[#050A13] px-3 py-2 text-[8px] font-bold text-slate-500 transition hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </Link>

      </section>

      {/* =====================================================
          SAVE MESSAGE
      ===================================================== */}

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-[9px] font-bold text-emerald-400">
          <Check className="h-3.5 w-3.5" />
          {savedMessage}
        </div>
      )}

      {/* =====================================================
          PROFILE HERO
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#07101d]">

        <div className="relative px-5 py-6 sm:px-7 sm:py-7">

          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-400/5 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

            {/* AVATAR */}

            <div className="relative w-fit">

              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="h-20 w-20 rounded-2xl border border-slate-700 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-xl font-black text-emerald-400">
                  {initials}
                </div>
              )}

              <button
                type="button"
                onClick={openAvatarPicker}
                aria-label="Change profile photo"
                className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-[#07101d] text-slate-400 shadow-lg transition hover:border-emerald-400/30 hover:text-emerald-400"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

            </div>

            {/* INFO */}

            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="text-xl font-black text-white">
                  {user.fullName}
                </h2>

                <span className="flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-2 py-1 text-[7px] font-bold uppercase tracking-wider text-emerald-400">
                  <Check className="h-2.5 w-2.5" />
                  Active
                </span>

              </div>

              <p className="mt-1 text-[10px] text-slate-500">
                {user.department}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">

                <ProfilePill
                  label="Driver ID"
                  value={user.driverId}
                />

                <ProfilePill
                  label="Vehicle"
                  value={vehicle.vehicleId}
                />

              </div>

            </div>

            {/* REMOVE PHOTO */}

            {user.avatar && (
              <button
                type="button"
                onClick={removeAvatar}
                className="self-start rounded-lg border border-slate-800 px-3 py-2 text-[8px] font-bold text-slate-500 transition hover:border-red-500/20 hover:text-red-400"
              >
                Remove photo
              </button>
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          PERSONAL DETAILS
      ===================================================== */}

      <ProfileSection
        icon={
          <CircleUserRound className="h-4 w-4" />
        }
        title="Personal details"
        description="Your driver account information."
        action={
          editingPersonal ? (
            <EditActions
              formId="personal-form"
              onCancel={cancelPersonalEdit}
            />
          ) : (
            <EditButton
              onClick={startPersonalEdit}
            />
          )
        }
      >

        {editingPersonal ? (
          <form
            id="personal-form"
            onSubmit={savePersonal}
            className="grid gap-4 sm:grid-cols-2"
          >
            <EditableField
              label="Full name"
              value={personalDraft.fullName}
              onChange={(value) =>
                setPersonalDraft((current) => ({
                  ...current,
                  fullName: value,
                }))
              }
            />

            <EditableField
              label="Email address"
              type="email"
              value={personalDraft.email}
              onChange={(value) =>
                setPersonalDraft((current) => ({
                  ...current,
                  email: value,
                }))
              }
            />

            <EditableField
              label="Driver / Employee ID"
              value={personalDraft.driverId}
              onChange={(value) =>
                setPersonalDraft((current) => ({
                  ...current,
                  driverId: value,
                }))
              }
            />

            <EditableField
              label="Department"
              value={personalDraft.department}
              onChange={(value) =>
                setPersonalDraft((current) => ({
                  ...current,
                  department: value,
                }))
              }
            />
          </form>
        ) : (
          <div className="grid gap-x-8 sm:grid-cols-2">

            <ProfileRow
              label="Full name"
              value={user.fullName}
            />

            <ProfileRow
              label="Email address"
              value={user.email}
            />

            <ProfileRow
              label="Driver / Employee ID"
              value={user.driverId}
            />

            <ProfileRow
              label="Department"
              value={user.department}
            />

          </div>
        )}

      </ProfileSection>

      {/* =====================================================
          VEHICLE DETAILS
      ===================================================== */}

      <ProfileSection
        icon={<Car className="h-4 w-4" />}
        title="Vehicle details"
        description="Vehicle identity, registration and documents."
        action={
          editingVehicle ? (
            <EditActions
              formId="vehicle-form"
              onCancel={cancelVehicleEdit}
            />
          ) : (
            <EditButton
              onClick={startVehicleEdit}
            />
          )
        }
      >

        {editingVehicle ? (
          <form
            id="vehicle-form"
            onSubmit={saveVehicle}
            className="space-y-5"
          >

            <div className="grid gap-4 sm:grid-cols-2">

              <EditableField
                label="Vehicle ID"
                value={vehicleDraft.vehicleId}
                onChange={(value) =>
                  setVehicleDraft((current) => ({
                    ...current,
                    vehicleId: value,
                  }))
                }
              />

              <EditableField
                label="Vehicle type"
                value={vehicleDraft.vehicleType}
                onChange={(value) =>
                  setVehicleDraft((current) => ({
                    ...current,
                    vehicleType: value,
                  }))
                }
              />

              <EditableField
                label="Vehicle model"
                value={vehicleDraft.vehicleModel}
                onChange={(value) =>
                  setVehicleDraft((current) => ({
                    ...current,
                    vehicleModel: value,
                  }))
                }
              />

              <EditableField
                label="Registration number"
                value={vehicleDraft.registrationNumber}
                onChange={(value) =>
                  setVehicleDraft((current) => ({
                    ...current,
                    registrationNumber: value,
                  }))
                }
              />

              <EditableField
                label="Registration expiry"
                value={vehicleDraft.registrationExpiry}
                onChange={(value) =>
                  setVehicleDraft((current) => ({
                    ...current,
                    registrationExpiry: value,
                  }))
                }
              />

              <EditableField
                label="Insurance expiry"
                value={vehicleDraft.insuranceExpiry}
                onChange={(value) =>
                  setVehicleDraft((current) => ({
                    ...current,
                    insuranceExpiry: value,
                  }))
                }
              />

            </div>

            {/* DOCUMENTS */}

            <div>
              <div className="mb-3 text-[8px] font-bold uppercase tracking-widest text-slate-600">
                Vehicle documents
              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                <DocumentUpload
                  title="Vehicle registration"
                  filename={
                    vehicleDraft.vehicleDocumentName
                  }
                  inputRef={vehicleDocumentRef}
                  onChange={handleVehicleDocument}
                />

                <DocumentUpload
                  title="Insurance document"
                  filename={
                    vehicleDraft.insuranceDocumentName
                  }
                  inputRef={insuranceDocumentRef}
                  onChange={handleInsuranceDocument}
                />

              </div>
            </div>

          </form>
        ) : (
          <>

            <div className="grid gap-x-8 sm:grid-cols-2">

              <ProfileRow
                label="Vehicle ID"
                value={vehicle.vehicleId}
              />

              <ProfileRow
                label="Vehicle type"
                value={vehicle.vehicleType}
              />

              <ProfileRow
                label="Vehicle model"
                value={vehicle.vehicleModel}
              />

              <ProfileRow
                label="Registration number"
                value={vehicle.registrationNumber}
              />

              <ProfileRow
                label="Registration expiry"
                value={vehicle.registrationExpiry}
              />

              <ProfileRow
                label="Insurance expiry"
                value={vehicle.insuranceExpiry}
              />

            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <DocumentStatus
                title="Vehicle registration"
                filename={
                  vehicle.vehicleDocumentName
                }
              />

              <DocumentStatus
                title="Insurance document"
                filename={
                  vehicle.insuranceDocumentName
                }
              />

            </div>

          </>
        )}

      </ProfileSection>

      {/* =====================================================
          EV INFORMATION
      ===================================================== */}

      <ProfileSection
        icon={
          <BatteryCharging className="h-4 w-4" />
        }
        title="EV information"
        description="Vehicle telemetry and charging state."
      >

        <div className="grid gap-3 sm:grid-cols-3">

          <ReadOnlyBox
            label="Battery"
            value="Not connected"
          />

          <ReadOnlyBox
            label="Estimated range"
            value="Not connected"
          />

          <ReadOnlyBox
            label="Charging status"
            value="No active session"
          />

        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-800 bg-[#050A13] p-3">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />

          <p className="text-[8px] leading-4 text-slate-600">
            Battery and range are vehicle-generated values and are not
            editable from the driver profile.
          </p>
        </div>

      </ProfileSection>

      {/* =====================================================
          CHARGING HISTORY
      ===================================================== */}

      <ProfileSection
        icon={
          <BatteryCharging className="h-4 w-4" />
        }
        title="Charging history"
        description="Your recent charging activity."
      >

        <div className="divide-y divide-slate-800/80">

          <ExpandableHistory
            id="charging-1"
            title="Janakpuri Mobility Hub"
            subtitle="Today · DC Fast"
            expanded={
              expandedHistory === "charging-1"
            }
            onToggle={toggleHistory}
          >
            <HistoryDetail
              label="Station"
              value="Janakpuri Mobility Hub"
            />

            <HistoryDetail
              label="Charger"
              value="DC Fast"
            />

            <HistoryDetail
              label="Date"
              value="Today"
            />

            <HistoryDetail
              label="Session"
              value="Completed"
            />

            <HistoryDetail
              label="Payment"
              value="₹420"
            />
          </ExpandableHistory>

          <ExpandableHistory
            id="charging-2"
            title="Dwarka Sector 14"
            subtitle="Yesterday · Ultra Fast"
            expanded={
              expandedHistory === "charging-2"
            }
            onToggle={toggleHistory}
          >
            <HistoryDetail
              label="Station"
              value="Dwarka Sector 14"
            />

            <HistoryDetail
              label="Charger"
              value="Ultra Fast"
            />

            <HistoryDetail
              label="Date"
              value="Yesterday"
            />

            <HistoryDetail
              label="Session"
              value="Completed"
            />

            <HistoryDetail
              label="Payment"
              value="₹260"
            />
          </ExpandableHistory>

          <ExpandableHistory
            id="charging-3"
            title="Connaught Place Central"
            subtitle="Aug 26 · DC Fast"
            expanded={
              expandedHistory === "charging-3"
            }
            onToggle={toggleHistory}
          >
            <HistoryDetail
              label="Station"
              value="Connaught Place Central"
            />

            <HistoryDetail
              label="Charger"
              value="DC Fast"
            />

            <HistoryDetail
              label="Date"
              value="Aug 26"
            />

            <HistoryDetail
              label="Session"
              value="Completed"
            />

            <HistoryDetail
              label="Payment"
              value="₹380"
            />
          </ExpandableHistory>

        </div>

      </ProfileSection>

      {/* =====================================================
          JOURNEY HISTORY
      ===================================================== */}

      <ProfileSection
        icon={<History className="h-4 w-4" />}
        title="Journey history"
        description="Your recently completed journeys."
      >

        <div className="divide-y divide-slate-800/80">

          <ExpandableHistory
            id="journey-1"
            title="Central Hospital"
            subtitle="Today · 19.2 km · 34 min"
            expanded={
              expandedHistory === "journey-1"
            }
            onToggle={toggleHistory}
          >
            <HistoryDetail
              label="Route"
              value="Current location → Central Hospital"
            />

            <HistoryDetail
              label="Route type"
              value="Balanced"
            />

            <HistoryDetail
              label="Distance"
              value="19.2 km"
            />

            <HistoryDetail
              label="Journey time"
              value="34 min"
            />

            <HistoryDetail
              label="Charging stop"
              value="None recorded"
            />
          </ExpandableHistory>

          <ExpandableHistory
            id="journey-2"
            title="North District"
            subtitle="Yesterday · 24.8 km · 42 min"
            expanded={
              expandedHistory === "journey-2"
            }
            onToggle={toggleHistory}
          >
            <HistoryDetail
              label="Route"
              value="Current location → North District"
            />

            <HistoryDetail
              label="Route type"
              value="Fastest"
            />

            <HistoryDetail
              label="Distance"
              value="24.8 km"
            />

            <HistoryDetail
              label="Journey time"
              value="42 min"
            />

            <HistoryDetail
              label="Charging stop"
              value="None recorded"
            />
          </ExpandableHistory>

          <ExpandableHistory
            id="journey-3"
            title="City Centre"
            subtitle="Aug 26 · 12.4 km · 25 min"
            expanded={
              expandedHistory === "journey-3"
            }
            onToggle={toggleHistory}
          >
            <HistoryDetail
              label="Route"
              value="Current location → City Centre"
            />

            <HistoryDetail
              label="Route type"
              value="Shortest"
            />

            <HistoryDetail
              label="Distance"
              value="12.4 km"
            />

            <HistoryDetail
              label="Journey time"
              value="25 min"
            />

            <HistoryDetail
              label="Charging stop"
              value="None recorded"
            />
          </ExpandableHistory>

        </div>

      </ProfileSection>

      {/* =====================================================
          ACCOUNT
      ===================================================== */}

      <ProfileSection
        icon={<KeyRound className="h-4 w-4" />}
        title="Account information"
        description="Account access and platform details."
      >

        <div className="grid gap-x-8 sm:grid-cols-2">

          <ProfileRow
            label="Account type"
            value="Driver"
          />

          <ProfileRow
            label="Account status"
            value="Active"
          />

          <ProfileRow
            label="Platform"
            value="EnaV"
          />

          <ProfileRow
            label="Security"
            value="Protected"
          />

        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-3 text-[8px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Profile changes are stored locally in this prototype.
        </div>

      </ProfileSection>

    </div>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function ProfileSection({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-[#07101d] p-5 sm:p-6">

      <div className="flex items-start justify-between gap-4">

        <div className="flex min-w-0 items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400">
            {icon}
          </div>

          <div>
            <h2 className="text-xs font-black text-white">
              {title}
            </h2>

            <p className="mt-1 text-[8px] leading-4 text-slate-600">
              {description}
            </p>
          </div>

        </div>

        {action}

      </div>

      <div className="mt-5">
        {children}
      </div>

    </section>
  );
}

function EditButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-800 px-3 py-2 text-[8px] font-bold text-slate-500 transition hover:border-slate-700 hover:text-white"
    >
      <Pencil className="h-3 w-3" />
      Edit
    </button>
  );
}

function EditActions({
  formId,
  onCancel,
}: {
  formId: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">

      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-1 rounded-lg border border-slate-800 px-3 py-2 text-[8px] font-bold text-slate-500 transition hover:text-white"
      >
        <X className="h-3 w-3" />
        Cancel
      </button>

      <button
        type="submit"
        form={formId}
        className="flex items-center gap-1 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[8px] font-bold text-emerald-400 transition hover:bg-emerald-400/15"
      >
        <Save className="h-3 w-3" />
        Save
      </button>

    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-[8px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-slate-800 bg-[#050A13] px-3 text-[10px] font-bold text-white outline-none transition placeholder:text-slate-700 focus:border-emerald-400/40"
      />

    </label>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[48px] items-center justify-between gap-5 border-b border-slate-800/70 py-3 last:border-0">

      <span className="text-[9px] text-slate-600">
        {label}
      </span>

      <span className="max-w-[65%] break-words text-right text-[10px] font-bold text-slate-300">
        {value}
      </span>

    </div>
  );
}

function ProfilePill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#050A13] px-3 py-2">

      <div className="text-[6px] uppercase tracking-widest text-slate-700">
        {label}
      </div>

      <div className="mt-1 text-[9px] font-bold text-slate-300">
        {value}
      </div>

    </div>
  );
}

function ReadOnlyBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#050A13] p-4">

      <div className="text-[7px] font-bold uppercase tracking-widest text-slate-600">
        {label}
      </div>

      <div className="mt-2 text-[10px] font-black text-slate-300">
        {value}
      </div>

    </div>
  );
}

function DocumentUpload({
  title,
  filename,
  inputRef,
  onChange,
}: {
  title: string;
  filename: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#050A13] p-4">

      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-2">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/10">
            <FileText className="h-3.5 w-3.5 text-blue-400" />
          </div>

          <div>
            <div className="text-[9px] font-bold text-white">
              {title}
            </div>

            <div className="mt-1 max-w-[180px] truncate text-[8px] text-slate-600">
              {filename || "No document selected"}
            </div>
          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          className="flex items-center gap-1 rounded-lg border border-slate-800 px-2.5 py-2 text-[8px] font-bold text-slate-500 transition hover:border-blue-400/20 hover:text-blue-400"
        >
          <Upload className="h-3 w-3" />
          Upload
        </button>

      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={onChange}
        className="hidden"
      />

    </div>
  );
}

function DocumentStatus({
  title,
  filename,
}: {
  title: string;
  filename: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#050A13] p-4">

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/10">
        <FileText className="h-3.5 w-3.5 text-blue-400" />
      </div>

      <div className="min-w-0">
        <div className="text-[9px] font-bold text-white">
          {title}
        </div>

        <div className="mt-1 truncate text-[8px] text-slate-600">
          {filename || "No document uploaded"}
        </div>
      </div>

    </div>
  );
}

function ExpandableHistory({
  id,
  title,
  subtitle,
  expanded,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  expanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="py-1">

      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >

        <div className="min-w-0">

          <div className="truncate text-[10px] font-bold text-white">
            {title}
          </div>

          <div className="mt-1 text-[8px] text-slate-600">
            {subtitle}
          </div>

        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-600 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />

      </button>

      {expanded && (
        <div className="mb-3 grid gap-2 rounded-xl border border-slate-800 bg-[#050A13] p-4 sm:grid-cols-2">
          {children}
        </div>
      )}

    </div>
  );
}

function HistoryDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800/80 bg-[#07101d] p-3">

      <div className="text-[7px] uppercase tracking-widest text-slate-700">
        {label}
      </div>

      <div className="mt-1 text-[9px] font-bold text-slate-300">
        {value}
      </div>

    </div>
  );
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "D";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}