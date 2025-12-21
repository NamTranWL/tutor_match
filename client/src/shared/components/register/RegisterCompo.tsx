// RegisterCompo.tsx
"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import {
  Form,
  Input,
  Checkbox,
  Button,
  Divider,
  Typography,
  Radio,
} from "antd";
import { message as antdMessage } from "antd";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BsShieldLockFill } from "react-icons/bs";
import { handleCreateUserAction } from "@/shared/services/actions/actions";
import { useRouter, useSearchParams } from "next/navigation";

const { Title, Text, Link } = Typography;

type Toast = { type: "success" | "error"; content: string } | null;

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

const SignUpPage: React.FC = () => {
  const router = useRouter();
  const search = useSearchParams();
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [toast, setToast] = useState<Toast>(null);

  const rawCallbackUrl = search.get("callbackUrl");
  const callbackUrl = useMemo(
    () => sanitizeCallback(rawCallbackUrl) ?? null,
    [rawCallbackUrl]
  );

  useEffect(() => {
    if (!toast) return;
    if (toast.type === "success") messageApi.success(toast.content);
    else messageApi.error(toast.content);
  }, [toast, messageApi]);

  const validatePassword = (_: any, value: string) => {
    if (!value) return Promise.reject(new Error("Please enter your password"));
    const okLen = value.length >= 8;
    const okUpper = /[A-Z]/.test(value);
    const okNum = /[0-9]/.test(value);
    const okSpecial = /[!@#$%^&*]/.test(value);
    if (okLen && okUpper && okNum && okSpecial) return Promise.resolve();
    return Promise.reject(
      new Error(
        "Password must be ≥ 8 chars & include uppercase, number, special."
      )
    );
  };

  const onFinish = (values: any) => {
    const { firstName, lastName, email, password, role } = values;
    const payload = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      password,
      role,
    };

    startTransition(async () => {
      try {
        const res = await handleCreateUserAction(payload);
        if ((res as any)?.data || (res as any)?.success) {
          setToast({ type: "success", content: "Account created" });
          form.resetFields();
        } else {
          setToast({
            type: "error",
            content: (res as any)?.message || "Failed to create account",
          });
        }
      } catch {
        setToast({ type: "error", content: "Failed to create account" });
      }
    });
  };

  const onFinishFailed = () => {
    setToast({
      type: "error",
      content: "Please fix the errors before submitting.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {contextHolder}

      <div className="w-full md:w-1/2 p-8 md:p-12 items-center justify-center bg-gray-50">
        <div className="text-center">
          <Title level={2} className="!mb-1">
            Create your account
          </Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{ rememberMe: false, termsAccepted: false }}
          validateTrigger={["onBlur", "onSubmit"]}
          requiredMark={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[
                { required: true, message: "Please enter your first name" },
              ]}
            >
              <Input placeholder="John" />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[
                { required: true, message: "Please enter your last name" },
              ]}
            >
              <Input placeholder="Doe" />
            </Form.Item>
          </div>

          <Form.Item
            label="Corporate Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
            hasFeedback
          >
            <Input placeholder="you@company.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ validator: validatePassword }]}
            hasFeedback
            extra={
              <div className="text-xs text-gray-500">
                Must include: uppercase, number, special character.
              </div>
            }
          >
            <Input.Password
              placeholder="••••••••"
              iconRender={(visible) =>
                visible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />
              }
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value)
                    return Promise.resolve();
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="••••••••"
              iconRender={(visible) =>
                visible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />
              }
            />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Radio.Group>
              <Radio value="parent">Parent</Radio>
              <Radio value="tutor">Tutor</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="rememberMe"
            valuePropName="checked"
            className="!mb-2"
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item
            name="termsAccepted"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("Please accept the Terms & Privacy")
                      ),
              },
            ]}
          >
            <Checkbox>
              I agree to the{" "}
              <Link href="#" className="!text-blue-600">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="!text-blue-600">
                Privacy Policy
              </Link>
            </Checkbox>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={isPending}
          >
            Sign up
          </Button>

          <Divider plain>Or continue with</Divider>

          <Button block size="large" disabled={isPending}>
            <span className="inline-flex items-center gap-2">
              <FcGoogle className="text-xl" />
              Sign up with Google
            </span>
          </Button>
          <div className="mt-4 text-center ">
            <Text style={{ fontSize: 24 }} type="secondary">
              Already have an account?{" "}
              <Button
                type="link"
                size="large"
                style={{ height: 56, paddingInline: 24, fontSize: 24 }}
                onClick={() =>
                  router.push(
                    `/login${
                      callbackUrl
                        ? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
                        : ""
                    }`
                  )
                }
              >
                Sign In
              </Button>
            </Text>
          </div>
        </Form>
      </div>
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
              <BsShieldLockFill className="text-3xl" />
              <span className="text-lg">Secure, Simple, Smart</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
