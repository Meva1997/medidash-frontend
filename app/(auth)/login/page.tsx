"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { type User, type Role } from "@/types";
import { DemoCredentials } from "@/components/ui/DemoCredentials";
import Link from "next/link";

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
  const [errorKey, setErrorKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "doctor" },
  });

  const onSubmit = async (data: LoginForm) => {
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
        role: res.role as Role,
      };
      login(res.access_token, user);
      router.push("/patients");
    } catch {
      setServerError("Invalid credentials. Please try again.");
      setErrorKey((k) => k + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden border border-gray-800">
        {/* Left panel */}
        <div className="bg-[#080d1a] p-10 flex flex-col justify-between min-h-130">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <svg fill="none" className="w-4 h-4" viewBox="0 0 18 18">
                <path
                  stroke="#fff"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  d="M9 2v14M2 9h14"
                />
                <circle cx="9" cy="9" r="3.5" stroke="#fff" strokeWidth="1.5" />
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
              <p
                key={errorKey}
                className="text-xs text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 animate-shake"
              >
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

            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2.5 mt-2">
              <svg
                fill="currentColor"
                className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5m0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                The backend runs on a free Render instance and may take up to 30
                seconds to wake up on the first request.
              </p>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-teal-600 hover:underline">
              Register here
            </Link>
          </p>

          <DemoCredentials />
        </div>
      </div>
    </div>
  );
}
