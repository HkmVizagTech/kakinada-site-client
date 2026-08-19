"use client";

import { ReactNode, useEffect } from "react";
import Image from "next/image";
import ISKLogo from "@/assets/ISKCONGambheeramLogo.jpeg";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLoaderProvider, useAdminLoader } from "@/contexts/AdminLoaderContext";

const InnerAdmin = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { isLoading, message } = useAdminLoader();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b bg-background px-4 gap-3 shrink-0">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-xs">A</span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      {isLoading && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-foreground/60">
          <div className="bg-background rounded-xl p-6 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center animate-spin">
              <Image src={typeof ISKLogo === 'string' ? ISKLogo : ISKLogo.src} alt="loading" width={64} height={64} className="w-full h-full object-cover" />
            </div>
            <p className="text-foreground font-medium">{message || "Processing..."}</p>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
};

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AdminLoaderProvider>
      <InnerAdmin>{children}</InnerAdmin>
    </AdminLoaderProvider>
  );
};

export default AdminLayout;
