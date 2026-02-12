import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./PasswordField.css";

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="password-field-container">
        <label htmlFor={id} className="password-label">
          {label}
        </label>
        <div className="password-input-wrapper">
          <input
            ref={ref}
            id={id}
            type={showPassword ? "text" : "password"}
            className={`password-input ${error ? 'password-error' : ''} ${className || ''}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {error && <p className="password-error-message">{error}</p>}
      </div>
    );
  },
);

PasswordField.displayName = "PasswordField";

export default PasswordField;