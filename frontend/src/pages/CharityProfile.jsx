import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Heart, ExternalLink, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import useAuthStore from "@/stores/authStore";

function CharityProfile() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [charity, setCharity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupporting, setIsSupporting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  const isCurrentCharity = user?.charity_id === id;

  useEffect(() => {
    const fetchCharity = async () => {
      try {
        const { data } = await api.get(`/charities/${id}`);
        setCharity(data.charity);
      } catch {
        setCharity(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharity();
  }, [id]);

  const handleSupport = async () => {
    setIsSupporting(true);
    try {
      const { data } = await api.put("/charities/support", { charityId: id });
      useAuthStore.setState({ user: { ...user, charity_id: id } });
      setSupportSuccess(true);
    } catch (err) {
      window.alert("Failed to update charity: " + (err.response?.data?.error || err.message));
    }
    setIsSupporting(false);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-container rounded w-1/3" />
          <div className="h-64 bg-surface-container-low rounded-xl" />
          <div className="h-4 bg-surface-container rounded w-full" />
          <div className="h-4 bg-surface-container rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-body-lg text-on-surface-variant">Charity not found</p>
        <Link to="/charities" className="text-primary hover:underline mt-2 inline-block">
          Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link
        to="/charities"
        className="inline-flex items-center gap-2 text-body-md text-on-surface-variant hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white rounded-2xl shadow-elevation-2 overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-primary-container to-tertiary-container flex items-center justify-center">
            <Heart className="w-24 h-24 text-primary/20" strokeWidth={1} />
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-headline text-display-sm text-on-surface">
                    {charity.name}
                  </h1>
                  {charity.featured && <Badge variant="secondary">Featured</Badge>}
                </div>
                <Badge variant="outline">{charity.category}</Badge>
              </div>

              <div className="flex items-center gap-3">
                {charity.website_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(charity.website_url, "_blank")}
                  >
                    <Globe className="w-4 h-4" />
                    Visit Website
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}

                {isAuthenticated && (
                  isCurrentCharity || supportSuccess ? (
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-primary-container rounded-full">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="font-label text-label-lg text-on-primary-container">
                        Supporting
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleSupport}
                      disabled={isSupporting}
                    >
                      <Heart className="w-4 h-4" />
                      {isSupporting ? "Updating..." : "Support this Charity"}
                    </Button>
                  )
                )}
              </div>
            </div>

            {supportSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-container text-on-primary-container p-4 rounded-xl mb-6 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 shrink-0" />
                <p className="text-body-md font-medium">
                  You're now supporting {charity.name}! {user?.charity_percentage || 10}% of your subscription goes directly to them.
                </p>
              </motion.div>
            )}

            <p className="text-body-lg text-on-surface-variant leading-relaxed mb-8 max-w-3xl">
              {charity.description}
            </p>

            <div className="bg-surface-container-low rounded-xl p-6 mb-6">
              <h3 className="font-headline text-headline-sm text-on-surface mb-4">
                Community Impact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="font-headline text-headline-lg text-primary">
                    {formatCurrency(charity.total_received || 0)}
                  </p>
                  <p className="text-label-md text-on-surface-variant uppercase">Total Received</p>
                </div>
                <div>
                  <p className="font-headline text-headline-lg text-on-surface">10%+</p>
                  <p className="text-label-md text-on-surface-variant uppercase">Min. Contribution</p>
                </div>
                <div>
                  <p className="font-headline text-headline-lg text-on-surface">Active</p>
                  <p className="text-label-md text-on-surface-variant uppercase">Status</p>
                </div>
              </div>
            </div>

            <ProgressBar
              value={Math.min(parseFloat(charity.total_received || 0), 20000)}
              max={20000}
              label="Goal Progress"
              showLabel
              variant="primary"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CharityProfile;
