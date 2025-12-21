"use client";
export const dynamic = "force-dynamic";
import React, { Suspense } from "react";
import LoginComponent from "@/shared/components/login/LoginCompo";

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}> 
      <LoginComponent />
    </Suspense>
  );
}
