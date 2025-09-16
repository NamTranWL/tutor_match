"use client";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { Button, Col, Divider, Form, Input, Row } from "antd";
import { signIn } from "next-auth/react";
import { authenticate } from "@/utils/actions";

const onFinish = async (values: any) => {
  console.log("Success:", values);
  const { email, password } = values;
  const res = await authenticate(email, password);
  console.log(">>> check res: ", res);
  // await signIn("credentials", {
  //   email,
  //   password,
  //   redirect: false,
  //   callbackUrl: "/",
  // });
};

const LoginComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Email login", { email, password });
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
  };

  const handleFacebookLogin = () => {
    console.log("Facebook login clicked");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
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
            name="basic"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <div className="relative">
              <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                ]}
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
                />
              </Form.Item>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
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

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-accent transition duration-300"
            >
              Sign in
            </button>
          </Form>

          <p className="text-center text-foreground">
            Don't have an account?
            <button className="ml-1 text-primary hover:text-accent">
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
