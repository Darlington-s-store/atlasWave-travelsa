import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Target, Eye, Award, Shield, Users, Globe, CheckCircle2 } from "lucide-react";
import PartnersSection from "../components/PartnersSection";
import VideoSection from "@/components/VideoSection";
import teamPhoto from "@/assets/GettyImages.webp";
import aboutHeroVideo from "@/assets/mixkit-airplane-landing-in.mp4";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const certifications = [
  "IATA Accredited Travel Agent",
  "Licensed Immigration Consultancy",
  "Ghana Tourism Authority Certified",
  "ISO 9001:2015 Quality Management",
  "Customs Brokerage License",
  "Data Protection Compliance (GDPR)",
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative flex min-h-screen min-h-[100svh] items-center overflow-hidden bg-primary">
          <div className="absolute inset-0">
            <video
              src={aboutHeroVideo}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(4,18,38,0.9)_0%,rgba(4,18,38,0.78)_45%,rgba(5,24,46,0.64)_100%)]" />
          </div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-accent blur-[120px]" />
            <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-secondary blur-[100px]" />
          </div>
          <div className="container relative z-10 w-full pb-20 pt-32 text-center sm:pt-36 lg:pb-24">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl">
              <span className="mb-6 inline-block rounded-full border border-accent/30 bg-accent/20 px-4 py-1.5 text-sm font-semibold text-accent">
                About AtlastWave Travel and Tour
              </span>
              <h1 className="font-display text-4xl font-bold leading-[1.05] text-primary-foreground md:text-6xl lg:text-7xl">
                Connecting People to <span className="text-gradient-accent">New Opportunities</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/75 md:text-xl">
                Since 2015, AtlastWave Travel and Tour has been a trusted partner for individuals and businesses seeking travel, immigration, and logistics solutions across borders.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-24">
          <div className="container">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <motion.div {...fadeUp}>
                <span className="text-sm font-semibold uppercase tracking-widest text-secondary">Who We Are</span>
                <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">
                  Your Trusted Partner in Travel, Immigration & Logistics
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  AtlastWave Travel and Tour is a full-service company headquartered in Ghana, specializing in travel bookings, visa processing, work permit applications, and international cargo logistics.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  With a dedicated team of licensed consultants and industry experts, we've helped over 15,000 clients achieve their travel and immigration goals. From booking dream vacations to securing work permits in Europe, Canada, and the USA, we provide end-to-end support with a personal touch.
                </p>
                <div className="mt-10 grid grid-cols-3 gap-6">
                  {[
                    { value: "2015", label: "Founded" },
                    { value: "15K+", label: "Clients Served" },
                    { value: "50+", label: "Countries" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="font-display text-3xl font-bold text-secondary">{stat.value}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                {...fadeUp}
                transition={{ delay: 0.2 }}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <img src={teamPhoto} alt="AtlastWave Travel and Tour team in the office" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="bg-muted py-24">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-2">
              <motion.div
                {...fadeUp}
                className="rounded-2xl border bg-card p-10 shadow-card"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10">
                  <Eye className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-card-foreground">Our Vision</h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  To be Africa's leading travel, immigration, and logistics company, bridging continents and creating seamless pathways for individuals and businesses to grow confidently across borders.
                </p>
              </motion.div>

              <motion.div
                {...fadeUp}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border bg-card p-10 shadow-card"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                  <Target className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-display text-2xl font-bold text-card-foreground">Our Mission</h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  To deliver reliable, transparent, and affordable travel, visa, work permit, and logistics services, empowering our clients with expert guidance at every step of their journey.
                </p>
              </motion.div>
            </div>

            <motion.div {...fadeUp} className="mt-16">
              <h3 className="mb-10 text-center font-display text-2xl font-bold text-foreground">Our Core Values</h3>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {[
                  { icon: Shield, title: "Integrity", desc: "Honest, transparent service in every interaction." },
                  { icon: Users, title: "Client-First", desc: "Your success is our top priority." },
                  { icon: Globe, title: "Worldwide Reach", desc: "Connecting you to opportunities worldwide." },
                  { icon: Award, title: "Excellence", desc: "Delivering premium quality in all we do." },
                ].map((value, index) => (
                  <motion.div
                    key={value.title}
                    {...fadeUp}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-xl border bg-card p-6 text-center shadow-card"
                  >
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-display font-semibold text-card-foreground">{value.title}</h4>
                    <p className="mt-2 text-sm text-muted-foreground">{value.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-primary py-24">
          <div className="container">
            <motion.div {...fadeUp} className="mb-12 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">Credentials</span>
              <h2 className="mt-3 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                Certifications & Licenses
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/60">
                We operate with the highest industry standards and maintain all required certifications.
              </p>
            </motion.div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert}
                  {...fadeUp}
                  transition={{ delay: index * 0.06 }}
                  className="flex items-center gap-3 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                  <span className="text-sm font-medium text-primary-foreground">{cert}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <VideoSection category="about" title="Learn More About Us" subtitle="Watch videos from our team and see how we work." />
        <PartnersSection />
      </main>
      <Footer />
    </div>
  );
};

export default About;
