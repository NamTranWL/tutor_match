import { Spin } from "antd";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[200px] gap-4">
      <Spin size="large" />
      <span className="text-gray-500 font-medium">Loading dashboard...</span>
    </div>
  );
}
