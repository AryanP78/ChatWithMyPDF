import React, { useEffect, useState } from "react";
import moment from "moment";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CalendarDays,
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Flame,
  LogOut,
  Save,
  KeyRound,
} from "lucide-react";
import Spinner from "../../../common/Spinner";
import AuthService from "../../service/authService";
import progressService from "../../service/progressService";
import { useAuth } from "../../Context/AuthContext";

const inputClass =
  "h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50";

const ButtonSpinner = () => (
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
);

const Field = ({ id, label, icon: Icon, children }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-700">
      {label}
    </label>
    <div className="relative">
      <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      {children}
    </div>
  </div>
);

const PasswordInput = ({ id, value, onChange, show, onToggle, placeholder, autoComplete }) => (
  <>
    <input
      id={id}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={`${inputClass} pr-12`}
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:text-gray-600"
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </>
);

const passwordStrength = (pw) => {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length < 6) return { label: "Too short", width: "15%", color: "bg-red-400" };
  if (score <= 1) return { label: "Weak", width: "35%", color: "bg-red-400" };
  if (score === 2) return { label: "Fair", width: "60%", color: "bg-amber-400" };
  if (score === 3) return { label: "Good", width: "80%", color: "bg-emerald-400" };
  return { label: "Strong", width: "100%", color: "bg-emerald-500" };
};

const Profilepage = () => {
  const { user, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, statsRes] = await Promise.allSettled([
          AuthService.getUserProfile(),
          progressService.getDashboardData(),
        ]);
        if (profileRes.status === "fulfilled") {
          const data = profileRes.value.data;
          setProfile(data);
          setName(data.name);
          setEmail(data.email);
        } else {
          toast.error(profileRes.reason?.error || "Failed to load profile");
        }
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  const current = profile || user || {};
  const initial = current.name?.trim()?.charAt(0)?.toUpperCase() || "U";
  const profileChanged =
    profile && (name.trim() !== profile.name || email.trim() !== profile.email);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileChanged) return;
    setSavingProfile(true);
    try {
      const response = await AuthService.updateUserProfile({
        name: name.trim(),
        email: email.trim(),
      });
      const { name: newName, email: newEmail, profileImage } = response.data;
      setProfile((p) => ({ ...p, name: newName, email: newEmail }));
      updateUser({ name: newName, email: newEmail, profileImage });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(
        error?.statusCode === 409
          ? "That email is already in use"
          : error?.error || error?.message || "Failed to update profile",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const strength = passwordStrength(passwords.next);
  const mismatch = passwords.confirm && passwords.next !== passwords.confirm;
  const canChangePassword =
    passwords.current && passwords.next.length >= 6 && passwords.next === passwords.confirm;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!canChangePassword) return;
    setSavingPassword(true);
    try {
      await AuthService.changeUserPassword({
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setPasswords({ current: "", next: "", confirm: "" });
      setShowPasswords({});
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const setPassword = (key) => (e) =>
    setPasswords((p) => ({ ...p, [key]: e.target.value }));
  const toggleShow = (key) => () => setShowPasswords((s) => ({ ...s, [key]: !s[key] }));

  const statItems = stats
    ? [
        { icon: FileText, label: "Documents", value: stats.totalDocuments, className: "bg-blue-50 text-blue-500" },
        { icon: BookOpen, label: "Flashcards", value: stats.totalFlashcards, className: "bg-purple-50 text-purple-500" },
        { icon: BrainCircuit, label: "Quizzes", value: stats.completedQuizzes, className: "bg-amber-50 text-amber-500" },
        { icon: TrendingUp, label: "Avg. score", value: `${stats.averageScore}%`, className: "bg-emerald-50 text-emerald-500" },
      ]
    : [];

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="mb-2 text-2xl font-medium tracking-tight text-slate-900">Profile</h1>
          <p className="text-sm text-slate-500">Manage your account details and security</p>
        </div>

        {/* Overview */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="px-6 pb-6">
            <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl font-semibold text-white shadow-lg">
                  {initial}
                </div>
                <div className="min-w-0 pb-1">
                  <h2 className="truncate text-xl font-semibold text-gray-900">{current.name}</h2>
                  <p className="truncate text-sm text-gray-500">{current.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {current.createdAt && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 font-medium text-gray-600">
                    <CalendarDays size={14} />
                    Member since {moment(current.createdAt).format("MMM YYYY")}
                  </span>
                )}
                {stats?.studyStreak > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1.5 font-semibold text-orange-600">
                    <Flame size={14} className="fill-orange-400 text-orange-500" />
                    {stats.studyStreak}-day streak
                  </span>
                )}
              </div>
            </div>

            {statItems.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-6 sm:grid-cols-4">
                {statItems.map(({ icon: Icon, label, value, className }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${className}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold leading-tight text-gray-900">{value}</p>
                      <p className="truncate text-xs text-gray-500">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal info */}
          <form
            onSubmit={handleProfileSubmit}
            className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <User size={18} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
                <p className="text-xs text-gray-500">Update your name and email address</p>
              </div>
            </div>

            <div className="flex-1 space-y-5">
              <Field id="profile-name" label="Full name" icon={User}>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className={inputClass}
                />
              </Field>
              <Field id="profile-email" label="Email address" icon={Mail}>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {profileChanged && (
                <button
                  type="button"
                  onClick={() => {
                    setName(profile.name);
                    setEmail(profile.email);
                  }}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button type="submit" disabled={!profileChanged || savingProfile} className={primaryButton}>
                {savingProfile ? <ButtonSpinner /> : <Save size={16} />}
                {savingProfile ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>

          {/* Password */}
          <form
            onSubmit={handlePasswordSubmit}
            className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <KeyRound size={18} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
                <p className="text-xs text-gray-500">Use at least 6 characters</p>
              </div>
            </div>

            <div className="flex-1 space-y-5">
              <Field id="current-password" label="Current password" icon={Lock}>
                <PasswordInput
                  id="current-password"
                  value={passwords.current}
                  onChange={setPassword("current")}
                  show={showPasswords.current}
                  onToggle={toggleShow("current")}
                  autoComplete="current-password"
                />
              </Field>
              <div>
                <Field id="new-password" label="New password" icon={Lock}>
                  <PasswordInput
                    id="new-password"
                    value={passwords.next}
                    onChange={setPassword("next")}
                    show={showPasswords.next}
                    onToggle={toggleShow("next")}
                    autoComplete="new-password"
                  />
                </Field>
                {strength && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <span className="w-16 text-right text-xs font-medium text-gray-500">{strength.label}</span>
                  </div>
                )}
              </div>
              <div>
                <Field id="confirm-password" label="Confirm new password" icon={Lock}>
                  <PasswordInput
                    id="confirm-password"
                    value={passwords.confirm}
                    onChange={setPassword("confirm")}
                    show={showPasswords.confirm}
                    onToggle={toggleShow("confirm")}
                    autoComplete="new-password"
                  />
                </Field>
                {mismatch && <p className="mt-2 text-xs text-red-600">Passwords don't match</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={!canChangePassword || savingPassword} className={primaryButton}>
                {savingPassword ? <ButtonSpinner /> : <KeyRound size={16} />}
                {savingPassword ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </div>

        {/* Session */}
        <div className="flex flex-col gap-4 rounded-2xl border border-red-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Sign out</h3>
            <p className="mt-1 text-sm text-gray-500">End your session on this device.</p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profilepage;
