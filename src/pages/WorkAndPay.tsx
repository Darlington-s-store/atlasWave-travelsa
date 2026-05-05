import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, CheckCircle2, DollarSign, Plane, ShieldCheck } from "lucide-react";

const benefits = [
  "Verified employer placements in Canada and Europe",
  "Salary advance options to ease relocation",
  "Work-permit, accommodation and travel arranged",
  "Pre-departure training and ongoing support",
];

const WorkAndPay = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main>
      <PageHero
        eyebrow="Work & Pay"
        title="Skilled-worker placement made simple"
        description="Earn while you settle. We handle the placement, the paperwork and the journey."
      />
      <section className="container py-16 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">How it works</h2>
          <ul className="mt-6 space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" /> {b}
              </li>
            ))}
          </ul>
          <Button variant="accent" size="lg" className="mt-8" asChild>
            <Link to="/visa-application">Apply Now</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Briefcase, label: "Placement" },
            { icon: DollarSign, label: "Salary advance" },
            { icon: Plane, label: "Travel" },
            { icon: ShieldCheck, label: "Support" },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border bg-card p-6 text-center">
              <c.icon className="w-8 h-8 mx-auto text-accent" />
              <p className="mt-3 font-semibold text-card-foreground">{c.label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default WorkAndPay;
