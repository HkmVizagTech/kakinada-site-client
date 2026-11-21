"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/vanabhojanam/ui/AuthCard";
import { FormField, VbInput } from "@/components/vanabhojanam/ui/Fields";
import { VbButton } from "@/components/vanabhojanam/ui/Button";
import { homeForRole, useVbAuth } from "@/components/vanabhojanam/context/VbAuthContext";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { vbToast } from "@/lib/vanabhojanam/hooks";

export default function VanabhojanamAdminLogin() {
  const router = useRouter();
  const { login, status, role } = useVbAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Already signed in (token found): go straight to your home page.
  useEffect(() => {
    if (status === "authenticated" || status === "unverified") router.replace(homeForRole(role));
  }, [status, role, router]);

  const bind = (name: "email" | "password") => ({
    name,
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [name]: e.target.value })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const nextRole = await login(form);
      vbToast({ title: "Login successful.", description: "Welcome back!", status: "success", duration: 3000 });
      router.replace(homeForRole(nextRole));
    } catch (err) {
      vbToast({ title: "Login failed.", description: getErrorMessage(err, "Something went wrong."), status: "error", duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Admin Login" subtitle="Sign in to manage Vanabhojanam">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField id="email" label="Email" required>
          <VbInput id="email" type="email" placeholder="Enter your email" autoComplete="email" {...bind("email")} />
        </FormField>
        <FormField id="password" label="Password" required>
          <VbInput id="password" type="password" placeholder="Enter your password" autoComplete="current-password" {...bind("password")} />
        </FormField>
        <VbButton type="submit" variant="festival" loading={isLoading} className="w-full">
          Login
        </VbButton>
      </form>
    </AuthCard>
  );
}
