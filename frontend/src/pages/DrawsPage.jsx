import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ticket, Clock } from "lucide-react";
import useDrawStore from "@/stores/drawStore";
import DrawResultCard from "@/components/shared/DrawResultCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

function DrawsPage() {
  const { draws, currentDraw, userEntry, fetchDraws, fetchCurrentDraw, enterDraw } = useDrawStore();
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [enterError, setEnterError] = useState("");

  useEffect(() => {
    fetchDraws();
    fetchCurrentDraw();
  }, []);

  const toggleNumber = (num) => {
    setSelectedNumbers((prev) =>
      prev.includes(num)
        ? prev.filter((n) => n !== num)
        : prev.length < 5
        ? [...prev, num]
        : prev
    );
  };

  const handleEnterDraw = async () => {
    setEnterError("");
    if (selectedNumbers.length !== 5) {
      setEnterError("Please select exactly 5 numbers");
      return;
    }
    try {
      await enterDraw(currentDraw.id, selectedNumbers.sort((a, b) => a - b));
      setSelectedNumbers([]);
      fetchCurrentDraw();
    } catch (err) {
      setEnterError(err.response?.data?.error || "Failed to enter draw");
    }
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-headline text-display-sm text-on-surface mb-1">
          Prize Draws
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Select your numbers, enter draws, and check your results.
        </p>
      </motion.div>

      {currentDraw && !userEntry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-elevation-2 p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg gradient-secondary flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-headline text-headline-sm text-on-surface">
                Enter This Month's Draw
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Select 5 numbers between 1 and 45
              </p>
            </div>
            <Badge variant="warning" className="ml-auto">
              <Clock className="w-3 h-3" />
              Open
            </Badge>
          </div>

          <div className="grid grid-cols-9 gap-2 mb-6">
            {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
              const isSelected = selectedNumbers.includes(num);
              return (
                <motion.button
                  key={num}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleNumber(num)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-label text-label-lg transition-all duration-200 ${
                    isSelected
                      ? "gradient-primary text-white shadow-glow-primary scale-110"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  {num}
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-body-md text-on-surface-variant">Selected:</span>
              <div className="flex gap-1.5">
                {selectedNumbers.sort((a, b) => a - b).map((num) => (
                  <div
                    key={num}
                    className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center"
                  >
                    <span className="text-white font-label text-label-md">{num}</span>
                  </div>
                ))}
                {Array.from({ length: 5 - selectedNumbers.length }, (_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-8 h-8 rounded-full border-2 border-dashed border-outline-variant"
                  />
                ))}
              </div>
            </div>
            <Button
              onClick={handleEnterDraw}
              disabled={selectedNumbers.length !== 5}
            >
              Enter Draw
            </Button>
          </div>

          {enterError && (
            <p className="text-body-sm text-error mt-3">{enterError}</p>
          )}
        </motion.div>
      )}

      {userEntry && currentDraw && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-container/30 rounded-xl p-6 mb-8"
        >
          <p className="text-body-lg text-on-surface font-medium mb-2">
            ✅ You're entered for this month's draw!
          </p>
          <div className="flex items-center gap-2">
            <span className="text-body-md text-on-surface-variant">Your numbers:</span>
            {userEntry.entry_numbers.map((num) => (
              <div
                key={num}
                className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center"
              >
                <span className="text-white font-label text-label-md">{num}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div>
        <h2 className="font-headline text-headline-md text-on-surface mb-4">
          Recent Draws
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draws.length === 0 ? (
            <p className="text-body-md text-on-surface-variant col-span-full text-center py-8">
              No draws have been held yet.
            </p>
          ) : (
            draws.map((draw) => (
              <DrawResultCard key={draw.id} draw={draw} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DrawsPage;
