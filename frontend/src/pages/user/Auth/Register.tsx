// // import { useForm } from "react-hook-form";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import * as z from "zod";
// // import { Link, useNavigate } from "react-router-dom";
// // import { toast } from "react-toastify";
// // import { type AxiosError } from "axios";
// // import InputField from "../../../components/Inputfield"; 
// // import PasswordField from "../../../components/Passwordfield"; 
// // import { registerUser } from "../../../api/authAction/userAuth";
// // import "./css/Register.css";

// // const registerSchema = z
// //   .object({
// //     name: z.string().min(2, "Name must be at least 2 characters"),
// //     email: z.string().email("Please enter a valid email"),
// //     password: z
// //       .string()
// //       .min(6, "Password must be at least 6 characters")
// //       .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
// //       .regex(/[a-z]/, "Password must contain at least one lowercase letter")
// //       .regex(/[0-9]/, "Password must contain at least one number"),
// //     confirmPassword: z.string(),
// //   })
// //   .refine((data) => data.password === data.confirmPassword, {
// //     message: "Passwords don't match",
// //     path: ["confirmPassword"],
// //   });

// // type RegisterForm = z.infer<typeof registerSchema>;

// // interface ValidationError {
// //   msg: string;
// //   path: string;
// // }

// // interface ErrorResponse {
// //   success: boolean;
// //   message?: string;
// //   errors?: ValidationError[];
// // }

// // export default function Register() {
// //   const navigate = useNavigate();

// //   const {
// //     register,
// //     handleSubmit,
// //     formState: { errors, isSubmitting },
// //   } = useForm<RegisterForm>({
// //     resolver: zodResolver(registerSchema),
// //   });

// //   const onSubmit = async (data: RegisterForm) => {
// //     try {
// //       const { name, email, password } = data;
// //       const res = await registerUser({ name, email, password });

// //       if (res.success) {
// //         toast.success(res.message || "Account created successfully! Please login to continue.");
// //         navigate("/login");
// //       }
// //     } catch (error: unknown) {
// //       const err = error as AxiosError<ErrorResponse>;

// //       if (err.response?.data) {
// //         const responseData = err.response.data;

// //         if (responseData.errors && Array.isArray(responseData.errors)) {
// //           responseData.errors.forEach((validationErr, index) => {
// //             toast.error(validationErr.msg, {
// //               toastId: `error-${validationErr.path}-${index}`,
// //             });
// //           });
// //         } else if (responseData.message) {
// //           toast.error(responseData.message);
// //         } else {
// //           toast.error("Registration failed. Please try again.");
// //         }
// //       } else {
// //         toast.error("Network error. Please check your connection and try again.");
// //       }
// //     }
// //   };

// //   return (
// //     <div className="register-container">
// //       <div className="register-card">
// //         <div className="register-header">
// //           <h1 className="register-title">TSK</h1>
// //           <p className="register-subtitle">
// //             Create your account to start managing tasks
// //           </p>
// //         </div>

// //         <form onSubmit={handleSubmit(onSubmit)} className="register-form">
// //           <InputField
// //             label="Full Name"
// //             id="name"
// //             type="text"
// //             placeholder="John Doe"
// //             {...register("name")}
// //             error={errors.name?.message}
// //           />

// //           <InputField
// //             label="Email Address"
// //             id="email"
// //             type="email"
// //             placeholder="you@example.com"
// //             {...register("email")}
// //             error={errors.email?.message}
// //           />

// //           <PasswordField
// //             label="Password"
// //             id="password"
// //             placeholder="••••••••"
// //             {...register("password")}
// //             error={errors.password?.message}
// //           />

// //           <PasswordField
// //             label="Confirm Password"
// //             id="confirmPassword"
// //             placeholder="••••••••"
// //             {...register("confirmPassword")}
// //             error={errors.confirmPassword?.message}
// //           />

// //           <button
// //             type="submit"
// //             disabled={isSubmitting}
// //             className="register-button"
// //           >
// //             {isSubmitting ? "Creating account..." : "Sign Up"}
// //           </button>
// //         </form>

// //         <p className="register-footer">
// //           Already have an account?{" "}
// //           <Link to="/login" className="register-link">
// //             Sign in
// //           </Link>
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }




















































// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Link, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { type AxiosError } from "axios";
// import { useState } from "react";
// import InputField from "../../../components/Inputfield"; 
// import PasswordField from "../../../components/Passwordfield"; 
// import { registerUser, verifyOTP, resendOTP } from "../../../api/authAction/userAuth";
// import "./css/Register.css";

// const registerSchema = z
//   .object({
//     name: z.string().min(2, "Name must be at least 2 characters"),
//     email: z.string().email("Please enter a valid email"),
//     password: z
//       .string()
//       .min(6, "Password must be at least 6 characters")
//       .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
//       .regex(/[a-z]/, "Password must contain at least one lowercase letter")
//       .regex(/[0-9]/, "Password must contain at least one number"),
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords don't match",
//     path: ["confirmPassword"],
//   });

// const otpSchema = z.object({
//   otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
// });

// type RegisterForm = z.infer<typeof registerSchema>;
// type OTPForm = z.infer<typeof otpSchema>;

// interface ValidationError {
//   msg: string;
//   path: string;
// }

// interface ErrorResponse {
//   success: boolean;
//   message?: string;
//   errors?: ValidationError[];
// }

// export default function Register() {
//   const navigate = useNavigate();
//   const [showOTPForm, setShowOTPForm] = useState(false);
//   const [userEmail, setUserEmail] = useState("");
//   const [isResending, setIsResending] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<RegisterForm>({
//     resolver: zodResolver(registerSchema),
//   });

//   const {
//     register: registerOTP,
//     handleSubmit: handleSubmitOTP,
//     formState: { errors: otpErrors, isSubmitting: isSubmittingOTP },
//   } = useForm<OTPForm>({
//     resolver: zodResolver(otpSchema),
//   });

//   const onSubmit = async (data: RegisterForm) => {
//     try {
//       const { name, email, password } = data;
//       const res = await registerUser({ name, email, password });

//       if (res.success) {
//         toast.success(res.message || "Registration successful! Please check your email for OTP.");
//         setUserEmail(email);
//         setShowOTPForm(true);
//       }
//     } catch (error: unknown) {
//       const err = error as AxiosError<ErrorResponse>;

//       if (err.response?.data) {
//         const responseData = err.response.data;

//         if (responseData.errors && Array.isArray(responseData.errors)) {
//           responseData.errors.forEach((validationErr, index) => {
//             toast.error(validationErr.msg, {
//               toastId: `error-${validationErr.path}-${index}`,
//             });
//           });
//         } else if (responseData.message) {
//           toast.error(responseData.message);
//         } else {
//           toast.error("Registration failed. Please try again.");
//         }
//       } else {
//         toast.error("Network error. Please check your connection and try again.");
//       }
//     }
//   };

//   const onSubmitOTP = async (data: OTPForm) => {
//     try {
//       const res = await verifyOTP({ email: userEmail, otp: data.otp });

//       if (res.success) {
//         toast.success(res.message || "Email verified successfully! Please login to continue.");
//         navigate("/login");
//       }
//     } catch (error: unknown) {
//       const err = error as AxiosError<ErrorResponse>;

//       if (err.response?.data) {
//         const responseData = err.response.data;
//         toast.error(responseData.message || "OTP verification failed. Please try again.");
//       } else {
//         toast.error("Network error. Please check your connection and try again.");
//       }
//     }
//   };

//   const handleResendOTP = async () => {
//     setIsResending(true);
//     try {
//       const res = await resendOTP(userEmail);
//       if (res.success) {
//         toast.success(res.message || "OTP resent successfully! Please check your email.");
//       }
//     } catch (error: unknown) {
//       const err = error as AxiosError<ErrorResponse>;
//       if (err.response?.data) {
//         const responseData = err.response.data;
//         toast.error(responseData.message || "Failed to resend OTP. Please try again.");
//       } else {
//         toast.error("Network error. Please try again.");
//       }
//     } finally {
//       setIsResending(false);
//     }
//   };

//   if (showOTPForm) {
//     return (
//       <div className="register-container">
//         <div className="register-card">
//           <div className="register-header">
//             <h1 className="register-title">Verify Your Email</h1>
//             <p className="register-subtitle">
//               We've sent a 6-digit OTP to {userEmail}
//             </p>
//           </div>

