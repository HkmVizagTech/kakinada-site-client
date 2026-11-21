"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { authApi } from "@/lib/vanabhojanam/api";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { useAsyncData, vbToast } from "@/lib/vanabhojanam/hooks";
import { formatDate } from "@/lib/vanabhojanam/format";
import { useVbAuth } from "../../context/VbAuthContext";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { VbButton } from "../../ui/Button";
import { ErrorNotice, PageSpinner, VbBadge } from "../../ui/Feedback";
import { DataTable, PageHeader, type Column } from "../AdminKit";
import AddStaffModal from "./AddStaffModal";

const switchCls = "data-[state=checked]:bg-vb-brand-600";

/** Wraps a control in a tooltip that explains why it is locked (renders the control alone when `reason` is empty). */
function Locked({ reason, children }: { reason: string; children: ReactNode }) {
  if (!reason) return <>{children}</>;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{children}</span>
        </TooltipTrigger>
        <TooltipContent>{reason}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function StaffPage() {
  const { userId } = useVbAuth();
  const [addOpen, setAddOpen] = useState(false);
  const { data: users, loading, error, reload, setData } = useAsyncData<any[]>((signal) => authApi.listUsers(signal), []);
  const data = users || [];
  const [toDelete, setToDelete] = useState<any>(null);
  const [busyId, setBusyId] = useState<string | null>(null);


  const toggleActive = async (u: any) => {
    setBusyId(u._id);
    try {
      const updated = await authApi.updateUser(u._id, { active: !u.active });
      setData((prev) => (prev || []).map((x) => (x._id === u._id ? { ...x, ...updated } : x)));
      vbToast({ title: updated.active ? `${u.name} enabled` : `${u.name} disabled`, description: updated.active ? undefined : "They are signed out and cannot log in.", status: "success", duration: 3500 });
    } catch (err) {
      vbToast({ title: "Could not update", description: getErrorMessage(err), status: "error", duration: 5000 });
    } finally {
      setBusyId(null);
    }
  };

  const toggleCash = async (u: any) => {
    setBusyId(u._id);
    try {
      const updated = await authApi.updateUser(u._id, { canCollectCash: !u.canCollectCash });
      setData((prev) => (prev || []).map((x) => (x._id === u._id ? { ...x, ...updated } : x)));
      vbToast({ title: updated.canCollectCash ? `${u.name} can now take cash` : `${u.name} can no longer take cash`, status: "success", duration: 3500 });
    } catch (err) {
      vbToast({ title: "Could not update", description: getErrorMessage(err), status: "error", duration: 5000 });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    setBusyId(toDelete._id);
    try {
      await authApi.deleteUser(toDelete._id);
      setData((prev) => (prev || []).filter((x) => x._id !== toDelete._id));
      vbToast({ title: `${toDelete.name} deleted`, status: "success", duration: 3000 });
    } catch (err) {
      vbToast({ title: "Could not delete", description: getErrorMessage(err), status: "error", duration: 5000 });
    } finally {
      setBusyId(null);
      setToDelete(null);
    }
  };

  // Columns depend on the signed-in user and the busy row, so they are rebuilt only when those change.
  const columns: Column[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        render: (u) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold">{u.name}</span>
            {u._id === userId && <VbBadge color="purple">You</VbBadge>}
          </div>
        ),
      },
      { key: "email", header: "Email", render: (u) => u.email },
      { key: "role", header: "Role", render: () => <VbBadge color="blue">Volunteer</VbBadge> },
      { key: "added", header: "Added", render: (u) => formatDate(u.createdAt) },
      {
        key: "status",
        header: "Access",
        render: (u) => {
          const reason = u._id === userId ? "This is your own account" : "";
          const on = u.active !== false;
          return (
            <Locked reason={reason}>
              <span className="inline-flex items-center gap-2">
                <Switch className={switchCls} checked={on} disabled={Boolean(reason) || busyId === u._id} onCheckedChange={() => toggleActive(u)} aria-label={`${on ? "Disable" : "Enable"} ${u.name}`} />
                <VbBadge color={on ? "green" : "red"}>{on ? "Active" : "Disabled"}</VbBadge>
              </span>
            </Locked>
          );
        },
      },
      {
        key: "cash",
        header: "Cash desk",
        render: (u) => {
          const reason = u._id === userId ? "This is your own account" : "";
          return (
            <Locked reason={reason}>
              <span className="inline-flex items-center gap-2">
                <Switch className={switchCls} checked={Boolean(u.canCollectCash)} disabled={Boolean(reason) || busyId === u._id} onCheckedChange={() => toggleCash(u)} aria-label={`${u.canCollectCash ? "Remove" : "Give"} cash desk access for ${u.name}`} />
                <span className="text-sm">{u.canCollectCash ? "Can take cash" : "No"}</span>
              </span>
            </Locked>
          );
        },
      },
      {
        key: "actions",
        header: "",
        render: (u) => {
          const reason = u._id === userId ? "This is your own account" : "";
          return (
            <Locked reason={reason}>
              <VbButton variant="ghost" size="sm" className="w-9 px-0 text-red-600 hover:bg-red-50" aria-label={`Delete ${u.name}`} disabled={Boolean(reason)} onClick={() => setToDelete(u)}>
                <Trash2 className="h-4 w-4" />
              </VbButton>
            </Locked>
          );
        },
      },
    ],
    [userId, busyId]
  );

  if (loading && data.length === 0) return <PageSpinner minH="60vh" />;

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader title="Staff" subtitle="Everyone who can sign in to this admin console">
        <VbButton leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Add staff</VbButton>
      </PageHeader>
      <ErrorNotice error={error} onRetry={reload} />

      <DataTable columns={columns} rows={data} emptyText="No staff yet. Add a volunteer to let them use the QR scanner." />
      <p className="mt-3 text-xs text-gray-600">Disabling someone signs them out straight away.</p>

      <AddStaffModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(form) => {
          vbToast({ title: "Account created", description: `${form.email} can now sign in.`, status: "success", duration: 4000 });
          reload();
        }}
      />

      <ConfirmDialog isOpen={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={remove} confirmLabel="Delete" title="Delete account" isLoading={busyId === toDelete?._id}>
        Delete <strong>{toDelete?.name}</strong> ({toDelete?.email})? They lose access immediately. To keep the account but block it, disable it instead.
      </ConfirmDialog>
    </div>
  );
}
