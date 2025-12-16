"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/datePicker";
import { Dropdown } from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ContainerLayout from "@/layout/ContainerLayout";
import {
  ChevronLeft,
  Phone,
  Mail,
  Laptop,
  Tablet,
  LogOut,
  CheckCircle,
} from "lucide-react";
import { MdAccountBalanceWallet } from "react-icons/md";
import { HiMiniArrowUpRight } from "react-icons/hi2";
import { toast } from "react-toastify";
import { format } from "date-fns";

import {
  getMyProfile,
  getMyWallet,
  updateMyProfile,
} from "@/services/user.service";
import { getMyDevices, revokeDevice } from "@/services/Auth";

interface Device {
  deviceId: string;
  userAgent: string;
  createdAt: string;
  platform?: string;
  browser?: string;
}

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);

  const currentDeviceId =
    typeof window !== "undefined" ? localStorage.getItem("deviceId") : null;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
  });

  const [originalData, setOriginalData] = useState(formData);

  // ---------------------------------------------------------
  // Load Profile + Wallet + Devices
  // ---------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [user, wal, deviceList] = await Promise.all([
          getMyProfile(),
          getMyWallet(),
          getMyDevices(),
        ]);

        setProfile(user);
        setWallet(wal);
        setDevices(deviceList || []);

        const initialForm = {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          gender: user.gender || "",
          dob: user.dob ? user.dob.split("T")[0] : "",
        };

        setFormData(initialForm);
        setOriginalData(initialForm);
      } catch (err: any) {
        toast.error(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
        setLoadingDevices(false);
      }
    };

    loadData();
  }, []);

  // Track form changes
  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [formData, originalData]);

  // ---------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setSaving(true);
    try {
      const payload: any = {
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        gender: formData.gender || undefined,
      };

      // Only include dob if it's actually filled
      if (formData.dob) {
        payload.dob = new Date(`${formData.dob}T00:00:00`).toISOString();
      }

      const updated = await updateMyProfile(payload);

      setProfile((prev: any) => ({ ...prev, ...updated }));
      setOriginalData(formData);
      setHasChanges(false);

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeviceRevoke = async (deviceId: string) => {
    if (!confirm("Revoke this device? It will be logged out immediately."))
      return;

    try {
      await revokeDevice(deviceId);
      toast.success("Device revoked successfully");
      setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke device");
    }
  };

  const getDeviceIcon = (ua: string) => {
    ua = ua.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    )
      return <Phone className="w-5 h-5" />;
    if (ua.includes("tablet") || ua.includes("ipad"))
      return <Tablet className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
  };

  // ---------------------------------------------------------
  // Loading Skeleton
  // ---------------------------------------------------------
  if (loading) {
    return (
      <ContainerLayout>
        <div className="p-6 max-w-5xl mx-auto">
          <Skeleton className="h-8 w-32 mb-8" />
          <Card>
            <CardContent className="p-8 space-y-8">
              <div className="flex gap-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="space-y-4 flex-1">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ContainerLayout>
    );
  }

  return (
    <ContainerLayout className=" px-3">
      <div className="max-w-5xl mx-auto p-2 md:p-6">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </Link>

        <div className="space-y-10">
          {/* Profile Header */}
          <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="py-6 bg-linear-to-r from-primary/10 via-white to-transparent">
              <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-6">
                {/* Avatar + Basic Info */}
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary shadow-inner uppercase">
                    {profile?.firstName?.[0]}
                    {profile?.lastName?.[0]}
                  </div>

                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                      {profile?.firstName} {profile?.lastName}
                    </h1>

                    <p className="text-gray-600 flex items-center gap-2 mt-2">
                      <Phone className="w-4 h-4" />
                      {profile?.phone}
                    </p>

                    {profile?.email && (
                      <p className="text-gray-500 flex items-center gap-2 mt-1 text-sm">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Wallet */}
                {wallet?.exists && (
                  <div className="px-6 py-4 bg-primary/5 border border-primary/20 rounded-xl shadow-sm flex items-center gap-4">
                    <MdAccountBalanceWallet className="text-primary w-10 h-10" />
                    <div>
                      <p className="text-sm text-gray-600">Wallet Balance</p>
                      <p className="text-2xl font-semibold text-primary">
                        RM {wallet?.availableBalance?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            {/* Body */}
            <CardContent className="pt-8 space-y-12">
              {/* PERSONAL INFO */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Personal Information
                  </h2>
                  {hasChanges && (
                    <Badge variant="secondary" className="text-sm">
                      Unsaved Changes
                    </Badge>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="mt-2"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="mt-2"
                      placeholder="Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <Dropdown
                      value={formData.gender}
                      onChange={handleGenderChange}
                      options={[
                        { value: "", label: "Prefer not to say" },
                        { value: "MALE", label: "Male" },
                        { value: "FEMALE", label: "Female" },
                        { value: "OTHER", label: "Other" },
                      ]}
                      placeholder="Select gender"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <DatePicker
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>
                </div>
              </section>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="flex-1 h-12 text-lg font-medium"
                >
                  {saving ? "Saving changes…" : "Save Changes"}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="flex-1 h-12 text-lg"
                >
                  <Link
                    href={`/${profile?.role?.toLowerCase()}/dashboard`}
                    className="flex justify-center items-center gap-2"
                  >
                    Go to Dashboard
                    <HiMiniArrowUpRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>

              <Separator />

              {/* ACTIVE SESSIONS */}
              <section>
                <h2 className="text-xl font-semibold mb-6 text-gray-900">
                  Active Sessions
                </h2>

                {loadingDevices ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                  </div>
                ) : devices.length === 0 ? (
                  <p className="text-gray-500 text-center py-10">
                    No active sessions found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {devices.map((d) => {
                      const isCurrent = d.deviceId === currentDeviceId;

                      return (
                        <div
                          key={d.deviceId}
                          className={`flex items-center justify-between p-5 rounded-xl border shadow-sm transition ${
                            isCurrent
                              ? "bg-emerald-50 border-emerald-300"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-lg ${
                                isCurrent ? "bg-emerald-100" : "bg-gray-200"
                              }`}
                            >
                              {getDeviceIcon(d.userAgent)}
                            </div>

                            <div>
                              <p className="font-medium text-gray-900">
                                {d.userAgent || "Unknown Device"}
                              </p>

                              <p className="text-sm text-gray-500">
                                {format(
                                  new Date(d.createdAt),
                                  "dd MMM yyyy, HH:mm"
                                )}
                                {isCurrent && (
                                  <span className="ml-2 text-emerald-700 font-medium">
                                    • This device
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {isCurrent ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-600 text-emerald-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Current
                            </Badge>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeviceRevoke(d.deviceId)}
                              className="flex items-center gap-2"
                            >
                              <LogOut className="w-4 h-4" />
                              Revoke
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContainerLayout>
  );
};

export default Page;
