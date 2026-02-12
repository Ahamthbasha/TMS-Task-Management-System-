// src/pages/auth/Login.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { type AxiosError } from "axios";
import { useDispatch } from "react-redux";
import InputField from "../../../components/Inputfield"; 
import PasswordField from "../../../components/Passwordfield"; 
import { login } from "../../../api/authAction/userAuth";
import { setUser } from "../../../redux/slices/userSlice";
import "./css/Login.css";

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

        if (responseData.errors && Array.isArray(responseData.errors)) {
          responseData.errors.forEach((validationErr, index) => {
            toast.error(validationErr.msg, {
              toastId: `error-${validationErr.path}-${index}`,
            });
          });
        } else if (responseData.message) {
          toast.error(responseData.message);
        } else {
          toast.error("Login failed. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection and try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">TSK</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
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
            className="login-button"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account?{" "}
          <Link to="/register" className="login-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}