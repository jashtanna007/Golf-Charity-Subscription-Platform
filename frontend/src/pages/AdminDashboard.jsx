import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Trophy, Heart, CreditCard, BarChart3, Play, Pause,
  CheckCircle, XCircle, Clock, Search, ChevronDown, Zap,
  Eye, Image, ExternalLink, RefreshCw,
} from "lucide-react";
import StatsCard from "@/components/shared/StatsCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [pendingWinners, setPendingWinners] = useState([]);
  const [allWinners, setAllWinners] = useState([]);
  const [drawType, setDrawType] = useState("random");
  const [isExecutingDraw, setIsExecutingDraw] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [drawResult, setDrawResult] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchWinners();
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
  }, [activeTab, userSearch, userPage]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({ page: userPage, limit: 20 });
      if (userSearch) params.set("search", userSearch);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users || []);
      setUserTotal(data.total || 0);
    } catch {}
  };

  const fetchWinners = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        api.get("/admin/winners?status=pending"),
        api.get("/admin/winners"),
      ]);
      setPendingWinners(pendingRes.data.winners || []);
      setAllWinners(allRes.data.winners || []);
    } catch {}
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const { data } = await api.post("/admin/draws/simulate", { drawType });
      setSimulationResult(data);
    } catch {}
    setIsSimulating(false);
  };

  const handleExecuteDraw = async () => {
    setIsExecutingDraw(true);
    setDrawResult(null);
    try {
      const { data } = await api.post("/admin/draws/execute", { drawType });
      setDrawResult(data);
      fetchStats();
    } catch {}
    setIsExecutingDraw(false);
  };

  const handlePublishDraw = async (drawId) => {
    try {
      await api.post(`/admin/draws/${drawId}/publish`);
      setDrawResult(null);
      fetchStats();
    } catch {}
  };

  const handleVerifyWinner = async (winnerId, status) => {
    try {
      await api.put(`/admin/winners/${winnerId}/verify`, { status });
      fetchWinners();
    } catch {}
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "draws", label: "Draws", icon: Trophy },
    { id: "verification", label: "Verification", icon: CheckCircle },
  ];

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-headline text-display-sm text-on-surface mb-1">Admin Dashboard</h1>
        <p className="text-body-lg text-on-surface-variant">Platform management, draw execution & winner verification.</p>
      </motion.div>

      <div className="flex gap-2 mb-8 border-b border-outline-variant/20 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-body-md font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              {tab.label}
              {tab.id === "verification" && pendingWinners.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-error text-white text-xs flex items-center justify-center">
                  {pendingWinners.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && stats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard icon={Users} label="Total Users" value={stats.totalUsers} />
            <StatsCard icon={CreditCard} label="Active Subscribers" value={stats.activeSubscribers} />
            <StatsCard icon={BarChart3} label="Total Revenue" value={formatCurrency(stats.totalRevenue)} />
            <StatsCard icon={Heart} label="Charity Total" value={formatCurrency(stats.totalCharityContributions)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card hover={false}>
              <CardContent className="pt-6">
                <h3 className="font-headline text-headline-sm text-on-surface mb-4">Platform Metrics</h3>
                <div className="space-y-4">
                  {[
                    { label: "Total Draws", value: stats.totalDraws },
                    { label: "Total Prize Pool", value: formatCurrency(stats.totalPrizePool) },
                    { label: "Avg Revenue/User", value: stats.totalUsers > 0 ? formatCurrency(stats.totalRevenue / stats.totalUsers) : "$0.00" },
                    { label: "Sub. Rate", value: stats.totalUsers > 0 ? `${((stats.activeSubscribers / stats.totalUsers) * 100).toFixed(1)}%` : "0%" },
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                      <span className="text-body-md text-on-surface-variant">{metric.label}</span>
                      <span className="font-headline text-title-md text-on-surface">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card hover={false}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline text-headline-sm text-on-surface">Recent Winners</h3>
                  <Button variant="tertiary" size="sm" onClick={() => setActiveTab("verification")}>View All</Button>
                </div>
                {allWinners.slice(0, 5).length === 0 ? (
                  <p className="text-body-md text-on-surface-variant text-center py-6">No winners yet</p>
                ) : (
                  <div className="space-y-2">
                    {allWinners.slice(0, 5).map((w) => (
                      <div key={w.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                        <div>
                          <p className="font-label text-label-lg text-on-surface">{w.users?.full_name}</p>
                          <p className="text-body-sm text-on-surface-variant">{w.match_count}-match · {formatCurrency(w.prize_amount)}</p>
                        </div>
                        <Badge variant={w.verification_status === "approved" ? "success" : w.verification_status === "rejected" ? "error" : "warning"}>
                          {w.verification_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {activeTab === "users" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                className="input-field pl-10"
              />
            </div>
            <Badge variant="outline">{userTotal} users</Badge>
          </div>

          <div className="bg-white rounded-xl shadow-elevation-1 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-low text-label-md text-on-surface-variant uppercase font-label">
              <div className="col-span-4">User</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Subscription</div>
              <div className="col-span-2">Charity %</div>
              <div className="col-span-2">Joined</div>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {users.map((u) => {
                const sub = u.subscriptions?.[0];
                return (
                  <div key={u.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-container-low/50 transition-colors">
                    <div className="col-span-4">
                      <p className="font-label text-label-lg text-on-surface">{u.full_name}</p>
                      <p className="text-body-sm text-on-surface-variant">{u.email}</p>
                    </div>
                    <div className="col-span-2">
                      <Badge variant={u.role === "admin" ? "secondary" : "outline"}>{u.role}</Badge>
                    </div>
                    <div className="col-span-2">
                      <Badge variant={sub?.status === "active" ? "success" : "warning"}>
                        {sub?.status || "none"}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <span className="font-label text-label-lg text-primary">{u.charity_percentage}%</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-body-sm text-on-surface-variant">{formatDate(u.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {userTotal > 20 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/20">
                <Button variant="outline" size="sm" disabled={userPage <= 1} onClick={() => setUserPage(userPage - 1)}>Previous</Button>
                <span className="text-body-sm text-on-surface-variant">Page {userPage} of {Math.ceil(userTotal / 20)}</span>
                <Button variant="outline" size="sm" disabled={userPage >= Math.ceil(userTotal / 20)} onClick={() => setUserPage(userPage + 1)}>Next</Button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === "draws" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card hover={false}>
              <CardContent className="pt-6">
                <h3 className="font-headline text-headline-sm text-on-surface mb-4">Draw Configuration</h3>

                <div className="mb-6">
                  <p className="font-label text-label-md text-on-surface-variant uppercase mb-3">Generation Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "random", label: "Random", desc: "Pure random number generation" },
                      { value: "algorithmic", label: "Algorithmic", desc: "Weighted by score frequency" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDrawType(opt.value)}
                        className={`p-4 rounded-xl text-left transition-all ${
                          drawType === opt.value
                            ? "bg-primary-container ring-2 ring-primary"
                            : "bg-surface-container-low hover:bg-surface-container"
                        }`}
                      >
                        <p className="font-label text-label-lg text-on-surface">{opt.label}</p>
                        <p className="text-body-sm text-on-surface-variant mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6 p-4 bg-surface-container-low rounded-xl">
                  <p className="font-label text-label-md text-on-surface-variant uppercase mb-2">Prize Pool Distribution</p>
                  <div className="space-y-2">
                    {[
                      { label: "5-Number Match", pct: "40%", extra: "+ Jackpot Rollover" },
                      { label: "4-Number Match", pct: "35%", extra: "" },
                      { label: "3-Number Match", pct: "25%", extra: "" },
                    ].map((tier) => (
                      <div key={tier.label} className="flex items-center justify-between">
                        <span className="text-body-md text-on-surface">{tier.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-headline text-title-md text-primary">{tier.pct}</span>
                          {tier.extra && <span className="text-body-sm text-secondary">{tier.extra}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleSimulate} disabled={isSimulating}>
                    <Zap className="w-4 h-4" />
                    {isSimulating ? "Simulating..." : "Run Simulation"}
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={handleExecuteDraw} disabled={isExecutingDraw}>
                    <Play className="w-4 h-4" />
                    {isExecutingDraw ? "Executing..." : "Execute Draw"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {simulationResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card hover={false}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-headline text-headline-sm text-on-surface">Simulation Result</h3>
                        <Badge variant="secondary">Preview</Badge>
                      </div>
                      <div className="flex gap-2 mb-4">
                        {simulationResult.simulatedNumbers.map((n) => (
                          <div key={n} className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                            <span className="text-white font-label text-label-lg">{n}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 bg-surface-container-low rounded-lg">
                          <span className="text-body-sm text-on-surface-variant">5-match winners</span>
                          <span className="font-label text-label-lg text-on-surface">{simulationResult.potentialWinners[5]}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-surface-container-low rounded-lg">
                          <span className="text-body-sm text-on-surface-variant">4-match winners</span>
                          <span className="font-label text-label-lg text-on-surface">{simulationResult.potentialWinners[4]}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-surface-container-low rounded-lg">
                          <span className="text-body-sm text-on-surface-variant">3-match winners</span>
                          <span className="font-label text-label-lg text-on-surface">{simulationResult.potentialWinners[3]}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {drawResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card hover={false}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-headline text-headline-sm text-on-surface">Draw Executed!</h3>
                        <Badge variant="success">Live</Badge>
                      </div>
                      <div className="flex gap-2 mb-4">
                        {drawResult.winningNumbers?.map((n) => (
                          <div key={n} className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center">
                            <span className="text-white font-label text-label-lg">{n}</span>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-surface-container-low rounded-lg text-center">
                          <p className="font-headline text-headline-md text-on-surface">{drawResult.winnersCount}</p>
                          <p className="text-label-sm text-on-surface-variant uppercase">Winners</p>
                        </div>
                        <div className="p-3 bg-surface-container-low rounded-lg text-center">
                          <p className="font-headline text-headline-md text-secondary">{formatCurrency(drawResult.totalPool)}</p>
                          <p className="text-label-sm text-on-surface-variant uppercase">Prize Pool</p>
                        </div>
                      </div>
                      <Button variant="gold" className="w-full" onClick={() => handlePublishDraw(drawResult.drawId)}>
                        <CheckCircle className="w-4 h-4" />
                        Publish Results
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "verification" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-headline-md text-on-surface">
              Winner Verification Queue
            </h2>
            <Button variant="outline" size="sm" onClick={fetchWinners}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {pendingWinners.length === 0 ? (
            <div className="bg-white rounded-xl shadow-elevation-1 p-12 text-center">
              <CheckCircle className="w-12 h-12 text-primary/30 mx-auto mb-4" strokeWidth={1} />
              <p className="text-body-lg text-on-surface-variant">No pending verifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingWinners.map((winner) => (
                <motion.div
                  key={winner.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card hover={false} className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center shrink-0">
                          <Trophy className="w-6 h-6 text-white" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="font-headline text-title-lg text-on-surface">{winner.users?.full_name}</p>
                          <p className="text-body-sm text-on-surface-variant">{winner.users?.email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{winner.match_count}-match</Badge>
                            <Badge variant="secondary">{formatCurrency(winner.prize_amount)}</Badge>
                            <span className="text-body-sm text-on-surface-variant">
                              Draw: {winner.draws ? formatDate(winner.draws.draw_date) : "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {winner.proof_screenshot_url ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setProofPreview(
                              proofPreview === winner.id ? null : winner.id
                            )}
                          >
                            <Image className="w-4 h-4" />
                            {proofPreview === winner.id ? "Hide Proof" : "View Proof"}
                          </Button>
                        ) : (
                          <Badge variant="warning">No proof uploaded</Badge>
                        )}
                        <Button variant="primary" size="sm" onClick={() => handleVerifyWinner(winner.id, "approved")}>
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleVerifyWinner(winner.id, "rejected")}>
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {proofPreview === winner.id && winner.proof_screenshot_url && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="bg-surface-container-low rounded-xl p-4">
                            <img
                              src={`${import.meta.env.VITE_API_URL || ""}${winner.proof_screenshot_url}`}
                              alt="Score proof"
                              className="max-h-96 rounded-lg mx-auto"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {allWinners.filter((w) => w.verification_status !== "pending").length > 0 && (
            <div className="mt-8">
              <h3 className="font-headline text-headline-sm text-on-surface mb-4">Processed</h3>
              <div className="bg-white rounded-xl shadow-elevation-1 overflow-hidden">
                <div className="divide-y divide-outline-variant/10">
                  {allWinners
                    .filter((w) => w.verification_status !== "pending")
                    .slice(0, 10)
                    .map((w) => (
                      <div key={w.id} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                          <p className="font-label text-label-lg text-on-surface">{w.users?.full_name}</p>
                          <Badge variant="outline">{w.match_count}-match</Badge>
                          <span className="text-body-sm text-on-surface-variant">{formatCurrency(w.prize_amount)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={w.verification_status === "approved" ? "success" : "error"}>
                            {w.verification_status}
                          </Badge>
                          <Badge variant={w.payment_status === "paid" ? "success" : "outline"}>
                            {w.payment_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default AdminDashboard;
