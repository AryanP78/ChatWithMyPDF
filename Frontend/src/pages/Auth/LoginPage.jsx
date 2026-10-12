import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import AuthService from "../../service/authService";
import { BrainCircuit, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await AuthService.login(email, password);
      const { token, ...user } = data;
      login(user, token);
      toast.success("Logged in succesfully!");
      navigate("/dashboard");
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.error ||
          error?.message ||
          "Failed to login",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="rounded-[28px] border border-gray-200 bg-white px-8 py-12 shadow-sm">
          {/* Header */}
          <div className="text-center mb-12">
            {/* Logo */}
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200">
              <BrainCircuit
                size={42}
                className="text-white"
                strokeWidth={1.8}
              />
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
              Welcome back
            </h1>

            <p className="mt-4 text-lg text-gray-500">
              Sign in to continue your journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-3 block text-sm font-semibold uppercase tracking-wide text-gray-700"
              >
                Email
              </label>

              <div
                className={`flex items-center rounded-2xl border-2 bg-white px-5 transition-all ${
                  focusedField === "email"
                    ? "border-emerald-400 shadow-sm shadow-emerald-100"
                    : "border-gray-200"
                }`}
              >
                <Mail
                  size={24}
                  className="mr-4 text-gray-400"
                  strokeWidth={1.8}
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="alex@timetoprogram.com"
                  className="h-16 w-full bg-transparent text-lg text-gray-800 outline-none placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-3 block text-sm font-semibold uppercase tracking-wide text-gray-700"
              >
                Password
              </label>

              <div
                className={`flex items-center rounded-2xl border-2 bg-white px-5 transition-all ${
                  focusedField === "password"
                    ? "border-emerald-400 shadow-sm shadow-emerald-100"
                    : "border-gray-200"
                }`}
              >
                <Lock
                  size={24}
                  className="mr-4 text-gray-400"
                  strokeWidth={1.8}
                />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="h-16 w-full bg-transparent text-lg text-gray-800 outline-none placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-lg font-semibold text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}

              {!loading && <ArrowRight size={25} strokeWidth={2.5} />}
            </button>
          </form>

          {/* Sign Up */}
          <p className="mt-6 text-center text-lg text-gray-800">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-gray-900 hover:text-emerald-500"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="mt-3 text-center text-sm text-gray-600">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="hover:text-emerald-500 hover:underline">
            Terms
          </Link>{" "}
          &{" "}
          <Link
            to="/privacy"
            className="hover:text-emerald-500 hover:underline"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
