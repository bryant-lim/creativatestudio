"use client";

import Link from "next/link";
import Chatbot from "@/components/Chatbot";
import { 
  Code2, 
  Layout, 
  Smartphone, 
  BarChart3, 
  Bot, 
  LifeBuoy,
  ArrowRight,
  ExternalLink,
  MessageCircle
} from "lucide-react";

export default function Home() {
  const services = [
    {
      title: "Web Design & e-Commerce",
      description: "Bespoke, conversion-optimized storefronts and brand profiles that scale with your business.",
      icon: <Layout className="w-8 h-8 text-cyan-400" />,
    },
    {
      title: "Software Development",
      description: "Custom CRM and automation workflows tailored to streamline your specific operations.",
      icon: <Code2 className="w-8 h-8 text-purple-400" />,
    },
    {
      title: "Mobile App Development",
      description: "High-performance iOS and Android applications built for speed and user engagement.",
      icon: <Smartphone className="w-8 h-8 text-blue-400" />,
    },
    {
      title: "Digital Marketing",
      description: "Strategic Google and Facebook Ads combined with SEO to bring the right audience to you.",
      icon: <BarChart3 className="w-8 h-8 text-pink-400" />,
    },
    {
      title: "AI Chatbots & Automation",
      description: "Custom AI assistants and conversational agents trained on your business data to answer customer enquiries and capture leads 24/7.",
      icon: <Bot className="w-8 h-8 text-indigo-400" />,
    },
    {
      title: "Technical Support & Maintenance",
      description: "Dedicated technical assistance and regular maintenance for your digital platforms and systems, letting you focus entirely on growing your business.",
      icon: <LifeBuoy className="w-8 h-8 text-emerald-400" />,
    },
  ];

  const clients = [
    { name: "Country Farm Organics", src: "/client-logo/Country-Farm-Organics-Logo.png" },
    { name: "KyKidsCA", src: "/client-logo/KyKidsCA_Round_Logo.png" },
    { name: "APM", src: "/client-logo/Logo_APM-1.png" },
    { name: "CMF Global", src: "/client-logo/cmf-logo.png" },
    { name: "EA Detailer", src: "/client-logo/eadetailer-logo-silver-03.png" },
    { name: "IGP", src: "/client-logo/igp_main_logo.png" },
    { name: "Lolo", src: "/client-logo/logo-lolo-1.png" },
    { name: "TalentHouz", src: "/client-logo/talenthouz-logo.png" },
    { name: "UTS", src: "/client-logo/uts-logo.png" },
    { name: "Smart Maths", src: "/client-logo/smart-maths-logo.png" },
    { name: "Conceptine", src: "/client-logo/conceptine-logo.png" },
    { name: "MAPCOT", src: "/client-logo/mapcot-logo.png" },
    { name: "Windscreen2U", src: "/client-logo/windscreen2u-logo.jpg" },
    { name: "Zemlya Clinic", src: "/client-logo/zemlya-clinic-logo.png" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Creativate Studio",
    "image": "https://creativatestudio.my/logo.png",
    "@id": "https://creativatestudio.my/#organization",
    "url": "https://creativatestudio.my",
    "telephone": "+60173565462",
    "description": "Professional digital agency specializing in custom AI chatbots & automation, web development, custom CRM/ERP development, digital marketing, and tech support for Malaysian businesses.",
    "areaServed": "MY",
    "sameAs": [
      "https://t.me/bryantlim"
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "B2-2-3, 1, Jln Dutamas 1, Solaris Dutamas",
      "addressLocality": "Kuala Lumpur",
      "addressRegion": "Wilayah Persekutuan",
      "postalCode": "50480",
      "addressCountry": "MY"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    }
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation */}
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        width: '100%', 
        zIndex: 100, 
        padding: '24px 0',
        background: 'rgba(10, 10, 12, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div className="container nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo.png" 
              alt="Creativate Studio" 
              style={{ 
                height: '60px', 
                width: 'auto',
                filter: 'brightness(1.1) drop-shadow(0 0 15px rgba(255,255,255,0.1))'
              }} 
            />
          </Link>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <Link href="#services" className="mobile-hide" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Services</Link>
            <Link href="#portfolio" className="mobile-hide" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Portfolio</Link>
            <button 
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("welly-ai-open"));
                }
              }} 
              className="btn-primary" 
              style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}
            >
              <MessageCircle size={16} /> <span className="mobile-hide">Talk to Us</span><span style={{ display: 'none' }} className="mobile-show">Talk</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '180px 0 120px', 
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)'
      }}>
        <div className="container animate-slide">
          <div style={{ 
            display: 'inline-block', 
            padding: '8px 16px', 
            borderRadius: '100px', 
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--glass-border)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '24px',
            color: 'var(--accent-secondary)'
          }}>
            8+ YEARS OF DIGITAL EXCELLENCE
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', maxWidth: '900px', margin: '0 auto 24px' }}>
            Innovating Digital Growth for <span className="gradient-text">Malaysian SMEs</span>
          </h1>
          <p style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
            color: 'var(--text-secondary)', 
            maxWidth: '600px', 
            margin: '0 auto 40px' 
          }}>
            We build high-performance websites, custom software, and digital strategies that transform how you do business.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="https://t.me/bryantlim" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Start Your Project <ArrowRight size={18} />
            </Link>
            <Link href="#portfolio" className="glass-card" style={{ padding: '16px 32px', borderRadius: '50px', fontSize: '1rem', fontWeight: 600 }}>
              View Our Work
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{ padding: 'var(--section-padding)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }} className="animate-fade">
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '16px' }}>Our Expertise</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              From initial design to complex custom software, we provide end-to-end digital solutions.
            </p>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px' 
          }}>
            {services.map((service, index) => (
              <div key={index} className="glass-card animate-slide" style={{ display: 'flex', flexDirection: 'column', gap: '20px', animationDelay: `${index * 0.1}s` }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '16px', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {service.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{service.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Markers / Portfolio Section */}
      <section id="portfolio" style={{ padding: 'var(--section-padding)', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '16px' }}>Trusted by Local Businesses</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Delivering digital excellence for Malaysian SMEs.</p>
          </div>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '24px', 
          }}>
            {clients.map((client, index) => (
              <div key={index} style={{ 
                width: '160px', 
                height: '90px', 
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }} className="client-logo-card">
                <img 
                  src={client.src} 
                  alt={client.name} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain' 
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer style={{ padding: '80px 0 40px', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '40px',
            marginBottom: '60px'
          }}>
            <div>
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src="/logo.png" 
                  alt="Creativate Studio" 
                  style={{ 
                    height: '48px', 
                    width: 'auto',
                    filter: 'brightness(1.1) drop-shadow(0 0 15px rgba(255,255,255,0.1))'
                  }} 
                />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Professional digital agency specializing in web development, custom software, and business automation for the Malaysian market.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Services</h4>
              <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>Web Development</li>
                <li>ERP Solutions</li>
                <li>Mobile Apps</li>
                <li>SEO & Marketing</li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '20px' }}>Contact</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.5' }}>
                B2-2-3, 1, Jln Dutamas 1,<br />
                Solaris Dutamas, 50480 Kuala Lumpur,<br />
                Wilayah Persekutuan Kuala Lumpur
              </p>
              {/* Telegram Us link removed */}
            </div>
          </div>
          <div style={{ 
            textAlign: 'center', 
            paddingTop: '40px', 
            borderTop: '1px solid var(--glass-border)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem'
          }}>
            © {new Date().getFullYear()} Creativate Studio. All rights reserved.
          </div>
        </div>
      </footer>
      <Chatbot />
    </main>
  );
}
