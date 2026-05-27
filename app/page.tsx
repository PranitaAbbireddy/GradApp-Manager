"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GraduationCap, Sparkles, LogIn, ArrowRight, ShieldCheck, RefreshCw, BarChart2 } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      await signIn("credentials", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Demo login error:", error);
      setIsDemoLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google login error:", error);
      setIsGoogleLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <GraduationCap className="h-16 w-16 animate-bounce text-primary" />
          <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-1/2 animate-infinite-scroll rounded-full bg-gradient-to-r from-primary to-secondary"></div>
          </div>
          <span className="text-sm text-zinc-400 font-medium">Synchronizing session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090b] flex flex-col justify-between">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-800/40 relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            GradAtlas
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDemoLogin}
            disabled={isDemoLoading || isGoogleLoading}
            className="hidden md:flex text-sm text-zinc-300 hover:text-white px-4 py-2 rounded-lg transition-colors border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900"
          >
            {isDemoLoading ? "Entering..." : "Quick Demo Access"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center justify-center gap-16 relative z-10 w-full">
        {/* Left Side: Copy */}
        <div className="flex-1 flex flex-col items-start text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="h-3 w-3" /> Powered by live currency rates
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Navigate Your{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent glow-text-purple">
              University Admissions
            </span>{" "}
            Seamlessly
          </h1>
          
          <p className="text-lg text-zinc-400 leading-relaxed mb-8">
            Manage course details, track essential deadlines, and dynamically convert tuitions and application fees to INR using real-time rates. Securely compare programs side-by-side with visual highlights.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 w-full">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-start gap-3">
              <RefreshCw className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Live Forex</h4>
                <p className="text-xs text-zinc-400 mt-1">Automatic auto-conversions to INR</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-start gap-3">
              <BarChart2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Compare Tool</h4>
                <p className="text-xs text-zinc-400 mt-1">Interactive side-by-side grids</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Backups</h4>
                <p className="text-xs text-zinc-400 mt-1">Export/Download JSON & CSV</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Box */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="glass-card rounded-2xl p-8 border border-zinc-800/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl pointer-events-none" />
            
            <h3 className="text-2xl font-bold text-white mb-2 text-center">Get Started</h3>
            <p className="text-sm text-zinc-400 text-center mb-8">Sign in to sync your university tracking data securely.</p>

            <div className="flex flex-col gap-4">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isDemoLoading}
                className="w-full h-12 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/5 disabled:opacity-50 cursor-pointer"
              >
                {isGoogleLoading ? (
                  <div className="h-5 w-5 border-2 border-zinc-900 border-t-transparent animate-spin rounded-full" />
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.76 14.93 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.6 2.8C6.01 6.8 8.81 5.04 12 5.04z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.46h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.6 2.8c2.1-1.94 3.31-4.79 3.31-8.46z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.1 14.7c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 7.3c-.92 1.84-1.44 3.93-1.44 6.2s.52 4.36 1.44 6.2l3.6-2.8z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.24 0 5.97-1.07 7.96-2.9l-3.6-2.8c-1.1.74-2.52 1.18-4.36 1.18-3.19 0-5.99-1.76-6.95-4.46l-3.6 2.8C3.4 20.35 7.35 23 12 23z"
                      />
                    </svg>
                    <span>Sign In with Google</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-zinc-800 w-full" />
                <span className="absolute bg-[#18181b] px-3 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                  OR
                </span>
              </div>

              {/* Demo Sign In */}
              <button
                onClick={handleDemoLogin}
                disabled={isGoogleLoading || isDemoLoading}
                className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-primary/50 text-zinc-100 hover:text-white font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isDemoLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5 text-primary group-hover:translate-x-0.5 transition-transform" />
                    <span>Instant Guest Access</span>
                    <ArrowRight className="h-4 w-4 ml-1 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </>
                )}
              </button>
            </div>

            <p className="text-xxs text-zinc-500 text-center mt-6 leading-relaxed">
              *Guest Access automatically logs you into a secure demo database sandbox, requiring zero Google credentials. Ideal for immediate feature evaluation!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-zinc-900/60 flex flex-col md:flex-row items-center justify-between text-zinc-600 text-xs gap-4 relative z-10">
        <div>&copy; {new Date().getFullYear()} GradAtlas Tracker. All rights reserved.</div>
        <div className="flex gap-6">
          <span className="text-zinc-500">Secure AES Local Sync</span>
          <span className="text-zinc-500">Next.js + Prisma v5</span>
        </div>
      </footer>
    </div>
  );
}
