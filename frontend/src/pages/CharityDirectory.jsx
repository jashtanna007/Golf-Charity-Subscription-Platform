import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import CharityCard from "@/components/shared/CharityCard";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

function CharityDirectory() {
  const [charities, setCharities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charitiesRes, categoriesRes] = await Promise.all([
          api.get("/charities"),
          api.get("/charities/categories"),
        ]);
        setCharities(charitiesRes.data.charities || []);
        setCategories(categoriesRes.data.categories || []);
      } catch {
        setCharities([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCharities = charities.filter((c) => {
    const matchesCategory = !selectedCategory || c.category === selectedCategory;
    const matchesSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-headline text-display-sm text-on-surface mb-2">
          Charity Directory
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Explore our partner charities and choose who benefits from your subscription. Every round you play makes a difference.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search charities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory("")}
            className={cn(
              "px-4 py-2 rounded-full text-body-md font-medium transition-all",
              !selectedCategory
                ? "bg-primary text-white"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
              className={cn(
                "px-4 py-2 rounded-full text-body-md font-medium transition-all",
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-elevation-1 animate-pulse">
              <div className="h-48 bg-surface-container-low rounded-t-xl" />
              <div className="p-6 space-y-3">
                <div className="h-6 bg-surface-container rounded w-3/4" />
                <div className="h-4 bg-surface-container rounded w-full" />
                <div className="h-4 bg-surface-container rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCharities.map((charity) => (
            <motion.div
              key={charity.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <CharityCard charity={charity} />
            </motion.div>
          ))}
          {filteredCharities.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-body-lg text-on-surface-variant">No charities found matching your criteria.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default CharityDirectory;
