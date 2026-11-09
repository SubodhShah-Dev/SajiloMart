import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Globe,
  CreditCard,
  Truck,
  Save,
  AlertCircle,
  CheckCircle,
  Trash2,
  Moon,
  Monitor,
  Sun,
  LogOut,
  Download,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge, Select } from "../components/ui";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useLogout } from "../hooks/useLogout";

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const settingsSections: SettingsSection[] = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: Globe },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "addresses", label: "Addresses", icon: Truck },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
];

export const SettingsPage = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const logout = useLogout();
  const [activeSection, setActiveSection] = useState("account");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <User className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Please Sign In</h2>
          <p className="text-text-secondary mb-6">You need to be signed in to access settings.</p>
          <a href="/login" className="inline-flex items-center gap-2">
            <Button variant="primary">Sign In</Button>
          </a>
        </div>
      </div>
    );
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogout = () => {
    void logout();
  };

  const renderAccountSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6 p-6 bg-surface rounded-xl">
        <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
          <User className="h-10 w-10 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-text-primary">{user?.name || "User"}</h3>
          <p className="text-text-secondary">{user?.email || ""}</p>
          <Badge variant={user?.role === "VENDOR" ? "primary" : user?.role === "ADMIN" ? "secondary" : "default"} className="mt-2">
            {user?.role || "CUSTOMER"}
          </Badge>
        </div>
        <Button variant="outline" leftIcon={<Save className="h-4 w-4" aria-hidden="true" />}>Edit Profile</Button>
      </div>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" defaultValue={user?.name || ""} leftIcon={<User className="h-5 w-5" aria-hidden="true" />} />
            <Input label="Email" type="email" defaultValue={user?.email || ""} leftIcon={<Mail className="h-5 w-5" aria-hidden="true" />} />
          </div>
          <Input label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" leftIcon={<Mail className="h-5 w-5" aria-hidden="true" />} />
          <div className="flex gap-3">
            <Button variant="primary" leftIcon={<Save className="h-4 w-4" aria-hidden="true" />} onClick={() => showMessage("success", "Account information updated!")}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Current Password" type="password" leftIcon={<Lock className="h-5 w-5" aria-hidden="true" />} />
          <Input label="New Password" type="password" leftIcon={<Lock className="h-5 w-5" aria-hidden="true" />} />
          <Input label="Confirm New Password" type="password" leftIcon={<Lock className="h-5 w-5" aria-hidden="true" />} />
          <div className="flex gap-3">
            <Button variant="primary" leftIcon={<Save className="h-4 w-4" aria-hidden="true" />} onClick={() => showMessage("success", "Password updated successfully!")}>
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Authenticator App</p>
              <p className="text-sm text-text-secondary">Use an authenticator app for extra security</p>
            </div>
            <Button variant="outline" leftIcon={<Shield className="h-4 w-4" aria-hidden="true" />} onClick={() => showMessage("success", "2FA setup initiated!")}>
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-surface rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="font-medium text-text-primary">Current Session</p>
                <p className="text-sm text-text-secondary">Chrome on Windows • Active now</p>
              </div>
            </div>
            <Badge variant="success" size="sm">Current</Badge>
          </div>
          <div className="p-4 bg-surface rounded-lg flex items-center justify-between opacity-50">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-text-muted" aria-hidden="true" />
              <div>
                <p className="font-medium text-text-secondary">Previous Session</p>
                <p className="text-sm text-text-muted">Safari on iPhone • 2 days ago</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-accent">Revoke</Button>
          </div>
          <Button variant="outline" fullWidth className="text-accent hover:text-accent-hover" onClick={() => showMessage("success", "All other sessions revoked!")}>
            Log Out of All Other Devices
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { id: "orders", label: "Order Updates", description: "Order confirmations, shipping updates, delivery notifications" },
            { id: "promotions", label: "Promotions & Offers", description: "Special deals, sales, and personalized recommendations" },
            { id: "newsletter", label: "Newsletter", description: "Weekly updates on new arrivals and trends" },
            { id: "security", label: "Security Alerts", description: "Login alerts, password changes, suspicious activity" },
            { id: "price_drops", label: "Price Drop Alerts", description: "Notify me when wishlist items go on sale" },
            { id: "back_in_stock", label: "Back in Stock", description: "Alert me when out-of-stock items are available" },
          ].map((notification) => (
            <div key={notification.id} className="flex items-center justify-between p-4 bg-surface rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-text-primary">{notification.label}</p>
                <p className="text-sm text-text-secondary">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-border peer-focus:ring-4 peer-focus:ring-primary peer-checked:bg-primary peer-checked:peer-focus:ring-primary peer-checked:bg-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-text-secondary">Enable browser notifications for real-time updates</p>
          <Button variant="outline" leftIcon={<Bell className="h-4 w-4" aria-hidden="true" />} onClick={() => showMessage("success", "Push notifications enabled!")}>
            Enable Push Notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">Theme</label>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: "light", label: "Light", icon: <Sun className="h-5 w-5" aria-hidden="true" /> },
                { value: "dark", label: "Dark", icon: <Moon className="h-5 w-5" aria-hidden="true" /> },
                { value: "system", label: "System", icon: <Monitor className="h-5 w-5" aria-hidden="true" /> },
              ].map((theme) => (
                <button
                  key={theme.value}
                  className="p-4 border-2 border-border rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center text-primary">{theme.icon}</div>
                  <span className="text-sm font-medium text-text-primary">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">Language</label>
            <Select
              options={[
                { value: "en", label: "English" },
                { value: "es", label: "Spanish" },
                { value: "fr", label: "French" },
                { value: "de", label: "German" },
              ]}
              defaultValue="en"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">Currency</label>
            <Select
              options={[
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
                { value: "JPY", label: "JPY (¥)" },
              ]}
              defaultValue="USD"
            />
          </div>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Communication Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Marketing Emails", description: "Receive promotional emails about sales and new products" },
            { label: "Product Recommendations", description: "Get personalized product suggestions based on your browsing" },
            { label: "Order SMS Updates", description: "Receive SMS notifications for order status changes" },
          ].map((pref, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-surface rounded-lg">
              <div>
                <p className="font-medium text-text-primary">{pref.label}</p>
                <p className="text-sm text-text-secondary">{pref.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-border peer-focus:ring-4 peer-focus:ring-primary peer-checked:bg-primary peer-checked:peer-focus:ring-primary peer-checked:bg-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderPaymentsSection = () => (
    <div className="space-y-6">
      <Card variant="outlined">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Saved Payment Methods</CardTitle>
          <Button variant="outline" size="sm" leftIcon={<CreditCard className="h-4 w-4" aria-hidden="true" />}>Add Card</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-primary" aria-hidden="true" />
              <div>
                <p className="font-medium text-text-primary">Visa ending in 4242</p>
                <p className="text-sm text-text-secondary">Expires 12/2026 • Default</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">Default</Badge>
              <Button variant="ghost" size="sm" className="text-text-muted hover:text-accent">Remove</Button>
            </div>
          </div>
          <div className="p-4 border border-border rounded-lg flex items-center justify-between opacity-50">
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-text-muted" aria-hidden="true" />
              <div>
                <p className="font-medium text-text-secondary">Mastercard ending in 8888</p>
                <p className="text-sm text-text-muted">Expires 08/2025</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-text-muted hover:text-accent">Remove</Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-surface rounded-lg">
            <p className="font-medium text-text-primary">123 Main Street</p>
            <p className="text-sm text-text-secondary">New York, NY 10001, United States</p>
          </div>
          <Button variant="outline" leftIcon={<Save className="h-4 w-4" aria-hidden="true" />}>Update Billing Address</Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderAddressesSection = () => (
    <div className="space-y-6">
      <Card variant="outlined">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shipping Addresses</CardTitle>
          <Button variant="primary" size="sm" leftIcon={<Truck className="h-4 w-4" aria-hidden="true" />}>Add Address</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Home", address: "123 Main St, New York, NY 10001", isDefault: true },
            { name: "Work", address: "456 Business Ave, New York, NY 10002", isDefault: false },
          ].map((addr, index) => (
            <div key={index} className="p-4 border border-border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-light rounded-xl text-primary">
                  <Truck className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary">{addr.name}</p>
                    {addr.isDefault && <Badge variant="success" size="sm">Default</Badge>}
                  </div>
                  <p className="text-sm text-text-secondary">{addr.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                {!addr.isDefault && <Button variant="ghost" size="sm" className="text-accent hover:text-accent-hover">Remove</Button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderDangerSection = () => (
    <div className="space-y-6">
      <Card variant="outlined" className="border-accent/20">
        <CardHeader>
          <CardTitle className="text-accent">Delete Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-text-primary">Permanently delete your account</p>
                <p className="text-sm text-text-secondary mt-1">This action cannot be undone. All your data, order history, wishlist, and saved preferences will be permanently removed.</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />} onClick={() => showMessage("error", "Account deletion requires confirmation")}>
              Delete My Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Download Your Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-text-secondary">Request a copy of all your personal data stored on our platform.</p>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" aria-hidden="true" />} onClick={() => showMessage("success", "Data export requested! You'll receive an email shortly.")}>
            Request Data Export
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return renderAccountSection();
      case "security":
        return renderSecuritySection();
      case "notifications":
        return renderNotificationsSection();
      case "preferences":
        return renderPreferencesSection();
      case "payments":
        return renderPaymentsSection();
      case "addresses":
        return renderAddressesSection();
      case "danger":
        return renderDangerSection();
      default:
        return renderAccountSection();
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
          <p className="text-text-secondary">Manage your account, preferences, and privacy settings</p>
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

        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <Card variant="outlined">
              <CardContent className="p-2">
                <nav aria-label="Settings navigation">
                  <ul role="list" className="space-y-1">
                    {settingsSections.map((section) => (
                      <li key={section.id}>
                        <button
                          type="button"
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            activeSection === section.id
                              ? "bg-primary text-white"
                              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                          }`}
                          aria-current={activeSection === section.id ? "page" : undefined}
                        >
                          <section.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                          {section.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent">
                    <Shield className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Security Tip</p>
                    <p className="text-sm text-text-secondary">Enable 2FA for extra account protection</p>
                  </div>
                </div>
                <Button variant="outline" fullWidth className="mt-4" onClick={() => setActiveSection("security")}>
                  Secure Your Account
                </Button>
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-3">
            {renderSection()}

            {activeSection !== "danger" && (
              <div className="mt-8 pt-8 border-t border-border">
                <Button variant="outline" leftIcon={<LogOut className="h-4 w-4" aria-hidden="true" />} className="text-accent hover:text-accent-hover" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};