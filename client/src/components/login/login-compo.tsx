"use client";

import { useEffect, useMemo } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Form, Input, Button, notification } from "antd";
import { authenticate } from "@/utils/actions";

const roleHome = (role?: string) => {
  switch (role) {
    case "admin":
      return "/admin";
    case "tutor":
      return "/tutor";
    case "parent":
      return "/parent";
    default:
      return "/";
  }
};

const sanitizeCallback = (cb?: string | null) => {
  if (!cb) return null;
  try {
    if (cb.startsWith("/login") || cb.startsWith("/register")) return null;
    if (typeof window !== "undefined" && cb.startsWith("http")) {
      const u = new URL(cb);
      if (u.origin !== window.location.origin) return null;
      if (u.pathname === "/login" || u.pathname === "/register") return null;
      return u.pathname + u.search + u.hash;
    }
    return cb;
  } catch {
    return null;
  }
};

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  const rawCallbackUrl = search.get("callbackUrl");
  const callbackUrl = useMemo(
    () => sanitizeCallback(rawCallbackUrl) ?? null,
    [rawCallbackUrl]
  );

  const { status } = useSession();

  // ✅ Khi session đã sẵn sàng → để server quyết định role ở /after-login
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl ?? "/after-login");
    }
  }, [status, callbackUrl, router]);

  const onFinish = async (values: any) => {
    const { email, password } = values;
    const res = await authenticate(email, password);

    if (res.code === 1) {
      form.setFields([
        { name: "password", errors: ["Sai email hoặc mật khẩu"] },
      ]);
    } else if (res.code === 2) {
      form.setFields([
        { name: "email", errors: ["Tài khoản chưa được kích hoạt"] },
      ]);
    } else {
      // ✅ Thành công → giao cho server redirect theo role
      router.replace(callbackUrl ?? "/after-login");
      return;
    }

    api.error({
      message: "Đăng nhập không thành công",
      description: `${res.error}`,
      placement: "topRight",
      duration: 3,
    });
  };

  const onFinishFailed = () => {
    api.warning({
      message: "Thiếu thông tin",
      description: "Vui lòng điền đầy đủ email và mật khẩu.",
      placement: "topRight",
      duration: 2.5,
    });
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: callbackUrl ?? "/", redirect: true });
  };

  const handleFacebookLogin = async () => {
    await signIn("facebook", {
      callbackUrl: callbackUrl ?? "/",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {contextHolder}
      <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-foreground mb-6">
          Welcome Back
        </h2>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 border border-border rounded-lg hover:bg-secondary transition duration-300"
          >
            <FcGoogle className="text-2xl" />
            <span className="text-foreground">Continue with Google</span>
          </button>

          <button
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 bg-[#1877F2] text-white rounded-lg hover:bg-[#1666d3] transition duration-300"
          >
            <FaFacebook className="text-2xl" />
            <span>Continue with Facebook</span>
          </button>

          <div className="flex items-center">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-muted-foreground">Or</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          <Form
            form={form}
            name="login"
            layout="vertical"
            autoComplete="off"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <div className="relative">
              <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  type="email"
                  placeholder="Email address"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
                  required
                />
              </Form.Item>
            </div>

            <div className="relative">
              <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-ring"
                />
                <span className="text-foreground">Remember me</span>
              </label>
              <button type="button" className="text-primary hover:text-accent">
                Forgot password?
              </button>
            </div>

            <Button
              htmlType="submit"
              type="primary"
              className="w-full py-2.5 mt-2 rounded-lg"
            >
              Sign in
            </Button>
          </Form>

          <p className="text-center text-foreground">
            Don&apos;t have an account?
            <button
              className="ml-1 text-primary hover:text-accent"
              onClick={() =>
                router.push(
                  `/register${
                    callbackUrl
                      ? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
                      : ""
                  }`
                )
              }
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
