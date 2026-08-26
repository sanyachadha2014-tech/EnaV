import GovHeader from "../../components/gov/GovHeader";

export default function GovLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <GovHeader />
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}