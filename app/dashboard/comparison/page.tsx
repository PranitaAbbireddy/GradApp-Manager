"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { 
  GraduationCap, ArrowLeft, Globe, Award, DollarSign, Calendar, 
  CheckCircle2, AlertCircle, FileText, ChevronRight, Star, Heart
} from "lucide-react";

interface Application {
  id?: string;
  country: string;
  universityName: string;
  universityAddress: string;
  worldRanking?: number | null;
  countryRanking?: number | null;
  courseName: string;
  courseWebsite?: string;
  durationMonths?: number | null;
  
  gpaRequired?: string;
  gpaComments?: string;
  transcriptsRequired: boolean;
  transcriptsComments?: string;
  resumeRequired: boolean;
  resumeComments?: string;
  lettersOfRecCount: number;
  lettersOfRecComments?: string;
  sopRequired: boolean;
  sopComments?: string;
  ieltsRequired?: number | null;
  grePreferred: boolean;
  greComments?: string;
  
  workExpPreferred: boolean;
  workExpComments?: string;
  researchExpPreferred: boolean;
  researchExpComments?: string;
  appliedBefore: boolean;
  
  openingDate?: string;
  priorityDeadline?: string;
  finalDeadline?: string;
  appFeeOriginal?: number | null;
  appFeeCurrency: string;
  appFeeINR?: number | null;
  tuitionFeeOriginal?: number | null;
  tuitionFeeCurrency: string;
  tuitionFeeINR?: number | null;
  
  interestRating: number;
  interestComments?: string;
  status: string;
  additionalFields: string;
}

export default function ComparisonDashboard() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <GraduationCap className="h-16 w-16 animate-spin text-primary" />
          <span className="text-zinc-400 font-medium">Assembling side-by-side matrices...</span>
        </div>
      </div>
    }>
      <ComparisonDashboardContent />
    </Suspense>
  );
}

function ComparisonDashboardContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appsToCompare, setAppsToCompare] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      loadComparisonData();
    }
  }, [status, searchParams, router]);

  const loadComparisonData = async () => {
    setIsLoading(true);
    const idsString = searchParams.get("ids");
    if (!idsString) {
      setAppsToCompare([]);
      setIsLoading(false);
      return;
    }

    const ids = idsString.split(",");
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const allApps: Application[] = await res.json();
        // Filter down to selected IDs only
        const filtered = allApps.filter(app => ids.includes(app.id || ""));
        setAppsToCompare(filtered);
      }
    } catch (err) {
      console.error("Error loading comparison applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <GraduationCap className="h-16 w-16 animate-spin text-primary" />
          <span className="text-zinc-400 font-medium">Assembling side-by-side matrices...</span>
        </div>
      </div>
    );
  }

  if (appsToCompare.length === 0) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] py-16 px-6 flex flex-col items-center justify-center">
        <GraduationCap className="h-12 w-12 text-zinc-700 mb-4" />
        <h3 className="text-lg font-bold text-zinc-300">No applications selected for comparison</h3>
        <p className="text-xs text-zinc-500 mt-2 max-w-sm text-center leading-relaxed">
          Please return to the dashboard and select two or more universities by checking their respective "Compare" boxes.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 h-10 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tracking Board
        </button>
      </div>
    );
  }

  // Calculate best metrics to highlight (cheapest, best rank, highest interest)
  const tuitionFees = appsToCompare.map(a => a.tuitionFeeINR || Infinity);
  const minTuition = Math.min(...tuitionFees);
  
  const worldRanks = appsToCompare.map(a => a.worldRanking || Infinity);
  const minWorldRank = Math.min(...worldRanks);

  const interestScores = appsToCompare.map(a => a.interestRating);
  const maxInterest = Math.max(...interestScores);

  // Extract all unique custom field keys present in selected apps
  const allCustomKeys: string[] = [];
  appsToCompare.forEach(app => {
    try {
      const parsed = JSON.parse(app.additionalFields || "{}");
      Object.keys(parsed).forEach(key => {
        if (!allCustomKeys.includes(key)) {
          allCustomKeys.push(key);
        }
      });
    } catch {}
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] pb-24">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-800/40 bg-zinc-950/60 sticky top-0 z-45 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>Dashboard</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              GradAtlas Side-by-Side Comparison
            </span>
          </div>

          <div className="text-xxs text-zinc-500 font-semibold uppercase bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-850">
            {appsToCompare.length} programs loaded
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-xs font-semibold mb-6">
          <CheckCircle2 className="h-3.5 w-3.5" /> Highlighting Cheapest Tuition, Top World Rank, & Highest Interest options.
        </div>

        {/* Side-by-side Table Container */}
        <div className="glass-panel rounded-2xl border border-zinc-850 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-850 bg-zinc-950/70">
                  <th className="p-5 text-xxs font-bold text-zinc-500 uppercase tracking-wider w-[240px]">Metric / Criteria</th>
                  {appsToCompare.map(app => (
                    <th key={app.id} className="p-5 border-l border-zinc-850/60 align-top">
                      <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">{app.country}</div>
                      <div className="text-sm font-extrabold text-white mt-1 leading-snug truncate" title={app.universityName}>
                        {app.universityName}
                      </div>
                      <div className="text-xs text-zinc-400 font-semibold leading-relaxed mt-0.5 truncate" title={app.courseName}>
                        {app.courseName}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 1. General Profile */}
                <tr className="bg-zinc-900/10 border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">World Ranking</td>
                  {appsToCompare.map(app => {
                    const isBest = app.worldRanking && app.worldRanking === minWorldRank;
                    return (
                      <td key={app.id} className={`p-4 border-l border-zinc-850/60 text-xs font-semibold ${isBest ? "bg-green-500/5 text-green-400 font-bold" : "text-zinc-300"}`}>
                        {app.worldRanking ? `#${app.worldRanking}` : "N/A"}
                        {isBest && <span className="ml-1.5 inline-block text-[9px] bg-green-500/15 border border-green-500/20 px-1.5 py-0.2 rounded-md font-extrabold uppercase">Top</span>}
                      </td>
                    );
                  })}
                </tr>

                <tr className="border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">Country Ranking</td>
                  {appsToCompare.map(app => (
                    <td key={app.id} className="p-4 border-l border-zinc-850/60 text-xs font-semibold text-zinc-300">
                      {app.countryRanking ? `#${app.countryRanking}` : "N/A"}
                    </td>
                  ))}
                </tr>

                <tr className="bg-zinc-900/10 border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">Duration (Months)</td>
                  {appsToCompare.map(app => (
                    <td key={app.id} className="p-4 border-l border-zinc-850/60 text-xs font-semibold text-zinc-300">
                      {app.durationMonths ? `${app.durationMonths} months` : "N/A"}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">University Address</td>
                  {appsToCompare.map(app => (
                    <td key={app.id} className="p-4 border-l border-zinc-850/60 text-[10px] text-zinc-450 leading-normal align-middle truncate" title={app.universityAddress}>
                      {app.universityAddress || "N/A"}
                    </td>
                  ))}
                </tr>

                {/* 2. Financial Layout */}
                <tr className="bg-primary/5 border-b border-zinc-850/60">
                  <td className="p-4 text-xxs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Tuition Fee (INR)</span>
                  </td>
                  {appsToCompare.map(app => {
                    const isCheapest = app.tuitionFeeINR && app.tuitionFeeINR === minTuition;
                    return (
                      <td key={app.id} className={`p-4 border-l border-zinc-850/60 text-xs font-extrabold ${isCheapest ? "bg-green-500/10 text-green-400" : "text-zinc-200"}`}>
                        {app.tuitionFeeINR ? `₹${app.tuitionFeeINR.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "N/A"}
                        <span className="block text-[9px] text-zinc-500 font-semibold mt-0.5">Original: {app.tuitionFeeOriginal ? `${app.tuitionFeeOriginal.toLocaleString()} ${app.tuitionFeeCurrency}` : "N/A"}</span>
                        {isCheapest && <span className="mt-1 inline-block text-[8px] bg-green-500/20 border border-green-500/20 px-1.5 py-0.2 rounded-md font-black uppercase text-green-400">Cheapest</span>}
                      </td>
                    );
                  })}
                </tr>

                <tr className="border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">Application Fee</td>
                  {appsToCompare.map(app => (
                    <td key={app.id} className="p-4 border-l border-zinc-850/60 text-xs font-semibold text-zinc-300">
                      {app.appFeeINR ? `₹${app.appFeeINR.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "N/A"}
                      <span className="block text-[9px] text-zinc-500 font-medium mt-0.5">Original: {app.appFeeOriginal ? `${app.appFeeOriginal} ${app.appFeeCurrency}` : "N/A"}</span>
                    </td>
                  ))}
                </tr>

                {/* 3. Deadlines */}
                <tr className="bg-zinc-900/10 border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">Priority Deadline</td>
                  {appsToCompare.map(app => (
                    <td key={app.id} className="p-4 border-l border-zinc-850/60 text-xs font-bold text-zinc-200">
                      {app.priorityDeadline || "N/A"}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">Final Deadline</td>
                  {appsToCompare.map(app => (
                    <td key={app.id} className="p-4 border-l border-zinc-850/60 text-xs font-bold text-zinc-200">
                      {app.finalDeadline || "N/A"}
                    </td>
                  ))}
                </tr>

                {/* 4. Requirements */}
                <tr className="bg-zinc-900/10 border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">GPA Required</td>
                  {appsToCompare.map(app => (
                    <td key={app.id} className="p-4 border-l border-zinc-850/60 text-xs font-semibold text-zinc-300">
                      {app.gpaRequired || "N/A"}
                      {app.gpaComments && <span className="block text-[9px] text-zinc-500 font-medium mt-1 leading-normal italic">{app.gpaComments}</span>}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">Required Exams</td>
                  {appsToCompare.map(app => (
                    <td key={app.id} className="p-4 border-l border-zinc-850/60 text-xs font-semibold text-zinc-300 space-y-1">
                      <div>IELTS: <span className="font-bold text-white">{app.ieltsRequired || "N/A"}</span></div>
                      <div>GRE: <span className="font-bold text-zinc-300">{app.grePreferred ? "Preferred / Required" : "Not Preferred"}</span></div>
                      {app.greComments && <span className="block text-[9px] text-zinc-500 font-medium leading-normal mt-0.5">{app.greComments}</span>}
                    </td>
                  ))}
                </tr>

                {/* 5. Documents Checklist */}
                <tr className="bg-zinc-900/10 border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">Letters of Recommendation</td>
                  {appsToCompare.map(app => (
                    <td key={app.id} className="p-4 border-l border-zinc-850/60 text-xs font-semibold text-zinc-300">
                      {app.lettersOfRecCount ? `${app.lettersOfRecCount} Required` : "None"}
                      {app.lettersOfRecComments && <span className="block text-[9px] text-zinc-500 font-medium mt-1 leading-normal">{app.lettersOfRecComments}</span>}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">Transcripts & Resume</td>
                  {appsToCompare.map(app => (
                    <td key={app.id} className="p-4 border-l border-zinc-850/60 text-xs font-semibold text-zinc-350 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${app.transcriptsRequired ? "bg-red-400 animate-pulse" : "bg-zinc-600"}`} />
                        <span>Transcripts: {app.transcriptsRequired ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${app.resumeRequired ? "bg-red-400 animate-pulse" : "bg-zinc-600"}`} />
                        <span>Resume/CV: {app.resumeRequired ? "Yes" : "No"}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="bg-zinc-900/10 border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">Statement of Purpose (SOP)</td>
                  {appsToCompare.map(app => (
                    <td key={app.id} className="p-4 border-l border-zinc-850/60 text-xs font-semibold text-zinc-300">
                      {app.sopRequired ? "SOP Required" : "Not Required"}
                      {app.sopComments && <span className="block text-[9px] text-zinc-500 font-medium mt-1 leading-normal">{app.sopComments}</span>}
                    </td>
                  ))}
                </tr>

                {/* 6. Experience Preferences */}
                <tr className="border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">Experience Preferences</td>
                  {appsToCompare.map(app => (
                    <td key={app.id} className="p-4 border-l border-zinc-850/60 text-xs font-semibold text-zinc-300 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${app.workExpPreferred ? "bg-primary" : "bg-zinc-650"}`} />
                        <span>Work Exp: {app.workExpPreferred ? "Preferred" : "No"}</span>
                      </div>
                      {app.workExpComments && <span className="block text-[9px] text-zinc-500 leading-normal pl-3.5">{app.workExpComments}</span>}
                      
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`h-2 w-2 rounded-full ${app.researchExpPreferred ? "bg-primary" : "bg-zinc-650"}`} />
                        <span>Research: {app.researchExpPreferred ? "Preferred" : "No"}</span>
                      </div>
                      {app.researchExpComments && <span className="block text-[9px] text-zinc-500 leading-normal pl-3.5">{app.researchExpComments}</span>}
                    </td>
                  ))}
                </tr>

                {/* 7. Interest and Status */}
                <tr className="bg-secondary/5 border-b border-zinc-850/60">
                  <td className="p-4 text-xxs font-extrabold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5" />
                    <span>Interest & Rating</span>
                  </td>
                  {appsToCompare.map(app => {
                    const isMaxInterest = app.interestRating === maxInterest;
                    return (
                      <td key={app.id} className={`p-4 border-l border-zinc-850/60 text-xs font-extrabold ${isMaxInterest ? "bg-green-500/10 text-green-400" : "text-zinc-200"}`}>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                          <span>{app.interestRating} / 10</span>
                        </div>
                        {app.interestComments && <p className="text-[9px] text-zinc-500 mt-1 font-medium leading-normal italic">{app.interestComments}</p>}
                        {isMaxInterest && <span className="mt-1.5 inline-block text-[8px] bg-green-500/20 border border-green-500/20 px-1.5 py-0.2 rounded-md font-black uppercase text-green-400">Fav Option</span>}
                      </td>
                    );
                  })}
                </tr>

                <tr className="border-b border-zinc-850/40">
                  <td className="p-4 text-xxs font-bold text-zinc-400 uppercase tracking-wider">Applied Before</td>
                  {appsToCompare.map(app => (
                    <td key={app.id} className="p-4 border-l border-zinc-850/60 text-xs font-semibold text-zinc-300">
                      {app.appliedBefore ? "Applied Prior Term" : "First Time Application"}
                    </td>
                  ))}
                </tr>

                {/* 8. Dynamic Extensible Custom Fields */}
                {allCustomKeys.map(key => (
                  <tr key={key} className="bg-zinc-900/10 border-b border-zinc-850/40">
                    <td className="p-4 text-xxs font-bold text-zinc-450 uppercase tracking-wider truncate" title={key}>{key}</td>
                    {appsToCompare.map(app => {
                      let val = "N/A";
                      try {
                        const parsed = JSON.parse(app.additionalFields || "{}");
                        if (parsed[key] !== undefined) {
                          val = String(parsed[key]);
                        }
                      } catch {}
                      return (
                        <td key={app.id} className="p-4 border-l border-zinc-850/60 text-xs font-medium text-zinc-300 truncate" title={val}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
