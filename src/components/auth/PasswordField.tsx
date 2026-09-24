"use client";

import { useState } from "react";

type PasswordFieldProps = {
  name: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  disabled?: boolean;
  required?: boolean;
};

export function PasswordField({
  name,
  label,
  placeholder,
  autoComplete,
  disabled = false,
  required = true
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      {label}
      <div className="password-field">
        <input
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((value) => !value)}
          disabled={disabled}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}
