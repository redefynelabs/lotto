import api from "@/lib/api";

interface LoginRequest {
  phone: string;
  password: string;
}

interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  user: {
    id: string;
    role: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    dob: string;
    gender: string;
    isApproved: boolean;
    commissionPct: string;
    isPhoneVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  dob: string;
  gender: string;
}

interface RegisterResponse {
  message: string;
  userId: string;
}

interface VerifyOTPRequest {
  userId: string;
  otp: string;
}

interface VerifyOTPResponse {
  message: string;
}

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const res = await api.post<LoginResponse>("/auth/login", credentials);
    const data = res.data;

    // Save user locally (for UI only)
    localStorage.setItem("user", JSON.stringify(data.user));

    if (data.deviceId) {
      localStorage.setItem("deviceId", data.deviceId);
    }


    return data;
  } catch (err: any) {
    const message = err?.response?.data?.message || "Invalid credentials";
    throw new Error(message);
  }
};

export const register = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  try {
    const res = await api.post("/auth/register", data);
    return res.data;
  } catch (error: any) {
    console.error("Register error response:", error.response?.data);
    throw error;
  }
};

export const verifyOTP = async (
  data: VerifyOTPRequest
): Promise<VerifyOTPResponse> => {
  const res = await api.post("/auth/verify", data);
  return res.data;
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.warn("Logout API failed, clearing locally anyway");
  } finally {
    localStorage.removeItem("user");
    window.location.href = "/sign-in";
  }
};
// ---------------------------
//  FORGOT PASSWORD — SEND OTP
// ---------------------------
export const sendForgotOtp = async (data: { phone: string }) => {
  try {
    const res = await api.post("/auth/forgot-password", data);

    return res.data;
  } catch (err: any) {
    const message =
      err?.response?.data?.message || "Failed to send OTP. Try again.";
    throw new Error(message);
  }
};

// ---------------------------
//  VERIFY OTP FOR RESET
// ---------------------------
export const verifyForgotOtp = async (data: { phone: string; otp: string }) => {
  try {
    const res = await api.post("/auth/forgot-password/verify", data);

    return res.data; // --> { message, resetToken }
  } catch (err: any) {
    const message =
      err?.response?.data?.message || "OTP verification failed.";
    throw new Error(message);
  }
};

// ---------------------------
//  RESET PASSWORD
// ---------------------------
export const resetPassword = async (data: {
  resetToken: string;
  newPassword: string;
}) => {
  try {
    const res = await api.post("/auth/reset-password", data);

    return res.data;
  } catch (err: any) {
    const message =
      err?.response?.data?.message || "Password reset failed.";
    throw new Error(message);
  }
};


export const getMyDevices = async () => {
  const res = await api.get("/auth/devices");
  return res.data;
};

export const revokeDevice = async (deviceId: string) => {
  const res = await api.delete(`/auth/devices/${deviceId}`);
  return res.data;
};