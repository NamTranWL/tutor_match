"use client";

import { Layout } from "antd";

const AdminFooter = () => {
  const { Footer } = Layout;
  return (
    <Footer
      style={{ textAlign: "center" }}
      className="footer p-4 bg-base-200 text-base-content footer-center"
    >
      <div>
        <p>© 2023 MatchTutor. All rights reserved.</p>
      </div>
    </Footer>
  );
};
export default AdminFooter;
