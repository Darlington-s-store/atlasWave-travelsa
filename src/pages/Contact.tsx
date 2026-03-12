import { useMemo, useState } from "react";
import { Clock, Globe, Mail, MapPin, Phone, Send } from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useSiteContent } from "@/hooks/useSiteContent";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Contact = () => {
  const { contact } = useSiteContent();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const office = useMemo(
    () => ({
      city: contact?.address?.toLowerCase().includes("kasoa") ? "Kasoa, Ghana" : "Our Office",
      address: contact?.address || "",
      phone: contact?.phone || "",
      email: contact?.email || "",
    }),
    [contact],
  );

  const businessHours = useMemo(
    () =>
      (contact?.hours || "")
        .split("|")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const [day, ...rest] = entry.split(":");
          return { day: day.trim(), time: rest.join(":").trim() };
        })
        .filter((entry) => entry.day && entry.time),
    [contact],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);

    window.setTimeout(() => {
      setSending(false);
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  const update = (key: string, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-16 pt-20">
        <section className="bg-primary py-20 text-primary-foreground">
          <div className="container text-center">
            <h1 className="mb-4 font-display text-4xl font-bold md:text-5xl">Contact Us</h1>
            <p className="mx-auto max-w-2xl text-lg text-primary-foreground/70">
              Get in touch with our team for travel bookings, visa assistance, work permits, or
              logistics support.
            </p>
          </div>
        </section>

        <div className="container py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="rounded-2xl border bg-card p-8 shadow-lg">
              <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-foreground">
                <Send className="h-5 w-5 text-primary" />
                Send a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(event) => update("name", event.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(event) => update("subject", event.target.value)}
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(event) => update("message", event.target.value)}
                    rows={5}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Tell us more about your inquiry..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            <div className="space-y-8">
              <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
                <iframe
                  title="AtlasWave Office Location"
                  src="https://www.google.com/maps?q=Kasoa%20New%20Market&output=embed"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-lg">
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  Business Hours
                </h3>
                <div className="space-y-3">
                  {businessHours.length > 0 ? (
                    businessHours.map((entry) => (
                      <div key={entry.day} className="flex justify-between gap-3 text-sm">
                        <span className="font-medium text-foreground">{entry.day}</span>
                        <span className="text-right text-muted-foreground">{entry.time}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Business hours will appear here once updated in content management.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-lg">
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-foreground">
                  <Globe className="h-5 w-5 text-primary" />
                  Our Office
                </h3>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{office.city}</p>
                  {office.address ? (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {office.address}
                    </p>
                  ) : null}
                  {office.phone ? (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {office.phone}
                    </p>
                  ) : null}
                  {office.email ? (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {office.email}
                    </p>
                  ) : null}
                  {!office.address && !office.phone && !office.email ? (
                    <p className="text-sm text-muted-foreground">Contact details will appear here once updated in content management.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
