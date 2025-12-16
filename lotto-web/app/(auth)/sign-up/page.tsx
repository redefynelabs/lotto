"use client";

import { Poster } from "@/components/Reusable/Images";
import { DatePicker } from "@/components/ui/datePicker";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import React, { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown";
import { register, verifyOTP } from "@/services/Auth";
import { toast } from "react-toastify";

import { Eye, EyeOff, Info } from "lucide-react";
import { FaArrowLeft } from "react-icons/fa6";
import Link from "next/link";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  password: string;
  confirmPassword: string;
  otp: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
}

const Page = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);

  // -----------------------------------
  // VALIDATION
  // -----------------------------------
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email";
      isValid = false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
      isValid = false;
    }

    if (!formData.gender.trim()) {
      newErrors.gender = "Gender is required";
      isValid = false;
    }

    if (!formData.dob.trim()) {
      newErrors.dob = "Date of birth is required";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
      isValid = false;
    } else if (formData.password.length > 32) {
      newErrors.password = "Maximum 32 characters allowed";
      isValid = false;
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // -----------------------------------
  // REGISTER
  // -----------------------------------
  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      dob: formData.dob,
      gender: formData.gender.toUpperCase(),
    };

    try {
      const res = await register(payload);
      setUserId(res.userId);
      toast.success("OTP sent successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------------------
  // VERIFY OTP
  // -----------------------------------
  const handleVerifyOTP = async () => {
    if (!formData.otp.trim() || formData.otp.length !== 6) {
      setErrors({ otp: "Enter a valid 6-digit OTP" });
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyOTP({ userId, otp: formData.otp });
      toast.success("Account created successfully!");
      window.location.href = "/sign-in";
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------------------
  // HANDLE INPUT
  // -----------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // -----------------------------------
  // UI
  // -----------------------------------

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center h-screen overflow-hidden px-4">
      {/* LEFT POSTER */}
      <div className="hidden lg:flex sticky top-0 justify-center items-center mr-8">
        <Image
          src={Poster}
          alt="Signup Poster"
          width={420}
          height={500}
          className="rounded-2xl shadow-md object-cover"
          priority
        />
      </div>

      <Link
        href="/"
        className="flex items-center gap-2 text-primary hover:underline absolute left-12 top-8"
      >
        <FaArrowLeft  className="w-5 h-5" />
        Back to Home
      </Link>

      {/* FORM */}
      <div className="w-full max-w-lg px-10 space-y-6 overflow-y-auto max-h-screen py-10">
        {/* HEADER + HOME BUTTON */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Agent Signup</h1>
        </div>

        {/* STEP 1: FORM */}
        {!userId && (
          <>
            {/* NAME */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  name="firstName"
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Input
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <Input
                name="email"
                type="email"
                label="Email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <Input
                name="phone"
                label="Phone Number"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                inputMode="numeric"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone}</p>
              )}
            </div>

            {/* GENDER */}
            <div>
              <Dropdown
                label="Gender"
                value={formData.gender}
                onChange={(v) => setFormData({ ...formData, gender: v })}
                placeholder="Select Gender"
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
                className={errors.gender ? "border-red-500" : ""}
              />
              {errors.gender && (
                <p className="text-red-500 text-xs">{errors.gender}</p>
              )}
            </div>

            {/* DOB */}
            <div>
              <DatePicker
                name="dob"
                label="Date of Birth"
                value={formData.dob}
                onChange={handleChange}
                className={errors.dob ? "border-red-500" : ""}
              />
              {errors.dob && (
                <p className="text-red-500 text-xs">{errors.dob}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                label="Password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500" : ""}
              />

              {/* HINT BUTTON */}
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPasswordHint(!showPasswordHint)}
              >
                <Info className="w-5 h-5 text-gray-500" />
              </button>

              {showPasswordHint && (
                <div className="absolute right-0 mt-1 p-3 bg-white border rounded-lg text-xs shadow-md z-20 w-64">
                  <p className="font-semibold mb-1">Password must:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Minimum 6 characters</li>
                    <li>Maximum 32 characters</li>
                    <li>Include letters & numbers</li>
                  </ul>
                </div>
              )}

              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="button"
              onClick={handleRegister}
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-3 rounded-[4px] font-semibold hover:bg-primary/90 disabled:opacity-50 text-lg"
            >
              {isSubmitting ? "Submitting…" : "Register"}
            </button>
          </>
        )}

        {/* OTP SECTION */}
        {userId && (
          <>
            <div>
              <Input
                name="otp"
                label="Enter OTP"
                placeholder="000000"
                maxLength={6}
                value={formData.otp}
                onChange={handleChange}
                className={errors.otp ? "border-red-500" : ""}
              />
              {errors.otp && (
                <p className="text-red-500 text-xs">{errors.otp}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-3 rounded-[4px] font-semibold hover:bg-primary/90 disabled:opacity-50 text-lg"
            >
              {isSubmitting ? "Verifying…" : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
