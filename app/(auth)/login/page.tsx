"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { type User, type Role } from "@/types";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["doctor", "nurse"], "Role must be either doctor or nurse"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "doctor" },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError("");

    try {
      const params = new URLSearchParams();
      params.append("username", data.email);
      params.append("password", data.password);

      const { data: res } = await api.post("/auth/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const user: User = {
        id: res.id,
        email: res.email,
        full_name: res.full_name,
        role: data.role as Role,
      };
      login(res.access_token, user);
      router.push("/patients");
    } catch {
      setServerError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden border border-gray-800">
        {/* Left panel */}
        <div className="bg-[#080d1a] p-10 flex flex-col justify-between min-h-130">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
                <path
                  d="M9 2v14M2 9h14"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle
                  cx="9"
                  cy="9"
                  r="3.5"
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <span className="text-gray-100 font-medium text-lg tracking-tight">
              MediDash
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center py-10">
            <h2 className="text-2xl font-medium text-gray-100 leading-snug tracking-tight mb-3">
              Clinical intelligence for your entire team
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Role-based access, real-time patient data, and drug safety checks
              — built for how hospitals actually work.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "JWT Auth",
                "RBAC",
                "Drug interactions",
                "Surgical checklists",
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-900 text-slate-500 border border-slate-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-6">
            {[
              { value: "RBAC", label: "Doctor / Nurse roles" },
              { value: "BMI", label: "Live computed scores" },
              { value: "GCS", label: "Glasgow scale" },
            ].map((stat, i) => (
              <div key={stat.value} className="flex items-center gap-6">
                {i > 0 && <div className="w-px h-8 bg-slate-800" />}
                <div>
                  <p className="text-lg font-medium text-teal-500">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-white dark:bg-gray-900 p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 tracking-tight mb-1">
              Sign in to your account
            </h3>
            <p className="text-sm text-gray-500">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="doctor@hospital.com"
                {...register("email")}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors mt-2"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-teal-600 hover:underline">
              Register with your medical ID
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
