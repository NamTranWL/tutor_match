"use client";

import { SessionProvider } from "next-auth/react";
import { ConfigProvider, theme } from "antd";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {},
        }}
      >
        {children}
      </ConfigProvider>
    </SessionProvider>
  );
}
