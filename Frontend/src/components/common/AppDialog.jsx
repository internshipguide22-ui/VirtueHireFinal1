import React, { useMemo, useState } from "react";
import "./AppDialog.css";

const TONE_META = {
  info: { badge: "Info" },
  success: { badge: "Success" },
  warning: { badge: "Confirm" },
  danger: { badge: "Warning" },
};

function AppDialog({
  open,
  tone = "info",
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  showCancel = false,
  onConfirm,
  onCancel,
}) {
  const meta = TONE_META[tone] || TONE_META.info;

  if (!open) return null;

  return (
    <div className="app-dialog-overlay" role="presentation">
      <div
        className={`app-dialog-card tone-${tone}`}
        role="dialog"
        aria-modal="true"
        aria-label={title || meta.badge}
      >
        <div className="app-dialog-badge">{meta.badge}</div>
        {title ? <h3 className="app-dialog-title">{title}</h3> : null}
        <p className="app-dialog-message">{message}</p>
        <div className="app-dialog-actions">
          {showCancel ? (
            <button
              type="button"
              className="app-dialog-btn secondary"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            className={`app-dialog-btn primary tone-${tone}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export const useAppDialog = () => {
  const [dialog, setDialog] = useState(null);

  const api = useMemo(
    () => ({
      showAlert: ({ title, message, tone = "info", confirmLabel = "OK" }) =>
        new Promise((resolve) => {
          setDialog({
            open: true,
            title,
            message,
            tone,
            confirmLabel,
            showCancel: false,
            onConfirm: () => {
              setDialog(null);
              resolve(true);
            },
          });
        }),
      showConfirm: ({
        title,
        message,
        tone = "warning",
        confirmLabel = "Confirm",
        cancelLabel = "Cancel",
      }) =>
        new Promise((resolve) => {
          setDialog({
            open: true,
            title,
            message,
            tone,
            confirmLabel,
            cancelLabel,
            showCancel: true,
            onConfirm: () => {
              setDialog(null);
              resolve(true);
            },
            onCancel: () => {
              setDialog(null);
              resolve(false);
            },
          });
        }),
    }),
    [],
  );

  const dialogNode = dialog ? (
    <AppDialog
      open={dialog.open}
      tone={dialog.tone}
      title={dialog.title}
      message={dialog.message}
      confirmLabel={dialog.confirmLabel}
      cancelLabel={dialog.cancelLabel}
      showCancel={dialog.showCancel}
      onConfirm={dialog.onConfirm}
      onCancel={dialog.onCancel}
    />
  ) : null;

  return { ...api, dialogNode };
};

export default AppDialog;
