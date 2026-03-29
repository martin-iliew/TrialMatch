import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createServerClient } from "@/lib/supabase/server";
import {
  Caption,
  LandingHero,
  Heading3,
  Heading5,
  Heading7,
  Body,
  BodySmall,
} from "@/components/ui/typography";
import { ClipboardList, Cpu, Handshake, ArrowUpRight } from "lucide-react";

function isCRORole(role: string | undefined) {
  return role === "cro";
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-primary bg-surface-level-1 px-5 py-4 sm:flex-col sm:items-center sm:gap-1 sm:px-6 sm:py-5">
      <Heading5 className="shrink-0 text-brand sm:text-center">
        {value}
      </Heading5>
      <Caption className="text-secondary sm:text-center">{label}</Caption>
    </div>
  );
}

function StepCard({
  icon,
  title,
  description,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex min-h-56 flex-col justify-between rounded-2xl border border-primary bg-surface-level-1 p-6 transition-all duration-300 ease-out hover:scale-[1.05] hover:bg-surface-level-2 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <Heading7>{title}</Heading7>
        <div className="relative h-8 w-8 shrink-0">
          <div className="absolute inset-0 flex items-center justify-center text-icon-secondary transition-opacity duration-200 group-hover:opacity-0">
            {icon}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-level-0">
              <ArrowUpRight className="size-4 text-primary" />
            </div>
          </div>
        </div>
      </div>
      <BodySmall className="text-secondary">{description}</BodySmall>
    </div>
  );
}

export default async function Home() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string | undefined;

  const dashboardHref = isCRORole(role)
    ? "/cro/projects"
    : "/clinic/profile";

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-default px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-6">Clinical Trial Site Matching</Badge>
          <LandingHero className="mb-6">
            {user
              ? "Welcome back to TrialAxis"
              : "Match clinics to trials in minutes, not months"}
          </LandingHero>
          <Body className="mx-auto mb-10 max-w-2xl text-secondary">
            {user
              ? "Pick up where you left off — manage your projects, review matches, and connect with partners."
              : "TrialAxis connects contract research organizations with the best-fit research sites using intelligent, criteria-based matching. Stop relying on spreadsheets and phone calls — find the right clinic, faster."}
          </Body>

          {/* CTA — changes based on auth state */}
          {user ? (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={dashboardHref}>
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register?role=cro">
                <Button size="lg">Join as CRO</Button>
              </Link>
              <Link href="/register?role=clinic_admin">
                <Button variant="outline" size="lg">
                  Register Your Clinic
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-primary bg-subtle px-6 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard value="EUR 500K/day" label="Cost of enrollment delays" />
          <StatCard value="19-25%" label="EU trial slots go unfilled" />
          <StatCard value="EUR 6,500-15,000" label="Per recruited patient" />
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <Heading3 className="mb-3">How It Works</Heading3>
            <Body className="text-secondary">
              Three steps from trial requirements to clinic partnership
            </Body>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StepCard
              step={1}
              icon={<ClipboardList className="size-5" />}
              title="Define Your Trial"
              description="Create a project with therapeutic area, equipment needs, certifications, capacity, and geographic preferences."
            />
            <StepCard
              step={2}
              icon={<Cpu className="size-5" />}
              title="Run Matching"
              description="Our algorithm scores every registered clinic across five dimensions and ranks them by fit."
            />
            <StepCard
              step={3}
              icon={<Handshake className="size-5" />}
              title="Connect & Partner"
              description="Review detailed score breakdowns, view clinic profiles, and send partnership inquiries directly."
            />
          </div>
        </div>
      </section>

      {/* For Clinics Section — only for visitors */}
      {!user && (
        <section className="border-t border-primary bg-subtle px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Heading3 className="mb-3">For Clinics</Heading3>
            <Body className="mb-8 text-secondary">
              Register your site, showcase your capabilities, and get matched
              with relevant trials automatically. No cold outreach — CRO teams
              come to you.
            </Body>
            <Link href="/register?role=clinic_admin">
              <Button variant="outline" size="lg">
                Register Your Clinic
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Browse CTA — only for visitors */}
      {!user && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <Heading5 className="mb-3">Explore the Network</Heading5>
            <BodySmall className="mb-6 text-secondary">
              Browse registered clinics across Bulgaria and Europe to see the
              growing TrialAxis network.
            </BodySmall>
            <Link href="/clinics">
              <Button variant="outline">Browse Clinics</Button>
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
