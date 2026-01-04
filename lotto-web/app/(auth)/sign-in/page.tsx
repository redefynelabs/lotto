"use client";

import { Poster } from "@/components/Reusable/Images";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/Auth";
import { toast } from "react-toastify";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

const Page = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      toast.success("Login successful!");

      // ✅ Smart redirect (unchanged)
      if (response.user.role === "ADMIN") {
        router.push("/admin");
      } else if (response.user.role === "AGENT") {
        if (response.user.isApproved) {
          router.push("/bid");
        } else {
          router.push("/waiting-approval");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-16 py-10 max-h-screen">
      {/* Left Side - Poster Image */}
      <div className="flex justify-center items-center w-full lg:w-auto mt-4 md:mt-0">
        <Image
          src={Poster}
          alt="Login Poster"
          width={420}
          height={500}
          className="rounded-2xl shadow-md object-cover aspect-square md:aspect-3/4 max-w-[350px] sm:max-w-[400px] lg:max-w-[420px] h-auto"
          priority
        />
      </div>

      <Link
        href="/"
        className="flex items-center gap-2 text-primary hover:underline absolute left-12 top-4 md:top-8"
      >
        <FaArrowLeft className="w-5 h-5" />
        Back to Home
      </Link>

      {/* Right Side - Login Form */}
      <div className="flex flex-col items-start justify-center rounded-2xl w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Login
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mb-6">
          Login using your email address
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex justify-end -mt-2 mb-2">
            <Link
              href="/forgot-password"
              className="text-primary text-sm hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-2.5 rounded-[4px] font-semibold hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="py-4">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-primary">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Page;
