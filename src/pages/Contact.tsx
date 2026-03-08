import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, Send, Globe } from "lucide-react";

const offices = [
  { city: "Accra, Ghana (HQ)", address: "123 Global Avenue, East Legon", phone: "+233 123 456 789", email: "accra@atlaswave.com" },
  { city: "London, UK", address: "45 Kings Road, Westminster", phone: "+44 20 1234 5678", email: "london@atlaswave.com" },
  { city: "Toronto, Canada", address: "200 Bay Street, Suite 300", phone: "+1 416 555 0199", email: "toronto@atlaswave.com" },
];

const hours = [
  { day: "Monday – Friday", time: "8:00 AM – 6:00 PM GMT" },
  { day: "Saturday", time: "9:00 AM – 3:00 PM GMT" },
  { day: "Sunday", time: "Closed (Online support available)" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
              Get in touch with our team for travel bookings, visa assistance, work permits, or logistics support.
            </p>
          </div>
        </section>

        <div className="container py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-card rounded-2xl border shadow-lg p-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" /> Send a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Doe" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="How can we help?" required />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
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

            {/* Info Side */}
            <div className="space-y-8">
              {/* Map */}
              <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
                <iframe
                  title="AtlasWave Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.7229574199284!2d-0.1656!3d5.6145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzYnNTIuMiJOIDDCsDA5JzU2LjIiVw!5e0!3m2!1sen!2sgh!4v1234567890"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Business Hours */}
              <div className="bg-card rounded-2xl border shadow-lg p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Business Hours
                </h3>
                <div className="space-y-3">
                  {hours.map((h) => (
                    <div key={h.day} className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{h.day}</span>
                      <span className="text-muted-foreground">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offices */}
              <div className="bg-card rounded-2xl border shadow-lg p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" /> Our Offices
                </h3>
                <div className="space-y-5">
                  {offices.map((o) => (
                    <div key={o.city} className="space-y-1">
                      <p className="font-medium text-foreground">{o.city}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{o.address}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{o.phone}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{o.email}</p>
                    </div>
                  ))}
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