//           <form onSubmit={handleSubmitOTP(onSubmitOTP)} className="register-form">
//             <InputField
//               label="Enter OTP"
//               id="otp"
//               type="text"
//               placeholder="123456"
//               {...registerOTP("otp")}
//               error={otpErrors.otp?.message}
//               maxLength={6}
//             />

//             <button
//               type="submit"
//               disabled={isSubmittingOTP}
//               className="register-button"
//             >
//               {isSubmittingOTP ? "Verifying..." : "Verify OTP"}
//             </button>

//             <button
//               type="button"
//               onClick={handleResendOTP}
//               disabled={isResending}
//               className="resend-button"
//               style={{ marginTop: "1rem" }}
//             >
//               {isResending ? "Resending..." : "Resend OTP"}
//             </button>
//           </form>

//           <p className="register-footer">
//             Want to use a different email?{" "}
//             <button
//               onClick={() => setShowOTPForm(false)}
//               className="register-link"
//               style={{ background: "none", border: "none", cursor: "pointer" }}
//             >
//               Go back
//             </button>
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="register-container">
//       <div className="register-card">
//         <div className="register-header">
//           <h1 className="register-title">TSK</h1>
//           <p className="register-subtitle">
//             Create your account to start managing tasks
//           </p>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="register-form">
//           <InputField
//             label="Full Name"
//             id="name"
//             type="text"
//             placeholder="John Doe"
//             {...register("name")}
//             error={errors.name?.message}
//           />

//           <InputField
//             label="Email Address"
//             id="email"
//             type="email"
//             placeholder="you@example.com"
//             {...register("email")}
//             error={errors.email?.message}
//           />

//           <PasswordField
//             label="Password"
//             id="password"
//             placeholder="••••••••"
//             {...register("password")}
//             error={errors.password?.message}
//           />

//           <PasswordField
//             label="Confirm Password"
//             id="confirmPassword"
//             placeholder="••••••••"
//             {...register("confirmPassword")}
//             error={errors.confirmPassword?.message}
//           />

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="register-button"
//           >
//             {isSubmitting ? "Creating account..." : "Sign Up"}
//           </button>
//         </form>

//         <p className="register-footer">
//           Already have an account?{" "}
//           <Link to="/login" className="register-link">
//             Sign in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }



















import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { type AxiosError } from "axios";
import { useState } from "react";
import InputField from "../../../components/Inputfield";
import PasswordField from "../../../components/Passwordfield";
import { registerUser } from "../../../api/authAction/userAuth";
import "./css/Register.css";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

interface ErrorResponse {
  success: boolean;
  message?: string;
  errors?: Array<{ msg: string; path: string }>;
}

export default function Register() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      const { name, email, password } = data;
      const res = await registerUser({ name, email, password });

      if (res.success) {
        toast.success(res.message || "OTP sent successfully!");
        // Navigate to OTP verification page with email state
        navigate("/verify-otp", { 
          state: { 
            email: res.data?.email || email,
            expiresIn: res.data?.expiresIn || 60 
          } 
        });
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      
      if (err.response?.data) {
        const responseData = err.response.data;
        
        if (responseData.errors && Array.isArray(responseData.errors)) {
          responseData.errors.forEach((validationErr) => {
            toast.error(validationErr.msg);
          });
        } else if (responseData.message) {
          toast.error(responseData.message);
        } else {
          toast.error("Registration failed. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">TSK</h1>
          <p className="register-subtitle">
            Create your account to start managing tasks
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <InputField
            label="Full Name"
            id="name"
            type="text"
            placeholder="John Doe"
            {...register("name")}
            error={errors.name?.message}
          />

          <InputField
            label="Email Address"
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={errors.email?.message}
          />

          <PasswordField
            label="Password"
            id="password"
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
          />

          <PasswordField
            label="Confirm Password"
            id="confirmPassword"
            placeholder="••••••••"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="register-button"
          >
            {isSubmitting ? "Sending OTP..." : "Sign Up"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account?{" "}
          <Link to="/login" className="register-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}