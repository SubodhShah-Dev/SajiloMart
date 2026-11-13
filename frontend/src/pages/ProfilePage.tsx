import { useState, useEffect, useCallback } from "react";
import { User, Mail, Phone, Camera, Save, AlertCircle, CheckCircle, Loader2, Check, Store, ExternalLink, ArrowRight, Shield, TrendingUp } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge } from "../components/ui";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { setCredentials } from "../store/slices/authSlice";
import { updateCurrentUser, checkUsernameAvailable } from "../services/api";

type UsernameStatus = "idle" | "checking" | "available" | "taken";

export const ProfilePage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone ?? "",
    username: user?.username || "",
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const checkUsername = useCallback(async (username: string) => {
    if (!user) return;
    if (!username || username === user.username) {
      setUsernameStatus("idle");
      setUsernameError(null);
      return;
    }

    if (!/^[a-z][a-z0-9_]{2,29}$/.test(username)) {
      setUsernameStatus("idle");
      setUsernameError("Username must start with a letter and contain only lowercase letters, numbers, and underscores (3-30 characters)");
      return;
    }

    setUsernameStatus("checking");
    setUsernameError(null);

    try {
      const result = await checkUsernameAvailable(username);
      if (result.available) {
        setUsernameStatus("available");
      } else {
        setUsernameStatus("taken");
        setUsernameError("That username is taken");
      }
    } catch {
      setUsernameStatus("idle");
      setUsernameError("Unable to check availability");
    }
  }, [user]);

  useEffect(() => {
    if (!user || !isEditing) return;

    const timer = setTimeout(() => {
      checkUsername(formData.username);
    }, 350);

    return () => clearTimeout(timer);
  }, [user, formData.username, isEditing, checkUsername]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-text-secondary">Loading profile...</p>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const updatedUser = await updateCurrentUser({
        name: formData.name,
        phone: formData.phone,
        username: formData.username,
      });

      dispatch(setCredentials(updatedUser));
      setFormData((current) => ({
        ...current,
        name: updatedUser.name,
        phone: updatedUser.phone ?? "",
        username: updatedUser.username,
      }));
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      username: user.username || "",
    });
    setIsEditing(false);
    setUsernameStatus("idle");
    setUsernameError(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">My Profile</h1>
          <p className="text-text-secondary">Manage your personal information and account settings</p>
        </div>

        {message && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-lg border animate-slide-down" role="alert">
            {message.type === "success" ? (
              <>
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" aria-hidden="true" />
                <span className="text-success">{message.text}</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-accent flex-shrink-0" aria-hidden="true" />
                <span className="text-accent">{message.text}</span>
              </>
            )}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card variant="outlined">
              <CardContent className="p-6">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="mx-auto w-24 h-24 rounded-full bg-primary-light flex items-center justify-center overflow-hidden border-4 border-primary/20">
                      {avatar ? (
                        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-12 w-12 text-primary" aria-hidden="true" />
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors cursor-pointer" htmlFor="avatar-upload">
                        <Camera className="h-4 w-4" aria-hidden="true" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="sr-only"
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">{user?.name || "User"}</h2>
                    <p className="text-sm text-text-secondary">@{user?.username || "user"}</p>
                    <p className="text-sm text-text-secondary">{user?.email || ""}</p>
                    <Badge variant={user?.role === "VENDOR" ? "primary" : user?.role === "ADMIN" ? "secondary" : "default"} size="sm" className="mt-2">
                      {user?.role || "CUSTOMER"}
                    </Badge>
                  </div>
                  {isEditing ? (
                    <div className="flex gap-3">
                      <Button variant="primary" fullWidth onClick={handleSave} isLoading={isSaving} leftIcon={<Save className="h-4 w-4" aria-hidden="true" />}>
                        Save Changes
                      </Button>
                      <Button variant="outline" fullWidth onClick={handleCancel}>Cancel</Button>
                    </div>
                  ) : (
                    <Button variant="outline" fullWidth onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-border space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 text-left">
                      <p className="text-xs text-text-muted">Email</p>
                      <p className="text-sm font-medium text-text-primary">{user?.email || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 text-left">
                      <p className="text-xs text-text-muted">Phone</p>
                      <p className="text-sm font-medium text-text-primary">{user.phone || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors">
                    <User className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 text-left">
                      <p className="text-xs text-text-muted">Member since</p>
                      <p className="text-sm font-medium text-text-primary">January 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    leftIcon={<User className="h-5 w-5" aria-hidden="true" />}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    disabled
                    leftIcon={<Mail className="h-5 w-5" aria-hidden="true" />}
                  />
                </div>

                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  leftIcon={<Phone className="h-5 w-5" aria-hidden="true" />}
                  placeholder="+1 (555) 000-0000"
                />

                <Input
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  disabled={!isEditing}
                  leftIcon={<User className="h-5 w-5" aria-hidden="true" />}
                  placeholder="Enter username"
                  rightIcon={
                    usernameStatus === "checking" ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
                    ) : usernameStatus === "available" ? (
                      <Check className="h-5 w-5 text-success" aria-hidden="true" />
                    ) : usernameStatus === "taken" ? (
                      <AlertCircle className="h-5 w-5 text-accent" aria-hidden="true" />
                    ) : null
                  }
                  error={usernameError ?? undefined}
                  hint={
                    usernameStatus === "available" ? "Available" :
                    usernameStatus === "taken" ? (usernameError ?? "That username is taken") :
                    usernameStatus === "checking" ? "Checking..." :
                    "Username must start with a letter, 3-30 chars, lowercase/numbers/underscores only"
                  }
                />

                <div className="pt-4 border-t border-border">
                  <h3 className="text-lg font-medium text-text-primary mb-4">Account Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div className="p-4 bg-surface rounded-lg">
                      <p className="text-text-muted">User ID</p>
                      <p className="font-mono text-text-primary">{user?.id || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-surface rounded-lg">
                      <p className="text-text-muted">Role</p>
                      <p className="font-medium text-text-primary capitalize">{user?.role?.toLowerCase() || "customer"}</p>
                    </div>
                    <div className="p-4 bg-surface rounded-lg">
                      <p className="text-text-muted">Status</p>
                      <p className="font-medium text-success">Active</p>
                    </div>
                    <div className="p-4 bg-surface rounded-lg">
                      <p className="text-text-muted">Email Verified</p>
                      <p className="font-medium text-success">Yes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {user?.role === "VENDOR" || user?.role === "ADMIN" ? (
            <div className="lg:col-span-3 mt-8">
              <Card variant="outlined">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" aria-hidden="true" /> Selling on SajiloMart</CardTitle>
                  <NavLink to="/seller">
                    <Button variant="primary" size="sm" leftIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                      Go to Dashboard
                    </Button>
                  </NavLink>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-text-secondary">Manage your store, products, and track your sales performance.</p>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card variant="outlined" className="p-4 text-center">
                      <p className="text-2xl font-bold text-primary">0</p>
                      <p className="text-sm text-text-secondary">Active Products</p>
                    </Card>
                    <Card variant="outlined" className="p-4 text-center">
                      <p className="text-2xl font-bold text-primary">$0.00</p>
                      <p className="text-sm text-text-secondary">Total Revenue</p>
                    </Card>
                    <Card variant="outlined" className="p-4 text-center">
                      <p className="text-2xl font-bold text-primary">0</p>
                      <p className="text-sm text-text-secondary">Orders This Month</p>
                    </Card>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <NavLink to="/seller">
                      <Button variant="primary" leftIcon={<Store className="h-4 w-4" aria-hidden="true" />}>
                        Open Seller Dashboard
                      </Button>
                    </NavLink>
                    <NavLink to={`/products/${user.username || "store"}`}>
                      <Button variant="outline" leftIcon={<ExternalLink className="h-4 w-4" aria-hidden="true" />}>
                        View Storefront
                      </Button>
                    </NavLink>
                    <NavLink to="/seller">
                      <Button variant="outline" leftIcon={<Store className="h-4 w-4" aria-hidden="true" />}>
                        Edit Store Profile
                      </Button>
                    </NavLink>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="lg:col-span-3 mt-8">
              <Card variant="outlined">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" aria-hidden="true" /> Start Selling on SajiloMart</CardTitle>
                  <NavLink to="/seller">
                    <Button variant="primary" size="sm" leftIcon={<Store className="h-4 w-4" aria-hidden="true" />}>
                      Create Your Store
                    </Button>
                  </NavLink>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-text-secondary">Turn your passion into profit. Join thousands of sellers on our marketplace.</p>
                  <div className="grid gap-4 md:grid-cols-3 text-center">
                    <div className="p-4 bg-surface rounded-lg">
                      <div className="p-3 bg-primary-light rounded-xl text-primary mx-auto mb-3 w-fit">
                        <Shield className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="font-medium text-text-primary">Secure Platform</p>
                      <p className="text-sm text-text-secondary">Protected payments and seller protection</p>
                    </div>
                    <div className="p-4 bg-surface rounded-lg">
                      <div className="p-3 bg-primary-light rounded-xl text-primary mx-auto mb-3 w-fit">
                        <TrendingUp className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="font-medium text-text-primary">Global Reach</p>
                      <p className="text-sm text-text-secondary">Access to millions of customers</p>
                    </div>
                    <div className="p-4 bg-surface rounded-lg">
                      <div className="p-3 bg-primary-light rounded-xl text-primary mx-auto mb-3 w-fit">
                        <Store className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="font-medium text-text-primary">Easy Setup</p>
                      <p className="text-sm text-text-secondary">Start selling in minutes</p>
                    </div>
                  </div>
                  <div className="text-center pt-4">
                    <NavLink to="/seller">
                      <Button variant="primary" size="lg" leftIcon={<Store className="h-5 w-5" aria-hidden="true" />}>
                        Start Selling Now
                      </Button>
                    </NavLink>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};