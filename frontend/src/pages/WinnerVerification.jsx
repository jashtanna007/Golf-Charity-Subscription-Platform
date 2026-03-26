import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Upload, CheckCircle, Clock, XCircle, Image, DollarSign, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import StatsCard from "@/components/shared/StatsCard";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

function WinnerVerification() {
  const [winners, setWinners] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRefs = useRef({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [winnersRes, statsRes] = await Promise.all([
        api.get("/winners"),
        api.get("/winners/stats"),
      ]);
      setWinners(winnersRes.data.winners || []);
      setStats(statsRes.data);
    } catch {}
    setIsLoading(false);
  };

  const handleUploadProof = async (winnerId, file) => {
    if (!file) return;
    setUploadingId(winnerId);
    const formData = new FormData();
    formData.append("winnerId", winnerId);
    formData.append("proof", file);
    try {
      await api.post("/winners/upload-proof", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchAll();
    } catch (err) {
      window.alert("Upload failed: " + (err.response?.data?.error || err.message));
    }
    setUploadingId(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-5 h-5 text-primary" />;
      case "rejected": return <XCircle className="w-5 h-5 text-error" />;
      default: return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-headline text-display-sm text-on-surface mb-2">My Winnings</h1>
        <p className="text-body-lg text-on-surface-variant">
          View your draw wins, upload score proof, and track payment status.
        </p>
      </motion.div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard icon={Trophy} label="Total Wins" value={stats.totalWins} />
          <StatsCard icon={DollarSign} label="Total Won" value={formatCurrency(stats.totalWon)} />
          <StatsCard icon={Clock} label="Pending" value={stats.pendingPayments} />
          <StatsCard icon={CheckCircle} label="Paid" value={stats.paidPayments} />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : winners.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-elevation-1 p-12 text-center">
          <Award className="w-16 h-16 text-on-surface-variant/20 mx-auto mb-4" strokeWidth={1} />
          <h2 className="font-headline text-headline-md text-on-surface mb-2">No Winnings Yet</h2>
          <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
            Keep entering the monthly draws for a chance to win. Winners are selected based on number matching.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {winners.map((winner, idx) => (
            <motion.div
              key={winner.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl shadow-elevation-1 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center shrink-0">
                      <Trophy className="w-7 h-7 text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-headline text-title-lg text-on-surface">
                          {winner.match_count}-Number Match
                        </h3>
                        <Badge variant={
                          winner.match_count === "5" ? "primary" :
                          winner.match_count === "4" ? "secondary" : "outline"
                        }>
                          Tier {winner.match_count === "5" ? "1" : winner.match_count === "4" ? "2" : "3"}
                        </Badge>
                      </div>
                      <p className="text-body-sm text-on-surface-variant">
                        Draw Date: {winner.draws ? formatDate(winner.draws.draw_date) : "—"}
                      </p>
                      {winner.draws?.winning_numbers && (
                        <div className="flex gap-1.5 mt-2">
                          {winner.draws.winning_numbers.map((n) => (
                            <span key={n} className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-label-sm text-on-primary-container font-label">
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-headline text-headline-md text-secondary">
                        {formatCurrency(winner.prize_amount)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {getStatusIcon(winner.verification_status)}
                        <span className="text-body-sm text-on-surface-variant capitalize">
                          {winner.verification_status || "unverified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-outline-variant/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={winner.payment_status === "paid" ? "success" : "warning"}>
                        Payment: {winner.payment_status || "pending"}
                      </Badge>
                      {winner.paid_at && (
                        <span className="text-body-sm text-on-surface-variant">
                          Paid on {formatDate(winner.paid_at)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {winner.proof_screenshot_url ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-container/30 rounded-lg">
                          <Image className="w-4 h-4 text-primary" />
                          <span className="text-body-sm text-on-primary-container">Proof uploaded</span>
                        </div>
                      ) : winner.verification_status !== "approved" ? (
                        <>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            ref={(el) => { fileInputRefs.current[winner.id] = el; }}
                            onChange={(e) => handleUploadProof(winner.id, e.target.files[0])}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={uploadingId === winner.id}
                            onClick={() => fileInputRefs.current[winner.id]?.click()}
                          >
                            <Upload className="w-4 h-4" />
                            {uploadingId === winner.id ? "Uploading..." : "Upload Score Proof"}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WinnerVerification;
