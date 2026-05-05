import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, CheckCircle2, BookOpen, Award, Globe } from "lucide-react";

const features = [
  { icon: BookOpen, title: "University Placement", desc: "Get matched with universities in the UK, Canada, USA, Germany and Australia." },
  { icon: Award, title: "Scholarship Guidance", desc: "Discover funding opportunities and apply with a competitive profile." },
  { icon: Globe, title: "Student Visa Support", desc: "Document review, financial proof preparation and interview coaching." },
];

const StudyAbroad = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main>
      <PageHero
        badge="Study Abroad"
        title="Your global education journey starts here"
        description="From university selection to visa approval, we walk with you every step of the way."
      />
      <section className="container py-16 grid gap-8 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-semibold text-card-foreground">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>
      <section className="container pb-20">
        <div className="rounded-2xl bg-primary text-primary-foreground p-10 text-center">
          <GraduationCap className="w-10 h-10 mx-auto text-accent" />
          <h2 className="mt-4 font-display text-3xl font-bold">Ready to study abroad?</h2>
          <p className="mt-2 text-primary-foreground/80">Book a free consultation with our education advisors.</p>
          <Button variant="hero" size="lg" className="mt-6" asChild>
            <Link to="/consultation">Book Consultation</Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default StudyAbroad;
