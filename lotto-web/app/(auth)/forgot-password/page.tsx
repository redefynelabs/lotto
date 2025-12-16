"use client";

import { useState, FormEvent } from "react";
import ContainerLayout from "@/layout/ContainerLayout";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { sendForgotOtp, verifyForgotOtp, resetPassword } from "@/services/Auth";
import { Poster } from "@/components/Reusable/Images";
import Image from "next/image";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
    newPassword: "",
  });

  const [resetToken, setResetToken] = useState("");

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ------------------------
  // STEP 1: Send OTP
  // ------------------------
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.phone.trim().length !== 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      await sendForgotOtp({ phone: formData.phone });
      toast.success("OTP sent to phone");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // STEP 2: Verify OTP
  // ------------------------
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.otp.trim()) {
      toast.error("Enter OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyForgotOtp({
        phone: formData.phone,
        otp: formData.otp,
      });

      setResetToken(res.resetToken);
      setStep(3);
      toast.success("OTP verified! Enter new password");
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // STEP 3: Reset Password
  // ------------------------
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        resetToken,
        newPassword: formData.newPassword,
      });

      toast.success("Password updated successfully!");
      window.location.href = "/sign-in";
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContainerLayout>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 py-10">
        
        {/* Left Side Poster */}
        <div className="flex justify-center items-center w-full lg:w-auto">
          <Image
            src={Poster}
            alt="Poster"
            width={420}
            height={500}
            className="rounded-2xl shadow-md object-cover max-w-[350px] sm:max-w-[400px] lg:max-w-[420px]"
          />
        </div>

        {/* Right Side Form */}
        <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Forgot Password
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Reset your account password
          </p>

          {/* STEP 1: Phone */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                name="phone"
                label="Phone Number"
                placeholder="9*********"
                maxLength={10}
                value={formData.phone}
                onChange={handleChange}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2.5 rounded-md font-semibold"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Input
                name="otp"
                label="Enter OTP"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleChange}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2.5 rounded-md font-semibold"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {/* STEP 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                type="password"
                name="newPassword"
                label="New Password"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2.5 rounded-md font-semibold"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </ContainerLayout>
  );
};

export default ForgotPasswordPage;
