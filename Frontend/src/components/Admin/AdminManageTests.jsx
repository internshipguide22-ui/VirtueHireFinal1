import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import AdminLayout from "./AdminLayout";
import TestManager from "../HR/TestManager";
import LiveAssessments from "../HR/LiveAssessments";

export default function AdminManageTests() {
  const [refreshToken, setRefreshToken] = useState(0);

  const handleSuccess = () => {
    setRefreshToken((prev) => prev + 1);
  };

  return (
    <AdminLayout
      description="Create assessments and control live test availability from the Admin portal."
      actions={
        <button
          type="button"
          className="adm-refresh-btn"
          onClick={handleSuccess}
        >
          <RefreshCw size={18} /> Refresh
        </button>
      }
    >
      <div className="adm-module-stack">
        <TestManager apiBase="/admin" onSuccess={handleSuccess} />
        <div className="adm-section-spacer">
          <LiveAssessments apiBase="/admin" refreshTrigger={refreshToken} />
        </div>
      </div>
    </AdminLayout>
  );
}
