"use client";
export const dynamic = "force-dynamic";
import React, { Suspense } from "react";
import RegisterCompo from "@/shared/components/register/RegisterCompo";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div />}>
      <RegisterCompo />
    </Suspense>
  );
}
