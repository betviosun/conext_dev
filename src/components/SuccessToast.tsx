"use client";

import { CheckIcon, CloseIcon } from "./Icons";

type SuccessToastProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
};

export function SuccessToast({
  open,
  onClose,
  title = "Enquiry received",
  message = "Thank you. Our team will review your message and respond shortly."
}: SuccessToastProps) {
  if (!open) return null;

  return (
    <div className="alert-toast" role="status" aria-live="polite">
      <div className="alert alert-success">
        <span className="alert-icon" aria-hidden="true"><CheckIcon size={22}/></span>
        <div className="alert-body">
          <strong>{title}</strong>
          <p>{message}</p>
        </div>
        <button type="button" className="alert-dismiss" aria-label="Dismiss notification" onClick={onClose}>
          <CloseIcon/>
        </button>
      </div>
    </div>
  );
}
