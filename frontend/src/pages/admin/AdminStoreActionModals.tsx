import { useState, useCallback } from "react";
import { AdminModal } from "../../components/admin/AdminModal";
import { AdminConfirmDialog } from "../../components/admin/AdminConfirmDialog";
import { Button } from "../../components/ui";
import { Input, Textarea } from "../../components/ui";
import { adminVerifyStore, adminRejectStore, adminSuspendStore, adminUnsuspendStore } from "../../services/api";
import { useAdminToast } from "../../hooks/useAdminToast";

interface AdminStoreActionModalsProps {
  onStoresChange: () => void;
}

export const AdminStoreActionModals = ({ onStoresChange }: AdminStoreActionModalsProps) => {
  const { showToast } = useAdminToast();

  const [verifyModalOpen, setVerifyModalOpen] = useState<{ storeId: string; listingLimit: string | null } | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState<string | null>(null);
  const [suspendModalOpen, setSuspendModalOpen] = useState<string | null>(null);
  const [unsuspendDialogOpen, setUnsuspendDialogOpen] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState<string | null>(null);
  const [suspendLoading, setSuspendLoading] = useState<string | null>(null);
  const [unsuspendLoading, setUnsuspendLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");

  const closeAllModals = useCallback(() => {
    setVerifyModalOpen(null);
    setRejectModalOpen(null);
    setSuspendModalOpen(null);
    setUnsuspendDialogOpen(null);
    setRejectReason("");
    setSuspendReason("");
  }, []);

  const handleVerifySubmit = async (storeId: string, listingLimit: number | null) => {
    setVerifyLoading(storeId);
    try {
      await adminVerifyStore(storeId, { listingLimit });
      showToast({ type: "success", title: "Store verified", message: "The store has been successfully verified." });
      onStoresChange();
      closeAllModals();
    } catch (error) {
      showToast({
        type: "error",
        title: "Verification failed",
        message: error instanceof Error ? error.message : "Failed to verify store",
      });
    } finally {
      setVerifyLoading(null);
    }
  };

  const handleRejectSubmit = async (storeId: string, reason: string) => {
    setRejectLoading(storeId);
    try {
      await adminRejectStore(storeId, { reason });
      showToast({ type: "success", title: "Store rejected", message: "The store verification has been rejected." });
      onStoresChange();
      closeAllModals();
    } catch (error) {
      showToast({
        type: "error",
        title: "Rejection failed",
        message: error instanceof Error ? error.message : "Failed to reject store",
      });
    } finally {
      setRejectLoading(null);
    }
  };

  const handleSuspendSubmit = async (storeId: string, reason: string) => {
    setSuspendLoading(storeId);
    try {
      await adminSuspendStore(storeId, { reason });
      showToast({ type: "success", title: "Store suspended", message: "The store has been suspended." });
      onStoresChange();
      closeAllModals();
    } catch (error) {
      showToast({
        type: "error",
        title: "Suspension failed",
        message: error instanceof Error ? error.message : "Failed to suspend store",
      });
    } finally {
      setSuspendLoading(null);
    }
  };

  const handleUnsuspendConfirm = async (storeId: string) => {
    setUnsuspendLoading(storeId);
    try {
      await adminUnsuspendStore(storeId);
      showToast({ type: "success", title: "Store unsuspended", message: "The store has been unsuspended." });
      onStoresChange();
      setUnsuspendDialogOpen(null);
    } catch (error) {
      showToast({
        type: "error",
        title: "Unsuspend failed",
        message: error instanceof Error ? error.message : "Failed to unsuspend store",
      });
    } finally {
      setUnsuspendLoading(null);
    }
  };

  return (
    <>
      {/* Verify Modal */}
      {verifyModalOpen && (
        <AdminModal
          isOpen={true}
          onClose={() => setVerifyModalOpen(null)}
          title="Verify Store"
          description="Set a listing limit for this store. Leave empty for unlimited listings."
          size="md"
          closeOnOverlayClick={!verifyLoading}
          closeOnEscape={!verifyLoading}
          footer={
            <>
              <Button variant="outline" onClick={() => setVerifyModalOpen(null)} disabled={verifyLoading !== null}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleVerifySubmit(verifyModalOpen.storeId, verifyModalOpen.listingLimit ? parseInt(verifyModalOpen.listingLimit, 10) : null)}
                isLoading={verifyLoading === verifyModalOpen.storeId}
                disabled={verifyLoading !== null}
              >
                Verify
              </Button>
            </>
          }
        >
          <Input
            label="Listing Limit"
            placeholder="Leave empty for unlimited"
            value={verifyModalOpen.listingLimit ?? ""}
            onChange={(e) => setVerifyModalOpen({ ...verifyModalOpen, listingLimit: e.target.value || null })}
            type="number"
            min={1}
            hint="Maximum number of product listings allowed for this store"
          />
        </AdminModal>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <AdminModal
          isOpen={true}
          onClose={() => { setRejectModalOpen(null); setRejectReason(""); }}
          title="Reject Verification"
          description="Provide a reason for rejecting this store's verification request."
          size="md"
          closeOnOverlayClick={!rejectLoading}
          closeOnEscape={!rejectLoading}
          footer={
            <>
              <Button variant="outline" onClick={() => { setRejectModalOpen(null); setRejectReason(""); }} disabled={rejectLoading !== null}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleRejectSubmit(rejectModalOpen, rejectReason)}
                isLoading={rejectLoading === rejectModalOpen}
                disabled={rejectLoading !== null || rejectReason.length < 10}
              >
                Reject
              </Button>
            </>
          }
        >
          <Textarea
            label="Reason (10-500 characters)"
            placeholder="Enter the reason for rejecting this store's verification..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            minLength={10}
            maxLength={500}
            rows={4}
            error={rejectReason.length > 0 && rejectReason.length < 10 ? "Reason must be at least 10 characters" : undefined}
          />
        </AdminModal>
      )}

      {/* Suspend Modal */}
      {suspendModalOpen && (
        <AdminModal
          isOpen={true}
          onClose={() => { setSuspendModalOpen(null); setSuspendReason(""); }}
          title="Suspend Store"
          description="Provide a reason for suspending this store."
          size="md"
          closeOnOverlayClick={!suspendLoading}
          closeOnEscape={!suspendLoading}
          footer={
            <>
              <Button variant="outline" onClick={() => { setSuspendModalOpen(null); setSuspendReason(""); }} disabled={suspendLoading !== null}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleSuspendSubmit(suspendModalOpen, suspendReason)}
                isLoading={suspendLoading === suspendModalOpen}
                disabled={suspendLoading !== null || suspendReason.length < 10}
              >
                Suspend
              </Button>
            </>
          }
        >
          <Textarea
            label="Reason (10-500 characters)"
            placeholder="Enter the reason for suspending this store..."
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            minLength={10}
            maxLength={500}
            rows={4}
            error={suspendReason.length > 0 && suspendReason.length < 10 ? "Reason must be at least 10 characters" : undefined}
          />
        </AdminModal>
      )}

      {/* Unsuspend Confirm Dialog */}
      <AdminConfirmDialog
        isOpen={unsuspendDialogOpen !== null}
        onClose={() => setUnsuspendDialogOpen(null)}
        onConfirm={() => handleUnsuspendConfirm(unsuspendDialogOpen!)}
        title="Unsuspend Store"
        message="Are you sure you want to unsuspend this store? This will restore its active status."
        confirmLabel="Unsuspend"
        cancelLabel="Cancel"
        variant="primary"
        isLoading={unsuspendLoading === unsuspendDialogOpen}
      />
    </>
  );
};