"use client";

import React, { useState } from "react";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import AdminFooter from "@/components/layout/admin.footer";
import AdminHeader from "@/components/layout/admin.header";
import AdminSidebar from "@/components/layout/admin.sidebar";

const { Header, Content, Footer, Sider } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSidebar />
      <Layout>
        <AdminHeader />
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[{ title: "User" }, { title: "Bill" }]}
          />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            Bill is a cat.
          </div>
        </Content>
        <AdminFooter />
      </Layout>
    </Layout>
  );
};

export default App;
