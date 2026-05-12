import React from "react";
import AdminLayout from "./AdminLayout";
import LiveMonitoring from "../HR/LiveMonitoring";

export default function AdminLiveMonitoring() {
  return (
    <AdminLayout
      title="Live Monitoring"
      description="Track real-time candidate assessment activity and review live exam events from the Admin portal."
    >
      <LiveMonitoring />
    </AdminLayout>
  );
}
