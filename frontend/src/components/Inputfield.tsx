import { type InputHTMLAttributes, forwardRef } from "react";
import "./InputField.css";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="input-field-container">
        <label htmlFor={id} className="input-label">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`input-field ${error ? 'input-error' : ''} ${className || ''}`}
          {...props}
        />
        {error && <p className="input-error-message">{error}</p>}
      </div>
    );
  },
);

InputField.displayName = "InputField";

export default InputField;