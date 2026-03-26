import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import useAuthStore from "@/stores/authStore";
import api from "@/lib/api";

function Signup() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    charityId: "",
  });
  const [charities, setCharities] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const { data } = await api.get("/charities");
        setCharities(data.charities || []);
      } catch (err) {
        console.error("Failed to fetch charities:", err);
        setCharities([]);
      }
    };
    fetchCharities();
  }, []);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting signup with:", { email: formData.email, fullName: formData.fullName });
      const user = await signup(
        formData.email,
        formData.password,
        formData.fullName,
        formData.charityId || null
      );
      console.log("Signup successful, user:", user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to create account";
      console.error("Signup failed:", errorMessage, err);
      setError(errorMessage);
      window.alert("Signup Error: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] gradient-hero flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-headline text-headline-sm">G</span>
          </div>
          <h1 className="font-headline text-display-sm text-on-surface mb-2">
            Join The Green
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Start your journey of impact through golf
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-elevation-3 p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-error-container text-on-error-container text-body-md p-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="signup-name"
              label="Full Name"
              value={formData.fullName}
              onChange={handleChange("fullName")}
              placeholder="John Smith"
              required
            />

            <Input
              id="signup-email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              placeholder="you@example.com"
              required
            />

            <div className="relative">
              <Input
                id="signup-password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange("password")}
                placeholder="Min. 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Input
              id="signup-confirm"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder="Repeat your password"
              required
            />

            {charities.length > 0 && (
              <div className="space-y-1.5">
                <label className="block font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                  Select a Charity (Optional)
                </label>
                <select
                  value={formData.charityId}
                  onChange={handleChange("charityId")}
                  className="input-field"
                >
                  <option value="">Choose a charity to support...</option>
                  {charities.map((charity) => (
                    <option key={charity.id} value={charity.id}>
                      {charity.name}
                    </option>
                  ))}
                </select>
                <p className="text-body-sm text-on-surface-variant">
                  10% of your subscription will go to this charity. You can change this later.
                </p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-body-md text-on-surface-variant">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:text-primary-dim font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;
