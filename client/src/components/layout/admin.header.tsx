// src/components/layout/admin.header.tsx
export default function AdminHeader() {
  return (
    <header
      style={{
        padding: 0,
        background: "#ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div className="px-4 font-semibold">TutorMatch</div>
      <div className="px-4" />
    </header>
  );
}
