import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, getMatchTypeLabel } from "@/lib/utils";

function DrawResultCard({ draw, userEntry, winners }) {
  const statusColors = {
    pending: "warning",
    completed: "primary",
    published: "success",
  };

  return (
    <Card hover className="overflow-hidden">
      <div className="h-1 gradient-primary" />
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-headline text-title-lg text-on-surface">
              {formatDate(draw.draw_date)}
            </p>
            <p className="text-body-sm text-on-surface-variant capitalize">
              {draw.draw_type} Draw
            </p>
          </div>
          <Badge variant={statusColors[draw.status]}>
            {draw.status}
          </Badge>
        </div>

        {draw.winning_numbers && draw.winning_numbers.length > 0 && (
          <div className="mb-4">
            <p className="font-label text-label-md text-on-surface-variant uppercase mb-2">
              Winning Numbers
            </p>
            <div className="flex gap-2">
              {draw.winning_numbers.map((num, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: idx * 0.1, type: "spring" }}
                  className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center"
                >
                  <span className="text-white font-label text-label-lg">{num}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {userEntry && (
          <div className="mb-4 p-3 bg-surface-container-low rounded-lg">
            <p className="font-label text-label-md text-on-surface-variant uppercase mb-2">
              Your Numbers
            </p>
            <div className="flex gap-2">
              {userEntry.entry_numbers.map((num, idx) => {
                const isMatch = draw.winning_numbers?.includes(num);
                return (
                  <div
                    key={idx}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-label text-label-md ${
                      isMatch
                        ? "gradient-primary text-white"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {draw.total_prize_pool > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
            <span className="text-body-sm text-on-surface-variant">Prize Pool</span>
            <span className="font-headline text-title-md text-secondary-dim">
              £{parseFloat(draw.total_prize_pool).toLocaleString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DrawResultCard;
