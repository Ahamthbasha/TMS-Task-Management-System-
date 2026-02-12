import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { type AxiosError } from "axios";
import InputField from "../../../components/Inputfield";
import { verifyOTP, resendOTP } from "../../../api/authAction/userAuth";
import "./css/OTPVerification.css";

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type OTPForm = z.infer<typeof otpSchema>;

interface LocationState {
  email: string;
  expiresIn?: number;
}

interface ErrorResponse {
  success: boolean;
  message?: string;
  data?: {
    expiresIn?: number;
  };
}

interface ResendOTPResponse {
  success: boolean;
  message?: string;
  data?: {
    expiresIn?: number;
  };
}

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    resetField,
  } = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Redirect if no email in state
  useEffect(() => {
    if (!state?.email) {
      toast.error("No registration session found. Please register again.");
      navigate("/register");
    }
  }, [state, navigate]);

  // Set initial timer from backend or default
  useEffect(() => {
    if (state?.expiresIn) {
      setTimer(state.expiresIn);
    }
  }, [state]);

  // Countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer]);

  const onSubmit = async (data: OTPForm) => {
    if (!state?.email) return;
    
    setIsVerifying(true);
    try {
      const res = await verifyOTP({ 
        email: state.email, 
        otp: data.otp 
      });

      if (res.success) {
        toast.success(res.message || "Email verified successfully! Your account has been created.");
        // Navigate to login after successful verification
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      toast.error(err.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!state?.email) return;
    
    setIsResending(true);
    try {
      const res = await resendOTP({ email: state.email }) as ResendOTPResponse;
      
      if (res.success) {
        toast.success(res.message || "OTP resent successfully!");
        
        // Clear the OTP input field completely
        resetField("otp", { 
          defaultValue: "",
          keepError: false,
          keepTouched: false,
          keepDirty: false
        });
        
        // Also set value to empty string to ensure UI is cleared
        setValue("otp", "", { 
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false 
        });
        
        // Reset timer
        const expiresIn = res.data?.expiresIn || 60;
        setTimer(expiresIn);
        setCanResend(false);
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      toast.error(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoBack = () => {
    navigate("/register");
  };

  // Format email to show partial masking for privacy
  const maskEmail = (email: string) => {
    if (!email) return "";
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 3) {
      return `${localPart}***@${domain}`;
    }
    return `${localPart.substring(0, 3)}***${localPart.substring(localPart.length - 1)}@${domain}`;
  };

  // Handle OTP input change to auto-submit when 6 digits entered
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("otp", value, { shouldValidate: true });
    
    // Auto-submit when 6 digits are entered
    if (value.length === 6 && /^\d+$/.test(value)) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="otp-header">
          <div className="otp-icon">📧</div>
          <h1 className="otp-title">Verify Your Email</h1>
          <p className="otp-subtitle">
            We've sent a 6-digit verification code to
          </p>
          <div className="otp-email">{state?.email ? maskEmail(state.email) : ""}</div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="otp-form">
          <InputField
            label="Enter Verification Code"
            id="otp"
            type="text"
            placeholder="123456"
            {...register("otp")}
            onChange={handleOtpChange}
            error={errors.otp?.message}
            maxLength={6}
            autoComplete="off"
            autoFocus={true}
          />

          <div className="otp-timer">
            {!canResend ? (
              <p>
                Code expires in <span className="timer-highlight">{timer}s</span>
              </p>
            ) : (
              <p className="expired-text">Code expired. Please request a new one.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="verify-button"
          >
            {isVerifying ? (
              <>
                <span className="spinner"></span>
                Verifying...
              </>
            ) : (
              "Verify & Create Account"
            )}
          </button>

          <div className="resend-section">
            <p>Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={!canResend || isResending}
              className="resend-button"
            >
              {isResending ? "Sending..." : "Resend OTP"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoBack}
            className="back-button"
          >
            ← Back to Registration
          </button>
        </form>
      </div>
    </div>
  );
}