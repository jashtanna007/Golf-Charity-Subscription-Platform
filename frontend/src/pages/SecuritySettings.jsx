import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, EyeOff, User, Heart } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import useAuthStore from "@/stores/authStore";

function SecuritySettings() {
  const { user, updateProfile, changePassword } = useAuthStore();
  const [profileForm, setProfileForm] = useState({
    fullName: user?.full_name || "",
    charityPercentage: user?.charity_percentage || 10,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");
    try {
      await updateProfile({
        fullName: profileForm.fullName,
        charityPercentage: parseInt(profileForm.charityPercentage),
      });
      setProfileMessage("Profile updated successfully");
    } catch (err) {
      setProfileError(err.response?.data?.error || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Failed to change password");
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-headline text-display-sm text-on-surface mb-1">
          Settings
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Manage your profile and security preferences.
        </p>
      </motion.div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card hover={false}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
                  <User className="w-5 h-5 text-on-primary-container" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-headline text-headline-sm text-on-surface">Profile</h3>
                  <p className="text-body-sm text-on-surface-variant">Update your personal details</p>
                </div>
              </div>

              {profileMessage && (
                <div className="bg-primary-container text-on-primary-container text-body-md p-3 rounded-lg mb-4">{profileMessage}</div>
              )}
              {profileError && (
                <div className="bg-error-container text-on-error-container text-body-md p-3 rounded-lg mb-4">{profileError}</div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <Input
                  id="settings-email"
                  label="Email"
                  value={user?.email || ""}
                  disabled
                  className="opacity-60"
                />
                <Input
                  id="settings-name"
                  label="Full Name"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                />
                <div className="space-y-1.5">
                  <label className="block font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                    Charity Contribution (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={profileForm.charityPercentage}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, charityPercentage: e.target.value }))}
                      className="flex-1 accent-primary"
                    />
                    <span className="font-headline text-headline-sm text-primary w-16 text-right">
                      {profileForm.charityPercentage}%
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    Minimum 10% of your subscription goes to your chosen charity.
                  </p>
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card hover={false}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center">
                  <Shield className="w-5 h-5 text-on-error-container" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-headline text-headline-sm text-on-surface">Security</h3>
                  <p className="text-body-sm text-on-surface-variant">Change your password</p>
                </div>
              </div>

              {passwordMessage && (
                <div className="bg-primary-container text-on-primary-container text-body-md p-3 rounded-lg mb-4">{passwordMessage}</div>
              )}
              {passwordError && (
                <div className="bg-error-container text-on-error-container text-body-md p-3 rounded-lg mb-4">{passwordError}</div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  id="current-password"
                  label="Current Password"
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
                <Input
                  id="new-password"
                  label="New Password"
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                />
                <Input
                  id="confirm-new-password"
                  label="Confirm New Password"
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
                <div className="flex items-center gap-4">
                  <Button type="submit" variant="outline">Change Password</Button>
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="text-body-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPasswords ? "Hide" : "Show"} passwords
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default SecuritySettings;
