import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Target, Eye, Award, Shield, Users, Globe, CheckCircle2 } from "lucide-react";
import PartnersSection from "@/components/PartnersSection";
import teamPhoto from "@/assets/team-photo.jpg";
import ceoPic from "@/assets/team-ceo.jpg";
import opsPic from "@/assets/team-ops.jpg";
import logisticsPic from "@/assets/team-logistics.jpg";
import immigrationPic from "@/assets/team-immigration.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const team = [
  { name: "Daniel Mensah", role: "CEO & Founder", image: ceoPic, bio: "15+ years in travel and immigration consulting across Africa and Europe." },
  { name: "Abena Osei", role: "Head of Operations", image: opsPic, bio: "Expert in travel logistics and customer experience management." },
  { name: "Kwame Adjei", role: "Logistics Director", image: logisticsPic, bio: "Specializes in international freight and customs clearance." },
  { name: "Grace Amponsah", role: "Immigration Lead", image: immigrationPic, bio: "Licensed immigration consultant with expertise in Schengen & Canadian programs." },
];

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
        {/* Page Hero */}
        <section className="relative pt-32 pb-20 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary rounded-full blur-[100px]" />
          </div>
          <div className="container relative z-10">
            <motion.div {...fadeUp} className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-sm font-semibold rounded-full mb-6 border border-accent/30">
                About GlobeLink
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Connecting People to <span className="text-gradient-accent">Global Opportunities</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/70 leading-relaxed">
                Since 2015, GlobeLink has been a trusted partner for individuals and businesses seeking travel, immigration, and logistics solutions across the globe.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Company Profile */}
        <section className="py-24">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div {...fadeUp}>
                <span className="text-sm font-semibold text-secondary uppercase tracking-widest">Who We Are</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 text-foreground">
                  Your Trusted Partner in Travel, Immigration & Logistics
                </h2>
                <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
                  GlobeLink Travel & Logistics is a full-service company headquartered in Accra, Ghana, specializing in travel bookings, visa processing, work permit applications, and international cargo logistics.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  With a dedicated team of licensed consultants and industry experts, we've helped over 15,000 clients achieve their travel and immigration goals. From booking dream vacations to securing work permits in Europe, Canada, and the USA — we provide end-to-end support with a personal touch.
                </p>
                <div className="grid grid-cols-3 gap-6 mt-10">
                  {[
                    { value: "2015", label: "Founded" },
                    { value: "15K+", label: "Clients Served" },
                    { value: "50+", label: "Countries" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-3xl font-display font-bold text-secondary">{stat.value}</div>
                      <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                {...fadeUp}
                transition={{ delay: 0.2 }}
                className="relative rounded-2xl overflow-hidden aspect-[4/3]"
              >
                <img src={teamPhoto} alt="GlobeLink team in the office" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-24 bg-muted">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                {...fadeUp}
                className="bg-card rounded-2xl p-10 border shadow-card"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-2xl font-display font-bold text-card-foreground">Our Vision</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed text-lg">
                  To be Africa's leading travel, immigration, and logistics company — bridging continents and creating seamless pathways for individuals and businesses to thrive globally.
                </p>
              </motion.div>

              <motion.div
                {...fadeUp}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-10 border shadow-card"
              >
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-display font-bold text-card-foreground">Our Mission</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed text-lg">
                  To deliver reliable, transparent, and affordable travel, visa, work permit, and logistics services — empowering our clients with expert guidance at every step of their journey.
                </p>
              </motion.div>
            </div>

            {/* Core values */}
            <motion.div {...fadeUp} className="mt-16">
              <h3 className="text-2xl font-display font-bold text-foreground text-center mb-10">Our Core Values</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Shield, title: "Integrity", desc: "Honest, transparent service in every interaction." },
                  { icon: Users, title: "Client-First", desc: "Your success is our top priority." },
                  { icon: Globe, title: "Global Reach", desc: "Connecting you to opportunities worldwide." },
                  { icon: Award, title: "Excellence", desc: "Delivering premium quality in all we do." },
                ].map((value, i) => (
                  <motion.div
                    key={value.title}
                    {...fadeUp}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card rounded-xl p-6 border shadow-card text-center"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-display font-semibold text-card-foreground">{value.title}</h4>
                    <p className="text-sm text-muted-foreground mt-2">{value.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-16">
              <span className="text-sm font-semibold text-secondary uppercase tracking-widest">Our Team</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 text-foreground">
                Meet the Experts
              </h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                Our experienced team brings together expertise in travel, immigration law, and international logistics.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  {...fadeUp}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <div className="relative rounded-2xl overflow-hidden aspect-square mb-5">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <h4 className="font-display text-lg font-semibold text-foreground">{member.name}</h4>
                  <p className="text-sm font-semibold text-secondary mt-1">{member.role}</p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-24 bg-primary">
          <div className="container">
            <motion.div {...fadeUp} className="text-center mb-12">
              <span className="text-sm font-semibold text-accent uppercase tracking-widest">Credentials</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 text-primary-foreground">
                Certifications & Licenses
              </h2>
              <p className="text-primary-foreground/60 mt-4 max-w-xl mx-auto">
                We operate with the highest industry standards and maintain all required certifications.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {certifications.map((cert, i) => (
                <motion.div
                  key={cert}
                  {...fadeUp}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 bg-primary-foreground/5 rounded-xl p-4 border border-primary-foreground/10"
                >
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm font-medium text-primary-foreground">{cert}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* Partners & Affiliates */}
        <PartnersSection />
      </main>
      <Footer />
    </div>
  );
};

export default About;
