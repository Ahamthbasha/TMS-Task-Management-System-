// src/pages/auth/Register.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { type AxiosError } from "axios";
import InputField from "../../../components/Inputfield";
import PasswordField from "../../../components/Passwordfield";
import { registerUser } from "../../../api/authAction/userAuth";

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

interface ValidationError {
  msg: string;
  path: string;
}

interface ErrorResponse {
  success: boolean;
  message?: string;
  errors?: ValidationError[];
}

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const { name, email, password } = data;
      const res = await registerUser({ name, email, password });

      if (res.success) {
        toast.success(res.message || "Account created successfully! Please login to continue.");
        navigate("/login");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;

      if (err.response?.data) {
        const responseData = err.response.data;

        // Check if there are validation errors array
        if (responseData.errors && Array.isArray(responseData.errors)) {
          // Show each validation error
          responseData.errors.forEach((validationErr, index) => {
            toast.error(validationErr.msg, {
              toastId: `error-${validationErr.path}-${index}`,
            });
          });
        } else if (responseData.message) {
          // Show the general error message if no specific errors array
          toast.error(responseData.message);
        } else {
          // Fallback error message
          toast.error("Registration failed. Please try again.");
        }
      } else {
        // Network or other errors
        toast.error("Network error. Please check your connection and try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">TSK</h1>
          <p className="mt-2 text-gray-600">Create your account to start managing tasks</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}