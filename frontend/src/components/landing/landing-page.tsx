'use client';

import { motion } from 'framer-motion';
import { Search, CheckCircle, Lock, Smartphone, MessageSquare, Shield, Clock, MapPin, ChevronRight, Zap, Database, Eye, Send, Users, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn?: () => void;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
};

export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignIn = () => {
    console.log('[v0] Sign In button clicked, onSignIn available:', !!onSignIn);
    if (onSignIn) {
      onSignIn();
    } else {
      console.log('[v0] onSignIn not provided, falling back to onGetStarted');
      onGetStarted();
    }
  };

  return (
    <main className="min-h-screen w-full bg-stone-950">
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-slate-600/10 rounded-full blur-3xl opacity-20 animate-drift" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-slate-500/5 rounded-full blur-3xl opacity-15" />
      </div>

      {/* Premium Navigation - Apple Liquid Glass */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="sticky top-0 z-50 liquid-glass mx-3 mt-3 rounded-2xl"
        style={{ willChange: 'transform' }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="font-display font-black text-3xl tracking-tight text-white"
            >
              CampusFind
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-12">
              {['How It Works', 'Features', 'Community', 'For Security Office'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-300 tracking-wide"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSignIn}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-300 px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onGetStarted}
                className="liquid-glass text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-xl shadow-emerald-600/20"
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 hover:bg-white/10 rounded-xl transition-colors duration-300"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden pb-6 space-y-4 border-t border-white/5 pt-6"
            >
              {['How It Works', 'Features', 'Community', 'For Security Office'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="block text-white/70 hover:text-white font-medium transition-colors"
                >
                  {item}
                </a>
              ))}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignIn}
                  className="w-full text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:bg-white/10 cursor-pointer"
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onGetStarted}
                  className="w-full liquid-glass text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300"
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Premium Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 sm:pt-32 sm:pb-40 lg:pt-48 lg:pb-56 px-6 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-8">
            <span className="inline-block text-xs font-bold tracking-widest text-emerald-400 uppercase mb-6 px-4 py-2 bg-emerald-950/50 rounded-full border border-emerald-900/50">
              Zetech University's Official Asset Recovery Platform
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-6xl sm:text-7xl lg:text-8xl font-display font-black text-white mb-8 leading-[1.1] tracking-tight"
          >
            Your Lost Items,{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Recovered Fast.
              </span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ originX: 0 }}
              />
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            Stop searching blindly. Our digital lost and found platform connects you with the Security Office to recover your keys, IDs, phones, and more. Fast, secure, and verified ownership protection.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-10 py-4 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center gap-2 shadow-xl shadow-emerald-600/30"
            >
              Lost an Item
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="group liquid-glass text-white px-10 py-4 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center gap-2"
            >
              I Found an Item
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Stats Strip */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="mt-20 pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-around items-center gap-8"
          >
            {[
              { value: '500+', label: 'Items in Database' },
              { value: '98%', label: 'Recovery Success Rate' },
              { value: '24hrs', label: 'Avg Recovery Time' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/50 font-medium tracking-wide">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works - Premium */}
      <section id="how-it-works" className="py-32 px-6 sm:px-8 lg:px-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tight">
              Effortlessly Simple.
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto font-light">
              Three elegant steps to recover what matters. Designed for speed and security.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: Search, title: 'Smart Search & Filter', desc: 'Instantly search by item type, color, location, or date found. Narrow down hundreds of items in seconds.' },
              { icon: MessageSquare, title: 'Secure Messaging', desc: 'Private chat with Security Office. Prove ownership safely without revealing personal details publicly.' },
              { icon: Shield, title: 'Anti-Fraud Verification', desc: 'All claims require proof of ownership. Security confirms matches before releasing items to prevent fraud.' },
              { icon: Users, title: 'Community Recovery', desc: 'Join thousands of Zetech students who have successfully recovered lost property through our platform.' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={scaleIn}
                className="group relative overflow-hidden rounded-3xl p-8 liquid-glass hover:border-emerald-500/40 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 liquid-glass rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/60 font-light">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-32 px-6 sm:px-8 lg:px-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tight">
              Trusted by Our Community.
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto font-light">
              Thousands of Zetech students have recovered their belongings.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              { name: 'Kofi M.', role: 'Year 2 Engineering', quote: 'Lost my student ID at the library. Found it in the system within hours and picked it up from Security. No drama, just efficient.' },
              { name: 'Fatima K.', role: 'Year 3 Business Administration', quote: 'My keys were returned safely within 24 hours. The messaging system with Security made verification super easy. Grateful for this platform!' },
              { name: 'David O.', role: 'Year 1 Computer Science', quote: 'Thought my phone was gone. Used CampusFind to check, found it, messaged Security with proof, and got it back. Life saver!' },
              { name: 'Grace N.', role: 'Year 2 Nursing', quote: 'The digital system beats the old chaotic method. Clear photos, easy search, secure messaging. Best solution for campus lost items.' },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={scaleIn}
                className="group relative overflow-hidden rounded-3xl p-8 liquid-glass hover:border-emerald-500/40 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Zap key={i} className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                    ))}
                  </div>
                  <p className="text-white/80 font-light mb-6 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="border-t border-white/5 pt-5">
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-white/50 font-light">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* For Security Office Section */}
      <section id="security" className="py-32 px-6 sm:px-8 lg:px-12 border-t border-white/5 bg-stone-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tight">
              For Security Office Staff
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto font-light">
              Powerful tools to manage found items and serve the Zetech community more efficiently.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Lightbulb, title: 'Record Items Instantly', desc: 'Upload found items with photos, descriptions, location, and category. All records go live immediately for students to see.' },
              { icon: MessageSquare, title: 'Manage Claims', desc: 'Review student messages, ask verification questions, and confirm ownership before releasing items safely.' },
              { icon: Database, title: 'Digital Inventory', desc: 'View all lost items in one place. Mark as collected or disposed. No more piles—complete organization and accountability.' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={scaleIn}
                className="group relative overflow-hidden rounded-3xl p-8 liquid-glass hover:border-emerald-500/40 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 liquid-glass rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/60 font-light">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="relative py-32 px-6 sm:px-8 lg:px-12 border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-transparent to-emerald-600/5" />
        <div className="max-w-4xl mx-auto relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tight">
              Ready to recover?
            </h2>
            <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto font-light">
              Join thousands of students who have already recovered their belongings. Get started in seconds.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-10 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-xl shadow-emerald-600/30"
            >
              Start Now
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="border-t border-white/5 bg-stone-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <h3 className="font-black text-xl text-white mb-4">CampusFind</h3>
              <p className="text-white/50 font-light text-sm leading-relaxed">Zetech University's official lost and found management system. Transforming asset recovery from chaos to order.</p>
            </div>
            {[
              { title: 'For Students', links: ['Search Items', 'Report Lost Item', 'Messaging', 'FAQ'] },
              { title: 'For Security', links: ['Dashboard', 'Record Items', 'Manage Claims', 'Reports'] },
              { title: 'About', links: ['System Info', 'Contact Security', 'Privacy Policy', 'Terms of Use'] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-bold text-white mb-4 text-sm tracking-wide">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-white/50 hover:text-emerald-400 transition-colors font-light text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm font-light">© 2026 Zetech University Campus Lost & Found Management System. All rights reserved.</p>
            <div className="flex gap-6">
              {[MessageSquare, Users].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-emerald-400 transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
