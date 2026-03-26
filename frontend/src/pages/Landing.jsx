import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Trophy, Heart, Target, Shield, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

function Landing() {
  const navigate = useNavigate();

  const prizeTiers = [
    {
      name: "Grand Slam",
      match: "5-Number Match",
      share: "40%",
      icon: Crown,
      gradient: "from-secondary-fixed to-secondary",
      rollover: true,
    },
    {
      name: "Eagle Tier",
      match: "4-Number Match",
      share: "35%",
      icon: Award,
      gradient: "from-primary to-primary-dim",
      rollover: false,
    },
    {
      name: "Birdie Tier",
      match: "3-Number Match",
      share: "25%",
      icon: Star,
      gradient: "from-tertiary-fixed-dim to-tertiary",
      rollover: false,
    },
  ];

  const features = [
    {
      icon: Target,
      title: "Track Your Performance",
      description: "Enter your last 5 Stableford scores and watch your game evolve through data-driven insights.",
    },
    {
      icon: Trophy,
      title: "Monthly Prize Draws",
      description: "Choose your numbers. Match the draw. Win from a tiered prize pool funded by all subscribers.",
    },
    {
      icon: Heart,
      title: "Support Charities",
      description: "A minimum of 10% of every subscription goes directly to the charity of your choosing.",
    },
    {
      icon: Shield,
      title: "Verified Winners",
      description: "Every winner undergoes a transparent verification process before prize distribution.",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-tertiary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/50 text-on-primary-container text-label-md font-label mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Now accepting members
            </motion.div>

            <h1 className="font-display text-display-lg text-on-surface mb-6 leading-tight">
              Play with Purpose.
              <br />
              <span className="text-gradient-primary">Win for Impact.</span>
            </h1>

            <p className="text-body-lg text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
              The premier subscription platform where your golf performance translates
              directly into charitable contributions and elite prize pool eligibility.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="xl" onClick={() => navigate("/signup")}>
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl" onClick={() => navigate("/charities")}>
                Explore Charities
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-headline text-display-sm text-on-surface mb-4">
              The Prize Tiers
            </h2>
            <p className="text-body-lg text-on-surface-variant">
              Predict your performance. Match your scorecard. Secure your legacy.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {prizeTiers.map((tier) => {
              const Icon = tier.icon || Trophy;
              return (
                <motion.div key={tier.name} variants={fadeInUp}>
                  <Card hover className="text-center relative overflow-hidden">
                    <div className={`h-1 bg-gradient-to-r ${tier.gradient}`} />
                    <CardContent className="pt-8 pb-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-headline text-headline-sm text-on-surface mb-1">
                        {tier.name}
                      </h3>
                      <p className="text-body-md text-on-surface-variant mb-4">{tier.match}</p>
                      <div className="text-display-sm font-headline text-on-surface mb-2">
                        {tier.share}
                      </div>
                      <p className="text-label-md text-on-surface-variant uppercase">
                        of prize pool
                      </p>
                      {tier.rollover && (
                        <div className="mt-4 px-3 py-1.5 bg-secondary-container rounded-full inline-block">
                          <span className="text-label-sm text-on-secondary-container">
                            Jackpot Rollover
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-20 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="font-headline text-display-sm text-on-surface mb-6">
                Your Game,
                <br />
                <span className="text-gradient-primary">Their Progress.</span>
              </h2>
              <p className="text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                Every subscription contributes 10% of fees directly to global charity partners.
                We believe that precision on the course should drive precision in philanthropic giving.
              </p>

              <div className="space-y-4">
                {[
                  { value: "10%+", label: "Minimum charity contribution" },
                  { value: "6", label: "Partner charities and counting" },
                  { value: "100%", label: "Transparent fund allocation" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-4">
                    <span className="font-headline text-headline-md text-primary w-20">
                      {stat.value}
                    </span>
                    <span className="text-body-md text-on-surface-variant">{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-elevation-3 p-8"
            >
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label text-label-md text-on-surface-variant uppercase">Ocean Restoration</span>
                    <span className="font-label text-label-lg text-primary">£12,450</span>
                  </div>
                  <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full gradient-primary"
                      initial={{ width: 0 }}
                      whileInView={{ width: "75%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label text-label-md text-on-surface-variant uppercase">Children's Education</span>
                    <span className="font-label text-label-lg text-primary">£8,920</span>
                  </div>
                  <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-tertiary-fixed-dim to-tertiary"
                      initial={{ width: 0 }}
                      whileInView={{ width: "55%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label text-label-md text-on-surface-variant uppercase">Global Health</span>
                    <span className="font-label text-label-lg text-primary">£6,380</span>
                  </div>
                  <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-secondary-fixed to-secondary"
                      initial={{ width: 0 }}
                      whileInView={{ width: "40%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-headline text-display-sm text-on-surface mb-4">
              Elevate Your Performance.
            </h2>
            <p className="text-body-lg text-on-surface-variant">
              Choose your commitment level and begin your journey on the digital fairway today.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card hover className="h-full">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-on-primary-container" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-headline text-title-lg text-on-surface mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-body-md text-on-surface-variant leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 gradient-mesh">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="font-headline text-display-sm text-on-surface mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-body-lg text-on-surface-variant mb-8">
              Join a community of golfers who play with purpose and win for impact.
            </p>
            <Button size="xl" onClick={() => navigate("/signup")}>
              Subscribe Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function Crown(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M3 20h18" />
    </svg>
  );
}

export default Landing;
