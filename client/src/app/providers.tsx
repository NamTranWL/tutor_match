"use client";

import "@ant-design/v5-patch-for-react-19";

import { SessionProvider } from "next-auth/react";
import { ConfigProvider, theme, App } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { setAccessToken } from "@/shared/stored/authToken";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {},
          }}
        >
          <App>
            <AccessTokenSync />
            {children}
          </App>
        </ConfigProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

function AccessTokenSync() {
  const { data } = useSession();
  useEffect(() => {
    const token = (data?.user as unknown as { access_token?: string } | undefined)?.access_token ?? null;
    setAccessToken(token);
  }, [data]);
  return null;
}
