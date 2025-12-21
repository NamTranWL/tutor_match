'use client';

import { useEffect, useMemo, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Form, Input, Button, notification } from "antd";
import { authenticate } from "@/shared/services/actions/actions";

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
  const [needActivation, setNeedActivation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const rawCallbackUrl = search.get("callbackUrl");
  const callbackUrl = useMemo(
    () => sanitizeCallback(rawCallbackUrl) ?? null,
    [rawCallbackUrl]
  );

  const { status } = useSession();
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl ?? "/dashboard");
    }
  }, [status, callbackUrl, router]);

  const handleResend = async () => {
    const email = form.getFieldValue("email");
    if (!email) {
      form.setFields([
        { name: "email", errors: ["Vui lòng nhập email trước."] },
      ]);
      return;
    }
    setResendLoading(true);
    try {
      const res = await fetch("/api/resend-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        api.success({
          message: "Đã gửi lại email kích hoạt",
          description: `Địa chỉ: ${email}`,
          placement: "topRight",
          duration: 3,
        });
        setNeedActivation(false);
        form.setFields([{ name: "email", errors: [] }]);
      } else {
        api.error({
          message: "Gửi lại kích hoạt thất bại",
          description: data?.message || "Vui lòng thử lại",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch {
      api.error({
        message: "Lỗi mạng",
        description: "Không thể gửi lại kích hoạt",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setResendLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    const { email, password } = values;
    const res = await authenticate(email, password);

    if (res.code === 1) {
      form.setFields([
        { name: "password", errors: ["Sai email hoặc mật khẩu"] },
      ]);
      api.error({
        message: "Đăng nhập không thành công",
        description: `${res.error}`,
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    if (res.code === 2) {
      setNeedActivation(true);
      form.setFields([
        {
          name: "email",
          errors: ["Tài khoản chưa được kích hoạt. Vui lòng kích hoạt tại"],
        },
      ]);
      api.warning({
        message: "Tài khoản chưa kích hoạt",
        description: "Vui lòng bấm “tại đây” để gửi lại email kích hoạt.",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    router.replace(callbackUrl ?? "/dashboard");
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
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-3/4 relative">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/3861966/pexels-photo-3861966.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-12 flex flex-col justify-center items-center text-white">
          <div className="max-w-md">
            <img
              src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?fit=crop&w=200&h=200"
              alt="Company Logo"
              className="w-32 h-32 mb-8"
            />
            <h1 className="text-4xl font-bold mb-6">Welcome to TutorFinder</h1>
            <p className="text-xl mb-8">
              Find your compatible tutor and join our community of innovators
              and start your journey with us today.
            </p>
            <div className="flex items-center space-x-4 mb-8">
              <span className="text-lg">Secure, Simple, Smart</span>
            </div>
          </div>
        </div>
      </div>
      {contextHolder}
      <div className="w-full min-h-screen md:w-1/2 p-8 md:p-12 items-center justify-center bg-gray-50">
        <h2 className="text-4xl font-bold text-center text-foreground mb-6">
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
            className="space-y-10"
            autoComplete="off"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <div className="relative">
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
                validateTrigger="onBlur"
                help={
                  needActivation ? (
                    <span>
                      Tài khoản chưa được kích hoạt. Vui lòng kích hoạt{" "}
                      <Button
                        type="link"
                        onClick={handleResend}
                        loading={resendLoading}
                        className="p-0 h-auto align-baseline"
                      >
                        tại đây
                      </Button>
                      .
                    </span>
                  ) : null
                }
              >
                <Input
                  type="email"
                  size="large"
                  placeholder="Email address"
                  prefix={<MdEmail className="text-muted-foreground mr-1" />}
                  className="w-full h-12 pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
                  required
                />
              </Form.Item>
            </div>

            <div className="relative">
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                  {
                    min: 8,
                    message: "Password must be at least 8 characters!",
                  },
                ]}
                validateTrigger="onBlur"
              >
                <Input.Password
                  placeholder="Password"
                  size="large"
                  prefix={
                    <RiLockPasswordLine className="text-muted-foreground mr-1" />
                  }
                  className="w-full h-12 pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
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

          <p className="text-center text-2xl mt-5 text-foreground">
            Don&apos;t have an account?
            <Button
              type="link"
              size="large"
              style={{ height: 56, paddingInline: 24, fontSize: 24 }}
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
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
