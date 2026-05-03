import { useEffect, useMemo, useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Droplets,
  FileText,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

type UserProfile = {
  fullName: string;
  email: string;
  age: string;
  gender: string;
  skinType: string;
  skinConcerns: string;
  allergies: string;
  currentProducts: string;
  medicalHistory: string;
};

const STORAGE_KEY = "dermasol_profile";

const defaultProfile: UserProfile = {
  fullName: "",
  email: "",
  age: "",
  gender: "",
  skinType: "",
  skinConcerns: "",
  allergies: "",
  currentProducts: "",
  medicalHistory: "",
};

const Profile = () => {
const navigate = useNavigate();
const location = useLocation();
const { user, isAuthenticated, loading } = useAuth();

useEffect(() => {
  if (loading) return;

  const cameFromInsideApp = location.state?.fromApp === true;

  if (!isAuthenticated || !cameFromInsideApp) {
    navigate("/auth", { replace: true });
  }
}, [loading, isAuthenticated, location.state, navigate]);

  const authFullName =
    (user?.user_metadata?.full_name as string | undefined) || "";
  const authEmail = user?.email || "";

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [draft, setDraft] = useState<UserProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (loading) return;

    const savedProfile = localStorage.getItem(STORAGE_KEY);

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile) as UserProfile;

        const mergedProfile: UserProfile = {
          ...defaultProfile,
          ...parsed,
          fullName: parsed.fullName || authFullName,
          email: parsed.email || authEmail,
        };

        setProfile(mergedProfile);
        setDraft(mergedProfile);
        return;
      } catch {
        // continue to fallback init
      }
    }

    const initialProfile: UserProfile = {
      ...defaultProfile,
      fullName: authFullName,
      email: authEmail,
    };

    setProfile(initialProfile);
    setDraft(initialProfile);
  }, [authFullName, authEmail, loading]);

  const completionPercentage = useMemo(() => {
    const values = Object.values(profile);
    const filled = values.filter((value) => value.trim() !== "").length;
    return Math.round((filled / values.length) * 100);
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDraft((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setDraft(profile);
    setIsEditing(true);
    setSaveMessage("");
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
    setSaveMessage("");
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setProfile(draft);
    setIsEditing(false);
    setSaveMessage("Profile saved successfully.");
  };

  const InfoRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon?: React.ReactNode;
  }) => (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground">
        {value?.trim() ? value : "Not provided"}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <section className="container mx-auto max-w-3xl px-6 py-16">
          <Card className="border-border shadow-sm">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Loading profile...</p>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <section className="container mx-auto max-w-3xl px-6 py-16">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Profile Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Please log in first to view and manage your DermaSol profile.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="border-b border-border bg-gradient-to-b from-teal-950 via-teal-900 to-background">
        <div className="container mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-sm text-white/70">Account / Profile</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                My Profile
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
                Manage your personal and skin-related information to make your
                DermaSol experience more personalized and relevant.
              </p>
            </div>

            <div className="min-w-[220px] rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-sm text-white/80">
                <span>Profile Completion</span>
                <span className="font-semibold text-white">{completionPercentage}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-white transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {saveMessage && (
              <p className="text-sm font-medium text-emerald-600">{saveMessage}</p>
            )}
          </div>

          {!isEditing ? (
            <Button
              onClick={handleEdit}
              className="bg-teal-700 text-white hover:bg-teal-800"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-teal-700 text-white hover:bg-teal-800"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="border-border shadow-sm lg:sticky lg:top-24">
              <CardContent className="pt-8">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <User className="h-9 w-9" />
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold text-foreground">
                    {profile.fullName || "Your Name"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {profile.email || "No email added"}
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="rounded-xl bg-muted/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Skin Type
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {profile.skinType || "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Skin Concerns
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {profile.skinConcerns || "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Medical History
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {profile.medicalHistory || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <User className="h-6 w-6 text-teal-700" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isEditing ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow label="Full Name" value={profile.fullName} icon={<User className="h-4 w-4" />} />
                    <InfoRow label="Email" value={profile.email} icon={<Mail className="h-4 w-4" />} />
                    <InfoRow label="Age" value={profile.age} icon={<Calendar className="h-4 w-4" />} />
                    <InfoRow label="Gender" value={profile.gender} icon={<User className="h-4 w-4" />} />
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Full Name</label>
                      <Input
                        name="fullName"
                        value={draft.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <Input
                        name="email"
                        type="email"
                        value={draft.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Age</label>
                      <Input
                        name="age"
                        value={draft.age}
                        onChange={handleChange}
                        placeholder="Enter your age"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Gender</label>
                      <select
                        name="gender"
                        value={draft.gender}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select gender</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Droplets className="h-6 w-6 text-teal-700" />
                  Skin Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isEditing ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow label="Skin Type" value={profile.skinType} icon={<Droplets className="h-4 w-4" />} />
                    <InfoRow label="Skin Concerns" value={profile.skinConcerns} icon={<FileText className="h-4 w-4" />} />
                    <InfoRow label="Allergies" value={profile.allergies} icon={<Shield className="h-4 w-4" />} />
                    <InfoRow label="Current Products" value={profile.currentProducts} icon={<FileText className="h-4 w-4" />} />
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Skin Type</label>
                      <select
                        name="skinType"
                        value={draft.skinType}
                        onChange={handleChange}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select skin type</option>
                        <option value="Oily">Oily</option>
                        <option value="Dry">Dry</option>
                        <option value="Combination">Combination</option>
                        <option value="Sensitive">Sensitive</option>
                        <option value="Normal">Normal</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Skin Concerns</label>
                      <Input
                        name="skinConcerns"
                        value={draft.skinConcerns}
                        onChange={handleChange}
                        placeholder="Acne, redness, pigmentation..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Allergies</label>
                      <Input
                        name="allergies"
                        value={draft.allergies}
                        onChange={handleChange}
                        placeholder="List any allergies"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Current Products</label>
                      <Input
                        name="currentProducts"
                        value={draft.currentProducts}
                        onChange={handleChange}
                        placeholder="Cleanser, serum, moisturizer..."
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Shield className="h-6 w-6 text-teal-700" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isEditing ? (
                  <InfoRow
                    label="Medical History"
                    value={profile.medicalHistory}
                    icon={<FileText className="h-4 w-4" />}
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Medical History
                    </label>
                    <textarea
                      name="medicalHistory"
                      value={draft.medicalHistory}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Mention any relevant skin-related or medical history"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;