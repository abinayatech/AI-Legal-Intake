import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Mail,
  Shield,
  Calendar,
  User,
  Phone,
  Lock,
  Save,
  Loader2,
} from "lucide-react";

import {
  fetchMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "@/services/api";

import {
  validateName,
  validatePhone,
  validatePasswordStrength,
  validateConfirmPassword,
} from "@/lib/validation";
export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — Lex Triage" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await fetchMyProfile();

        setName(profile.name ?? "");
        setPhone(profile.phone ?? "");
        setAvatar(profile.avatar_url ?? "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);
  async function handleSaveProfile() {
  setError("");
  setSuccess("");

  const nameError = validateName(name);
  const phoneError = validatePhone(phone);

  if (nameError) {
    setError(nameError);
    return;
  }

  if (phoneError) {
    setError(phoneError);
    return;
  }

  try {
    setSaving(true);

    await updateMyProfile({
      name,
      phone,
      avatar_url: avatar,
    });

    setSuccess("Profile updated successfully.");
  } catch (err: any) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
}
async function handleChangePassword() {
  setError("");
  setSuccess("");

  const strength = validatePasswordStrength(newPassword);

  if (!strength.valid) {
  setError(strength.message ?? "Password is not strong enough.");
  return;
}

  const confirmError = validateConfirmPassword(
    newPassword,
    confirmPassword,
  );

  if (confirmError) {
    setError(confirmError);
    return;
  }

  try {
    setSaving(true);

    await changeMyPassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    setSuccess("Password updated successfully.");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (err: any) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
}
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {success && (
  <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-400">
    {success}
  </div>
)}

{error && (
  <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
    {error}
  </div>
)}<div className="rounded-2xl border border-border bg-surface/50 p-8">
  <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
    <User className="h-5 w-5" />
    Edit Profile
  </h2>

  <div className="space-y-5">

    <div>
      <label className="mb-2 block text-sm font-medium">
        Full Name
      </label>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-border bg-background p-3"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Phone Number
      </label>

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-lg border border-border bg-background p-3"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Avatar URL
      </label>

      <input
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
        className="w-full rounded-lg border border-border bg-background p-3"
      />
    </div>

    <button
      onClick={handleSaveProfile}
      disabled={saving}
      className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-primary-foreground"
    >
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}

      Save Profile
    </button>

  </div>
</div>
<div className="rounded-2xl border border-border bg-surface/50 p-8">

  <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
    <Lock className="h-5 w-5" />
    Change Password
  </h2>

  <div className="space-y-5">

    <input
      type="password"
      placeholder="Current Password"
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
      className="w-full rounded-lg border border-border bg-background p-3"
    />

    <input
      type="password"
      placeholder="New Password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      className="w-full rounded-lg border border-border bg-background p-3"
    />

    <input
      type="password"
      placeholder="Confirm Password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      className="w-full rounded-lg border border-border bg-background p-3"
    />

    <button
      onClick={handleChangePassword}
      disabled={saving}
      className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-primary-foreground"
    >
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Lock className="h-4 w-4" />
      )}

      Change Password

    </button>

  </div>

</div>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Account</p>
        <h1 className="mt-1 font-display text-3xl text-foreground">Profile</h1>
      </div>

      <div className="rounded-2xl border border-border bg-surface/50 p-8">
        <div className="flex items-center gap-5">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-semibold text-primary-foreground">
            {(user?.email ?? "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-display text-2xl text-foreground">
              {user?.email?.split("@")[0] ?? "Counsel"}
            </div>
            <div className="text-sm text-muted-foreground">Administrator</div>
          </div>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <Field icon={Mail} label="Email" value={user?.email ?? "—"} />
          <Field icon={Shield} label="Role" value="Administrator" />
          <Field icon={Calendar} label="Member since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"} />
          <Field icon={Shield} label="User ID" value={user?.id ?? "—"} mono />
        </dl>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={`mt-2 truncate text-sm text-foreground ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </div>
    </div>
  );
}