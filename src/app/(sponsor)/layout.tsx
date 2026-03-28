import Navbar from "@/components/layout/Navbar"

export default function SponsorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
    </>
  )
}
