import type { BadgeProps } from "../ui";
import type { StoreSummary } from "../../services/api";

export interface StatusMeta {
  variant: BadgeProps["variant"];
  label: string;
}

export function storeStatusMeta(status: StoreSummary["status"]): StatusMeta {
  switch (status) {
    case "APPROVED":
      return { variant: "success", label: "Live" };
    case "SUSPENDED":
      return { variant: "danger", label: "Suspended" };
    default:
      return { variant: "warning", label: "Awaiting approval" };
  }
}

export function verificationMeta(
  status: StoreSummary["verificationStatus"],
): StatusMeta {
  switch (status) {
    case "VERIFIED":
      return { variant: "success", label: "Verified" };
    case "PENDING":
      return { variant: "warning", label: "Verification pending" };
    case "REJECTED":
      return { variant: "danger", label: "Verification rejected" };
    default:
      return { variant: "outline", label: "Unverified" };
  }
}
