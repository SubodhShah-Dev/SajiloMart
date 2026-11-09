import { useState } from "react";
import { User, Mail, Phone, Camera, Save, AlertCircle, CheckCircle } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge } from "../components/ui";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { setCredentials } from "../store/slices/authSlice";
import { updateCurrentUser } from "../services/api";

export const ProfilePage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone ?? "",
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      });

      dispatch(setCredentials(updatedUser));
      setFormData((current) => ({
        ...current,
        name: updatedUser.name,
        phone: updatedUser.phone ?? "",
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
    });
    setIsEditing(false);
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
        </div>
      </div>
    </div>
  );
};