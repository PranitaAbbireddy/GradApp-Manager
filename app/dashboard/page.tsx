"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  GraduationCap, LogOut, Plus, Search, Calendar, DollarSign, Award,
  Sparkles, CheckCircle2, AlertCircle, FileText, Globe, Clock, 
  Trash2, Edit3, ArrowRightLeft, Download, Upload, Eye, X, HelpCircle
} from "lucide-react";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Data states
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  
  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  
  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dynamic Custom Fields State
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([]);

  const [formData, setFormData] = useState<Application>({
    country: "",
    universityName: "",
    universityAddress: "",
    worldRanking: null,
    countryRanking: null,
    courseName: "",
    courseWebsite: "",
    durationMonths: null,
    gpaRequired: "",
    gpaComments: "",
    transcriptsRequired: false,
    transcriptsComments: "",
    resumeRequired: false,
    resumeComments: "",
    lettersOfRecCount: 0,
    lettersOfRecComments: "",
    sopRequired: false,
    sopComments: "",
    ieltsRequired: null,
    grePreferred: false,
    greComments: "",
    workExpPreferred: false,
    workExpComments: "",
    researchExpPreferred: false,
    researchExpComments: "",
    appliedBefore: false,
    openingDate: "",
    priorityDeadline: "",
    finalDeadline: "",
    appFeeOriginal: null,
    appFeeCurrency: "USD",
    tuitionFeeOriginal: null,
    tuitionFeeCurrency: "USD",
    interestRating: 5,
    interestComments: "",
    status: "Preparing",
    additionalFields: "{}"
  });

  // Load applications & currency rates
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      fetchApplications();
      fetchCurrencyRates();
    }
  }, [status, router]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Error loading applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrencyRates = async () => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (res.ok) {
        const data = await res.json();
        setExchangeRates(data.rates || {});
      }
    } catch (err) {
      console.error("Error fetching rates, using offline fallbacks:", err);
    }
  };

  // Convert input value dynamically to INR on client (for instant form review)
  const calculateINR = (amount: number | null | undefined, currency: string) => {
    if (!amount || isNaN(amount)) return 0;
    if (currency === "INR") return amount;
    
    const rateToUSD = exchangeRates[currency];
    const rateINR = exchangeRates["INR"] || 83.5;
    
    if (!rateToUSD) return Math.round(amount * 83.5);
    const amountInUSD = amount / rateToUSD;
    return Math.round(amountInUSD * rateINR * 100) / 100;
  };

  const handleOpenAddModal = () => {
    setSelectedApp(null);
    setCustomFields([]);
    setFormData({
      country: "",
      universityName: "",
      universityAddress: "",
      worldRanking: null,
      countryRanking: null,
      courseName: "",
      courseWebsite: "",
      durationMonths: null,
      gpaRequired: "",
      gpaComments: "",
      transcriptsRequired: false,
      transcriptsComments: "",
      resumeRequired: false,
      resumeComments: "",
      lettersOfRecCount: 0,
      lettersOfRecComments: "",
      sopRequired: false,
      sopComments: "",
      ieltsRequired: null,
      grePreferred: false,
      greComments: "",
      workExpPreferred: false,
      workExpComments: "",
      researchExpPreferred: false,
      researchExpComments: "",
      appliedBefore: false,
      openingDate: "",
      priorityDeadline: "",
      finalDeadline: "",
      appFeeOriginal: null,
      appFeeCurrency: "USD",
      tuitionFeeOriginal: null,
      tuitionFeeCurrency: "USD",
      interestRating: 5,
      interestComments: "",
      status: "Preparing",
      additionalFields: "{}"
    });
    setFormError("");
    setActiveTab("general");
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (app: Application) => {
    setSelectedApp(app);
    setFormData({ ...app });
    
    // Parse dynamic custom fields
    try {
      const parsed = JSON.parse(app.additionalFields || "{}");
      const list = Object.entries(parsed).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setCustomFields(list);
    } catch {
      setCustomFields([]);
    }
    
    setFormError("");
    setActiveTab("general");
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    
    try {
      const res = await fetch(`/api/applications?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setApplications(applications.filter(a => a.id !== id));
        setSelectedIds(selectedIds.filter(x => x !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleCheckboxToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { key: "", value: "" }]);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleCustomFieldChange = (index: number, field: "key" | "value", text: string) => {
    const updated = [...customFields];
    updated[index][field] = text;
    setCustomFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    if (!formData.universityName || !formData.country || !formData.courseName) {
      setFormError("Country, University Name, and Course Name are required.");
      setIsSubmitting(false);
      return;
    }

    // Convert custom fields array into stringified JSON map
    const fieldsMap: Record<string, string> = {};
    customFields.forEach(cf => {
      if (cf.key.trim()) {
        fieldsMap[cf.key.trim()] = cf.value.trim();
      }
    });

    const payload = {
      ...formData,
      additionalFields: JSON.stringify(fieldsMap)
    };

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Something went wrong.");
      } else {
        setIsFormOpen(false);
        fetchApplications();
      }
    } catch (err) {
      console.error("Submit error:", err);
      setFormError("Internal Server Error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Backups handling (JSON)
  const handleExportJSON = () => {
    const cleanData = applications.map((app: any) => {
      const { id, userId, ...rest } = app;
      return rest;
    });
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(cleanData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `gradatlas_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Backups handling (CSV)
  const handleExportCSV = () => {
    if (applications.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      "University", "Course", "Country", "World Ranking", "Country Ranking", 
      "Status", "Priority Deadline", "Final Deadline", "Tuition Fee (Original)", 
      "Tuition Fee Currency", "Tuition Fee (INR)", "GPA Required", "Interest Rating"
    ];

    const rows = applications.map(app => [
      `"${app.universityName.replace(/"/g, '""')}"`,
      `"${app.courseName.replace(/"/g, '""')}"`,
      `"${app.country.replace(/"/g, '""')}"`,
      app.worldRanking || "",
      app.countryRanking || "",
      app.status,
      app.priorityDeadline || "",
      app.finalDeadline || "",
      app.tuitionFeeOriginal || "",
      app.tuitionFeeCurrency,
      app.tuitionFeeINR || "",
      `"${(app.gpaRequired || "").replace(/"/g, '""')}"`,
      app.interestRating
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `gradatlas_backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter application list
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.country.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    const matchesCountry = countryFilter === "All" || app.country === countryFilter;
    
    return matchesSearch && matchesStatus && matchesCountry;
  });

  // Calculate high-level KPIs
  const totalAppsCount = applications.length;
  const acceptedAppsCount = applications.filter(a => a.status === "Accepted").length;
  const submittedAppsCount = applications.filter(a => a.status === "Submitted").length;
  
  // Total fees sum in INR
  const totalFeesINR = applications.reduce((sum, app) => {
    const appFee = app.appFeeINR || 0;
    const tuitionFee = app.tuitionFeeINR || 0;
    return sum + appFee + tuitionFee;
  }, 0);

  // Get nearest deadline
  const getNearestDeadline = () => {
    let nearest: { name: string; date: string; type: string } | null = null;
    const now = new Date();

    applications.forEach(app => {
      const dates = [
        { value: app.priorityDeadline, type: "Priority" },
        { value: app.finalDeadline, type: "Final" }
      ];

      dates.forEach(d => {
        if (d.value) {
          const deadlineDate = new Date(d.value);
          if (deadlineDate >= now) {
            if (!nearest || new Date(nearest.date) > deadlineDate) {
              nearest = {
                name: `${app.universityName} (${app.courseName})`,
                date: d.value,
                type: d.type
              };
            }
          }
        }
      });
    });
    return nearest;
  };

  const nearestDeadline = getNearestDeadline();

  // Extracted list of unique countries for filters
  const uniqueCountries = Array.from(new Set(applications.map(a => a.country)));

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <GraduationCap className="h-16 w-16 animate-spin text-primary" />
          <span className="text-zinc-400 font-medium">Synchronizing application records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] pb-24">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-800/40 bg-zinc-950/60 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              GradAtlas Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            {session && (
              <div className="hidden sm:flex items-center gap-3 pr-2 border-r border-zinc-800">
                <img 
                  src={session.user?.image || "https://api.dicebear.com/7.x/bottts/svg?seed=gradatlas"} 
                  alt="avatar" 
                  className="h-8 w-8 rounded-full border border-primary/30"
                />
                <div className="text-left">
                  <p className="text-xs font-semibold text-zinc-200">{session.user?.name}</p>
                  <p className="text-xxs text-zinc-500">{session.user?.email}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-red-400 bg-zinc-900/50 hover:bg-red-500/10 border border-zinc-800/80 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* KPI Panel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Total Applications */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-primary/5 rounded-full blur-xl" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Applications</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{totalAppsCount}</div>
            <div className="text-xxs text-zinc-500 mt-2 flex items-center gap-2">
              <span className="text-green-400 font-semibold">{acceptedAppsCount} Accepted</span>
              <span>&bull;</span>
              <span className="text-secondary font-semibold">{submittedAppsCount} Submitted</span>
            </div>
          </div>

          {/* Card 2: Status Breakdown */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-secondary/5 rounded-full blur-xl" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Admissions Status</span>
              <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-xs font-bold text-green-400">
                  {applications.filter(a => a.status === "Accepted").length}
                </div>
                <div className="text-[10px] text-zinc-500">Offers</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-yellow-500">
                  {applications.filter(a => a.status === "Pending").length}
                </div>
                <div className="text-[10px] text-zinc-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-zinc-300">
                  {applications.filter(a => a.status === "Preparing").length}
                </div>
                <div className="text-[10px] text-zinc-500">Draft</div>
              </div>
            </div>
          </div>

          {/* Card 4: Upcoming Deadlines */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-red-500/5 rounded-full blur-xl" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Next Deadline</span>
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            {nearestDeadline ? (
              <div>
                <div className="text-sm font-bold text-red-400 truncate max-w-[200px]" title={(nearestDeadline as any).name}>
                  {(nearestDeadline as any).name}
                </div>
                <div className="text-xs font-semibold text-zinc-200 mt-1">
                  {new Date((nearestDeadline as any).date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  <span className="text-[10px] text-zinc-500 ml-1">({(nearestDeadline as any).type})</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-500 font-medium">No upcoming deadlines detected</div>
            )}
          </div>
        </div>

        {/* Action Controls & Filtering Bar */}
        <div className="glass-panel rounded-2xl p-6 border border-zinc-850 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search university, course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-xl bg-zinc-900/80 border border-zinc-800 pl-10 pr-4 text-sm text-zinc-200 focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-300 focus:border-primary/50 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Shortlisted">Shortlisted for Applying</option>
              <option value="Not Shortlisted">Not Shortlisted</option>
              <option value="Preparing">Preparing (Draft)</option>
              <option value="Pending">Pending</option>
              <option value="Submitted">Submitted</option>
              <option value="Accepted">Accepted (Offer)</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Country Filter */}
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="h-10 rounded-xl bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-300 focus:border-primary/50 cursor-pointer"
            >
              <option value="All">All Countries</option>
              {uniqueCountries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto justify-end">
            {/* Single Export Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                className="h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4 text-primary" />
                <span>Export Backup</span>
              </button>
              
              {isExportDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsExportDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-44 rounded-xl bg-zinc-950 border border-zinc-850 p-1.5 shadow-2xl z-50 animate-fade-in">
                    <button
                      onClick={() => {
                        handleExportJSON();
                        setIsExportDropdownOpen(false);
                      }}
                      className="w-full text-left h-9 px-3 rounded-lg hover:bg-zinc-900 text-xxs font-bold text-zinc-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download className="h-4 w-4 text-primary" />
                      <span>Export as JSON</span>
                    </button>
                    <button
                      onClick={() => {
                        handleExportCSV();
                        setIsExportDropdownOpen(false);
                      }}
                      className="w-full text-left h-9 px-3 rounded-lg hover:bg-zinc-900 text-xxs font-bold text-zinc-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <FileText className="h-4 w-4 text-green-400" />
                      <span>Export as CSV</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Primary Add Button */}
            <button
              onClick={handleOpenAddModal}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold flex items-center justify-center gap-2 text-xs shadow-lg shadow-primary/20 hover:brightness-110 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add College</span>
            </button>
          </div>
        </div>

        {/* Applications List & Grid View */}
        {filteredApps.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 border border-zinc-850 text-center flex flex-col items-center justify-center">
            <GraduationCap className="h-12 w-12 text-zinc-700 mb-4" />
            <h4 className="text-lg font-bold text-zinc-300">No applications matched your criteria</h4>
            <p className="text-xs text-zinc-500 mt-2 max-w-sm leading-relaxed">
              To track your target universities, add them using the "Add College" button or adjust your search filters above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <div key={app.id} className="glass-card rounded-2xl border border-zinc-800/80 p-6 flex flex-col justify-between relative overflow-hidden">
                {/* Header info */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Country Badge */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20">
                      <Globe className="h-3 w-3" /> {app.country}
                    </span>
                    {/* Status Badge */}
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      app.status === "Accepted" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      app.status === "Rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      app.status === "Submitted" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      app.status === "Pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                      app.status === "Shortlisted" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                      app.status === "Not Shortlisted" ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" :
                      "bg-zinc-800/50 text-zinc-400 border-zinc-700"
                    }`}>
                      {app.status === "Shortlisted" ? "Shortlisted for Applying" :
                       app.status === "Not Shortlisted" ? "Not Shortlisted" :
                       app.status}
                    </span>
                  </div>

                  {/* University Name */}
                  <h3 className="text-lg font-extrabold text-white tracking-tight leading-snug line-clamp-1">
                    {app.universityName}
                  </h3>
                  
                  {/* Course Details */}
                  <p className="text-xs font-semibold text-zinc-400 mt-1 line-clamp-1">{app.courseName}</p>

                  <div className="flex items-center gap-4 mt-4 py-3 border-y border-zinc-850/80 text-xxs text-zinc-500">
                    <div>
                      World Rank: <span className="font-bold text-zinc-300">#{app.worldRanking || "N/A"}</span>
                    </div>
                    <div>
                      Tuition: <span className="font-bold text-zinc-300">₹{app.tuitionFeeINR ? app.tuitionFeeINR.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "N/A"}</span>
                    </div>
                  </div>

                  {/* Deadlines progress */}
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xxs">
                      <span className="text-zinc-500">Priority Deadline</span>
                      <span className="font-medium text-zinc-300">{app.priorityDeadline || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xxs">
                      <span className="text-zinc-500">Final Deadline</span>
                      <span className="font-medium text-zinc-350">{app.finalDeadline || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Operations & Comparison Checkbox footer */}
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-850/80">
                  <label className="flex items-center gap-2 text-xxs text-zinc-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(app.id || "")}
                      onChange={() => handleCheckboxToggle(app.id || "")}
                      className="h-4.5 w-4.5 rounded border-zinc-800 bg-zinc-950 text-primary focus:ring-primary/45 focus:ring-2 cursor-pointer"
                    />
                    <span>Compare</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(app)}
                      title="Edit Application Profile"
                      className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 transition-all cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(app.id || "")}
                      title="Delete Entry"
                      className="p-2 rounded-xl text-zinc-400 hover:text-red-400 bg-zinc-900/60 hover:bg-red-500/10 border border-zinc-800/80 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Side-by-side Floating Comparison Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl">
          <div className="glass-card rounded-2xl border border-primary/30 p-4 shadow-2xl flex items-center justify-between bg-zinc-950/95 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-secondary" />
            
            <div className="pl-2">
              <div className="text-xs font-bold text-white">Compare Colleges</div>
              <div className="text-xxs text-zinc-400 mt-0.5">{selectedIds.length} application(s) selected</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds([])}
                className="text-xxs text-zinc-400 hover:text-white px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Clear
              </button>
              
              <button
                onClick={() => router.push(`/dashboard/comparison?ids=${selectedIds.join(",")}`)}
                disabled={selectedIds.length < 2}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 hover:brightness-110 transition-all cursor-pointer"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>Compare Side-by-Side</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Form Add/Edit Drawer Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-premium rounded-2xl w-full max-w-4xl border border-zinc-800 shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-white">
                  {selectedApp ? "Edit University Application" : "Track New University Course"}
                </h3>
              </div>
              
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="px-6 py-2 border-b border-zinc-850/60 bg-zinc-900/20 flex gap-2 overflow-x-auto">
              {[
                { id: "general", label: "General" },
                { id: "academic", label: "Academics & Exams" },
                { id: "experience", label: "Experience" },
                { id: "deadlines", label: "Finance & Deadlines" },
                { id: "interest", label: "Interest & Custom Fields" }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xxs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === tab.id 
                      ? "bg-primary text-white" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xxs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Tab 1: General Info */}
              {activeTab === "general" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div>
                    <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">University Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stanford University"
                      value={formData.universityName}
                      onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                      className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">Course / Program Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MS in Computer Science"
                      value={formData.courseName}
                      onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                      className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">Country Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. USA"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">Course Website Link</label>
                    <input
                      type="url"
                      placeholder="e.g. https://cs.stanford.edu"
                      value={formData.courseWebsite}
                      onChange={(e) => setFormData({ ...formData, courseWebsite: e.target.value })}
                      className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">World Ranking</label>
                      <input
                        type="number"
                        placeholder="e.g. 5"
                        value={formData.worldRanking || ""}
                        onChange={(e) => setFormData({ ...formData, worldRanking: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">Country Ranking</label>
                      <input
                        type="number"
                        placeholder="e.g. 2"
                        value={formData.countryRanking || ""}
                        onChange={(e) => setFormData({ ...formData, countryRanking: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">Duration (Months)</label>
                    <input
                      type="number"
                      placeholder="e.g. 24"
                      value={formData.durationMonths || ""}
                      onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">Address of University</label>
                    <textarea
                      rows={2}
                      placeholder="Street, City, Zip, State"
                      value={formData.universityAddress}
                      onChange={(e) => setFormData({ ...formData, universityAddress: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 p-4 text-xs text-zinc-300 focus:border-primary/50"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Academics & Exams */}
              {activeTab === "academic" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* GPA and IELTS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">GPA Required Score</label>
                      <input
                        type="text"
                        placeholder="e.g. 3.5 / 4.0 or 8.5 CGPA"
                        value={formData.gpaRequired}
                        onChange={(e) => setFormData({ ...formData, gpaRequired: e.target.value })}
                        className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">GPA Required Comments</label>
                      <input
                        type="text"
                        placeholder="Specific GPA rules/conversions"
                        value={formData.gpaComments}
                        onChange={(e) => setFormData({ ...formData, gpaComments: e.target.value })}
                        className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">IELTS Required Score</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 7.5"
                        value={formData.ieltsRequired || ""}
                        onChange={(e) => setFormData({ ...formData, ieltsRequired: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                      />
                    </div>
                    
                    {/* GRE Toggle */}
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">GRE Test Requirement</label>
                      <div className="flex gap-4 items-center h-10">
                        <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.grePreferred}
                            onChange={(e) => setFormData({ ...formData, grePreferred: e.target.checked })}
                            className="h-4.5 w-4.5 rounded border-zinc-800 bg-zinc-950 text-primary"
                          />
                          <span>Preferred / Required</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.grePreferred && (
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">GRE Score / Rule Comments</label>
                      <input
                        type="text"
                        placeholder="Minimum quant score or waiver rules"
                        value={formData.greComments}
                        onChange={(e) => setFormData({ ...formData, greComments: e.target.value })}
                        className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                      />
                    </div>
                  )}

                  {/* Document Requirements (Toggles with Collapsible Comments) */}
                  <div className="border-t border-zinc-850/80 pt-6 space-y-4">
                    <h4 className="text-xs font-bold text-white mb-4">Required Documents</h4>
                    
                    {/* Transcripts */}
                    <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/20">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.transcriptsRequired}
                            onChange={(e) => setFormData({ ...formData, transcriptsRequired: e.target.checked })}
                            className="h-4.5 w-4.5 rounded border-zinc-800 bg-zinc-950 text-primary"
                          />
                          <span>Academic Transcripts Required</span>
                        </label>
                      </div>
                      {formData.transcriptsRequired && (
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Official mail/upload rules"
                            value={formData.transcriptsComments}
                            onChange={(e) => setFormData({ ...formData, transcriptsComments: e.target.value })}
                            className="w-full h-9 rounded-lg bg-zinc-950 border border-zinc-850 px-3 text-xxs text-zinc-300 focus:border-primary/50"
                          />
                        </div>
                      )}
                    </div>

                    {/* Resume / CV */}
                    <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/20">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.resumeRequired}
                            onChange={(e) => setFormData({ ...formData, resumeRequired: e.target.checked })}
                            className="h-4.5 w-4.5 rounded border-zinc-800 bg-zinc-950 text-primary"
                          />
                          <span>Resume / CV Required</span>
                        </label>
                      </div>
                      {formData.resumeRequired && (
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Page limits, format constraints, or specific outlines"
                            value={formData.resumeComments}
                            onChange={(e) => setFormData({ ...formData, resumeComments: e.target.value })}
                            className="w-full h-9 rounded-lg bg-zinc-950 border border-zinc-850 px-3 text-xxs text-zinc-300 focus:border-primary/50"
                          />
                        </div>
                      )}
                    </div>

                    {/* SOP */}
                    <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/20">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.sopRequired}
                            onChange={(e) => setFormData({ ...formData, sopRequired: e.target.checked })}
                            className="h-4.5 w-4.5 rounded border-zinc-800 bg-zinc-950 text-primary"
                          />
                          <span>Statement of Purpose (SOP) Required</span>
                        </label>
                      </div>
                      {formData.sopRequired && (
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Word limits, specific prompt instructions, etc."
                            value={formData.sopComments}
                            onChange={(e) => setFormData({ ...formData, sopComments: e.target.value })}
                            className="w-full h-9 rounded-lg bg-zinc-950 border border-zinc-850 px-3 text-xxs text-zinc-300 focus:border-primary/50"
                          />
                        </div>
                      )}
                    </div>

                    {/* Letters of Rec */}
                    <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/20">
                      <div className="flex items-center gap-6">
                        <div className="w-48 shrink-0">
                          <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">Letters of Recommendation</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 3"
                            value={formData.lettersOfRecCount}
                            onChange={(e) => setFormData({ ...formData, lettersOfRecCount: parseInt(e.target.value) || 0 })}
                            className="w-full h-9 rounded-lg bg-zinc-950 border border-zinc-850 px-3 text-xs text-zinc-350 focus:border-primary/50"
                          />
                        </div>
                        {formData.lettersOfRecCount > 0 && (
                          <div className="flex-1">
                            <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">LOR Specifications</label>
                            <input
                              type="text"
                              placeholder="Academic / Professional proportions"
                              value={formData.lettersOfRecComments}
                              onChange={(e) => setFormData({ ...formData, lettersOfRecComments: e.target.value })}
                              className="w-full h-9 rounded-lg bg-zinc-950 border border-zinc-850 px-3 text-xxs text-zinc-300 focus:border-primary/50"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Experience */}
              {activeTab === "experience" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Work Experience */}
                  <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/20">
                    <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.workExpPreferred}
                        onChange={(e) => setFormData({ ...formData, workExpPreferred: e.target.checked })}
                        className="h-4.5 w-4.5 rounded border-zinc-800 bg-zinc-950 text-primary"
                      />
                      <span>Work Experience Preferred</span>
                    </label>
                    {formData.workExpPreferred && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="e.g. Minimum 24 months preferred"
                          value={formData.workExpComments}
                          onChange={(e) => setFormData({ ...formData, workExpComments: e.target.value })}
                          className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                        />
                      </div>
                    )}
                  </div>

                  {/* Research Experience */}
                  <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/20">
                    <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.researchExpPreferred}
                        onChange={(e) => setFormData({ ...formData, researchExpPreferred: e.target.checked })}
                        className="h-4.5 w-4.5 rounded border-zinc-800 bg-zinc-950 text-primary"
                      />
                      <span>Research Experience / Publications Preferred</span>
                    </label>
                    {formData.researchExpPreferred && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="Specific journals or thesis details"
                          value={formData.researchExpComments}
                          onChange={(e) => setFormData({ ...formData, researchExpComments: e.target.value })}
                          className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                        />
                      </div>
                    )}
                  </div>

                  {/* Applied Before */}
                  <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/20">
                    <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.appliedBefore}
                        onChange={(e) => setFormData({ ...formData, appliedBefore: e.target.checked })}
                        className="h-4.5 w-4.5 rounded border-zinc-800 bg-zinc-950 text-primary"
                      />
                      <span>I have applied to this university or course in a prior term</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 4: Finances & Deadlines */}
              {activeTab === "deadlines" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">Application Opening Date</label>
                      <input
                        type="date"
                        value={formData.openingDate || ""}
                        onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                        className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">Priority Deadline</label>
                      <input
                        type="date"
                        value={formData.priorityDeadline || ""}
                        onChange={(e) => setFormData({ ...formData, priorityDeadline: e.target.value })}
                        className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">Final Deadline</label>
                      <input
                        type="date"
                        value={formData.finalDeadline || ""}
                        onChange={(e) => setFormData({ ...formData, finalDeadline: e.target.value })}
                        className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50"
                      />
                    </div>
                  </div>

                  {/* Financial Conversions Panel */}
                  <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-secondary" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live INR Currency Converter</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Application Fee */}
                      <div className="space-y-4 p-4 rounded-xl border border-zinc-850 bg-zinc-950/20">
                        <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider">Application Fee</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Fee"
                            value={formData.appFeeOriginal || ""}
                            onChange={(e) => setFormData({ ...formData, appFeeOriginal: e.target.value ? parseFloat(e.target.value) : null })}
                            className="flex-1 h-9 rounded-lg bg-zinc-950 border border-zinc-850 px-3 text-xs text-zinc-300 focus:border-primary/50"
                          />
                          <select
                            value={formData.appFeeCurrency}
                            onChange={(e) => setFormData({ ...formData, appFeeCurrency: e.target.value })}
                            className="w-24 h-9 rounded-lg bg-zinc-950 border border-zinc-850 px-2 text-xxs text-zinc-300 focus:border-primary/50 cursor-pointer"
                          >
                            {SUPPORTED_CURRENCIES.map(curr => (
                              <option key={curr.code} value={curr.code}>{curr.code}</option>
                            ))}
                          </select>
                        </div>
                        {formData.appFeeOriginal && (
                          <div className="text-[10px] font-bold text-green-400 flex items-center gap-1.5 pl-1">
                            <span>Equivalent Outlay:</span>
                            <span className="text-xs">₹{calculateINR(formData.appFeeOriginal, formData.appFeeCurrency).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                      </div>

                      {/* Tuition Fee */}
                      <div className="space-y-4 p-4 rounded-xl border border-zinc-850 bg-zinc-950/20">
                        <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider">Total Course Tuition Fee</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Tuition"
                            value={formData.tuitionFeeOriginal || ""}
                            onChange={(e) => setFormData({ ...formData, tuitionFeeOriginal: e.target.value ? parseFloat(e.target.value) : null })}
                            className="flex-1 h-9 rounded-lg bg-zinc-950 border border-zinc-850 px-3 text-xs text-zinc-300 focus:border-primary/50"
                          />
                          <select
                            value={formData.tuitionFeeCurrency}
                            onChange={(e) => setFormData({ ...formData, tuitionFeeCurrency: e.target.value })}
                            className="w-24 h-9 rounded-lg bg-zinc-950 border border-zinc-850 px-2 text-xxs text-zinc-300 focus:border-primary/50 cursor-pointer"
                          >
                            {SUPPORTED_CURRENCIES.map(curr => (
                              <option key={curr.code} value={curr.code}>{curr.code}</option>
                            ))}
                          </select>
                        </div>
                        {formData.tuitionFeeOriginal && (
                          <div className="text-[10px] font-bold text-green-400 flex items-center gap-1.5 pl-1">
                            <span>Equivalent Outlay:</span>
                            <span className="text-xs">₹{calculateINR(formData.tuitionFeeOriginal, formData.tuitionFeeCurrency).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Interest & Custom Extensibility */}
              {activeTab === "interest" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Status and Rating */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">Tracking Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-850 px-4 text-xs text-zinc-300 focus:border-primary/50 cursor-pointer"
                      >
                        <option value="Shortlisted">Shortlisted for Applying</option>
                        <option value="Not Shortlisted">Not Shortlisted</option>
                        <option value="Preparing">Preparing (Draft)</option>
                        <option value="Pending">Pending Requirements</option>
                        <option value="Submitted">Submitted (Under Review)</option>
                        <option value="Accepted">Accepted (Offer Letter)</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider">Interest Level: {formData.interestRating} / 10</label>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.interestRating}
                        onChange={(e) => setFormData({ ...formData, interestRating: parseInt(e.target.value, 10) })}
                        className="w-full accent-primary h-2 bg-zinc-950 rounded-lg cursor-pointer mt-4"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wider mb-2">Interest Rating Comments</label>
                    <textarea
                      rows={2}
                      placeholder="Why is this course or country rated this way?"
                      value={formData.interestComments}
                      onChange={(e) => setFormData({ ...formData, interestComments: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 p-4 text-xs text-zinc-300 focus:border-primary/50"
                    />
                  </div>

                  {/* Extensible Custom Attributes */}
                  <div className="border-t border-zinc-850/80 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dynamic Metadata Attributes</h4>
                        <p className="text-[10px] text-zinc-500 mt-1">Allows the platform to scale. Add key-value entries dynamically without database migrations.</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleAddCustomField}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-primary/30 text-zinc-200 font-bold text-[10px] flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Parameter</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {customFields.map((field, idx) => (
                        <div key={idx} className="flex gap-3 items-center animate-fade-in bg-zinc-950/20 p-2.5 rounded-xl border border-zinc-850">
                          <input
                            type="text"
                            required
                            placeholder="Attribute Label (e.g. Scholarship)"
                            value={field.key}
                            onChange={(e) => handleCustomFieldChange(idx, "key", e.target.value)}
                            className="flex-1 h-9 rounded-lg bg-zinc-950 border border-zinc-850 px-3 text-xs text-zinc-300"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Value (e.g. 50% Tuition Waiver)"
                            value={field.value}
                            onChange={(e) => handleCustomFieldChange(idx, "value", e.target.value)}
                            className="flex-1 h-9 rounded-lg bg-zinc-950 border border-zinc-850 px-3 text-xs text-zinc-350"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(idx)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 bg-zinc-950 border border-zinc-850 rounded-lg hover:border-red-500/20 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-850 bg-zinc-950 flex items-center justify-between">
              <span className="text-xxs text-zinc-500">* fields are required.</span>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? "Processing..." : (selectedApp ? "Save Profiles" : "Add College")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
