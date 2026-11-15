import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Input, Select } from "../../components/ui";
import { Search } from "lucide-react";

interface AdminFiltersProps {
  onSearch: (search: string) => void;
  onVerificationStatusChange: (status: string) => void;
  onStatusChange: (status: string) => void;
  search: string;
  verificationStatus: string;
  status: string;
}

export const AdminFilters = ({
  onSearch,
  onVerificationStatusChange,
  onStatusChange,
  search,
  verificationStatus,
  status,
}: AdminFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearchChange = useCallback(
    (value: string) => {
      onSearch(value);
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      setSearchParams(params, { replace: true });
    },
    [onSearch, searchParams, setSearchParams]
  );

  const handleVerificationStatusChange = useCallback(
    (value: string) => {
      onVerificationStatusChange(value);
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("verificationStatus", value);
      } else {
        params.delete("verificationStatus");
      }
      params.set("page", "1");
      setSearchParams(params, { replace: true });
    },
    [onVerificationStatusChange, searchParams, setSearchParams]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      onStatusChange(value);
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("status", value);
      } else {
        params.delete("status");
      }
      params.set("page", "1");
      setSearchParams(params, { replace: true });
    },
    [onStatusChange, searchParams, setSearchParams]
  );

  return (
    <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
        <Input
          placeholder="Search stores by name, owner..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
          className="w-full sm:w-80 md:w-96"
        />
        <Select
          value={verificationStatus}
          onChange={(e) => handleVerificationStatusChange(e.target.value)}
          options={[
            { value: "", label: "All Verification" },
            { value: "UNVERIFIED", label: "Unverified" },
            { value: "PENDING", label: "Pending" },
            { value: "VERIFIED", label: "Verified" },
            { value: "REJECTED", label: "Rejected" },
          ]}
          className="w-full sm:w-64 md:w-80"
        />
        <Select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          options={[
            { value: "", label: "All Status" },
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "SUSPENDED", label: "Suspended" },
          ]}
          className="w-full sm:w-64 md:w-80"
        />
      </div>
    </div>
  );
};