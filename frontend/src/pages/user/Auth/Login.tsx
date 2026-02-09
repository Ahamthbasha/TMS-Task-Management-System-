// src/pages/auth/Login.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { type AxiosError } from "axios";
import InputField from "../../../components/Inputfield";
import PasswordField from "../../../components/Passwordfield";
import { login } from "../../../api/authAction/userAuth";
import { useDispatch } from "react-redux";
import { setUser } from "../../../redux/slices/userSlice";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface ValidationError {
  msg: string;
  path: string;
}

interface ErrorResponse {
  success: boolean;
  message?: string;
  errors?: ValidationError[];
}

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await login(data);

      if (res.success) {
        const { user } = res.data;
        
        // Store user in Redux (tokens are in HTTP-only cookies)
        dispatch(
          setUser({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          })
        );
        
        toast.success("Login successful!");
        navigate("/");
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
          // Show the general error message
          toast.error(responseData.message);
        } else {
          // Fallback error message
          toast.error("Login failed. Please try again.");
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
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}