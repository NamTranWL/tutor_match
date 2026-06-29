"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Result, Button, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { sendRequest } from "@/shared/utils/api";

type ActivationState = "loading" | "success" | "error";

export default function ActivatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ActivationState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  
  const code = searchParams.get("code");

  useEffect(() => {
    const activateAccount = async () => {
      if (!code) {
        setState("error");
        setErrorMessage("Activation code is missing");
        return;
      }

      try {
        const res = await sendRequest<IBackendRes<any>>({
          method: "GET",
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/activate`,
          queryParams: { code },
        });

        if (res.statusCode === 200 || res.statusCode === 201) {
          setState("success");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setState("error");
          setErrorMessage(res.message || "Failed to activate account");
        }
      } catch (error) {
        setState("error");
        setErrorMessage("An unexpected error occurred");
      }
    };

    activateAccount();
  }, [code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8">
        {state === "loading" && (
          <div className="text-center">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
            <h2 className="mt-4 text-xl font-semibold">
              Activating your account...
            </h2>
            <p className="mt-2 text-gray-600">Please wait a moment</p>
          </div>
        )}

        {state === "success" && (
          <Result
            status="success"
            title="Account Activated Successfully!"
            subTitle="Your account has been activated. You will be redirected to the login page in 3 seconds."
            extra={[
              <Button
                type="primary"
                key="login"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </Button>,
            ]}
          />
        )}

        {state === "error" && (
          <Result
            status="success"
            title="Activation Successfully"
            subTitle={errorMessage || "Your account has been activated."}
            extra={[
              <Button
                type="primary"
                key="login"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </Button>,
              <Button key="register" onClick={() => router.push("/register")}>
                Register Again
              </Button>,
            ]}
          />
        )}
      </div>
    </div>
  );
}
