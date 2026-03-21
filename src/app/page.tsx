import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ScrollLink } from '@/components/landing/scroll-link';
import { RegisterCard } from '@/components/landing/register-card';

export const metadata: Metadata = {
  title: 'Kronolex — Gestão Jurídica Inteligente para Escritórios de Advocacia',
  description:
    'Kronolex é a plataforma de gestão jurídica que centraliza casos, documentos, prazos e notificações para advogados e escritórios de advocacia. Teste grátis por 14 dias.',
  keywords: [
    'gestão jurídica',
    'software para advogados',
    'sistema para escritório de advocacia',
    'controle de processos',
    'gestão de prazos jurídicos',
    'kanban jurídico',
    'notificações de prazos',
    'gestão de documentos jurídicos',
    'kronolex',
  ],
  authors: [{ name: 'Kronolex', url: 'https://kronolex.com.br' }],
  creator: 'Kronolex',
  publisher: 'Kronolex',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Kronolex — Gestão Jurídica Inteligente',
    description:
      'Organize casos, gerencie documentos, notifique clientes e acompanhe prazos em uma única plataforma pensada para advogados.',
    siteName: 'Kronolex',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kronolex — Gestão Jurídica Inteligente',
    description:
      'Organize casos, gerencie documentos e acompanhe prazos em uma plataforma moderna para escritórios de advocacia.',
  },
  alternates: {
    canonical: 'https://kronolex.com.br',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Kronolex',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Plataforma de gestão jurídica para advogados e escritórios de advocacia. Kanban de casos, gestão de documentos e notificações de prazos.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '147.00',
      priceCurrency: 'BRL',
      priceValidUntil: '2027-12-31',
    },
    {
      '@type': 'Offer',
      name: 'Business',
      price: '297.00',
      priceCurrency: 'BRL',
      priceValidUntil: '2027-12-31',
    },
    {
      '@type': 'Offer',
      name: 'Enterprise',
      price: '497.00',
      priceCurrency: 'BRL',
      priceValidUntil: '2027-12-31',
    },
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'kairos.devsolutions@gmail.com',
    contactType: 'customer support',
    availableLanguage: 'Portuguese',
  },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#111] text-white">
        {/* Navbar */}
        <header>
          <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10" aria-label="Navegação principal">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500" aria-hidden="true">
                <path d="M12 3v18"/>
                <path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/>
                <path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/>
                <path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/>
                <path d="M7 21h10"/>
              </svg>
              <span className="text-xl font-semibold tracking-wide">Kronolex</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm text-white/60 font-medium tracking-wide">
              <ScrollLink to="funcionalidades" className="hover:text-white transition-colors">FUNCIONALIDADES</ScrollLink>
              <ScrollLink to="planos" className="hover:text-white transition-colors">PLANOS</ScrollLink>
              <ScrollLink to="contato" className="hover:text-white transition-colors">CONTATO</ScrollLink>
            </div>

            <Link
              href="/auth/login"
              className="px-5 py-2 text-sm font-medium border border-white/30 rounded hover:bg-white/10 transition-colors"
            >
              ENTRAR
            </Link>
          </nav>
        </header>

        {/* Hero + Register Card */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden" aria-label="Início">
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1600&q=80')", transform: 'scaleX(-1)' }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111] via-[#111]/85 to-[#111]/60" aria-hidden="true" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 flex flex-col lg:flex-row items-center gap-16">
            {/* Left: headline */}
            <div className="flex-1">
              <div className="w-12 h-px bg-amber-500 mb-8" aria-hidden="true" />
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Gestão jurídica inteligente para o seu escritório
              </h1>
              <p className="text-white/60 text-lg mb-10 max-w-lg leading-relaxed">
                Organize casos, gerencie documentos, notifique clientes e acompanhe prazos em uma única plataforma pensada para advogados.
              </p>

              <ul className="flex flex-col gap-4" aria-label="Principais funcionalidades">
                {[
                  'Kanban de casos personalizável',
                  'Notificações de prazos por email',
                  'Links seguros para envio de documentos',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/60 text-sm">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: register card */}
            <div className="w-full lg:w-auto lg:min-w-[420px]">
              <RegisterCard />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="funcionalidades" className="py-24 px-8 md:px-16 border-t border-white/10" aria-label="Funcionalidades">
          <div className="max-w-5xl mx-auto">
            <div className="w-8 h-px bg-amber-500 mb-4" aria-hidden="true" />
            <h2 className="text-3xl font-bold mb-16">Tudo que seu escritório precisa</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M3 9h18M9 21V9"/>
                    </svg>
                  ),
                  title: 'Kanban de Casos',
                  desc: 'Visualize e mova seus processos entre colunas personalizáveis com drag and drop.',
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  ),
                  title: 'Gestão de Documentos',
                  desc: 'Solicite, receba e aprove documentos de clientes com links seguros de upload.',
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 01-3.46 0"/>
                    </svg>
                  ),
                  title: 'Notificações de Prazo',
                  desc: 'Receba alertas de audiências, prazos e reuniões diretamente no seu email.',
                },
              ].map((f) => (
                <article key={f.title} className="border border-white/10 p-6 rounded-lg hover:border-amber-500/40 transition-colors">
                  <div className="text-amber-500 mb-4">{f.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Visual / Trust section */}
        <section className="border-t border-white/10 grid lg:grid-cols-2 min-h-[480px]" aria-label="Por que escolher o Kronolex">
          {/* Image */}
          <div className="relative overflow-hidden min-h-[320px]">
            <Image
              src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&q=80"
              alt="Biblioteca jurídica com estantes de livros de direito"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111]/10 to-[#111]/60" aria-hidden="true" />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center px-12 py-16 bg-[#111]">
            <div className="w-8 h-px bg-amber-500 mb-6" aria-hidden="true" />
            <h2 className="text-3xl font-bold mb-6 leading-snug">
              Feito para advogados que valorizam o seu tempo
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-10">
              Chega de planilhas, emails perdidos e prazos esquecidos. O Kronolex centraliza tudo o que o seu escritório precisa em uma plataforma moderna, segura e fácil de usar.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '100%', label: 'Dados seguros na nuvem' },
                { value: '14 dias', label: 'Teste grátis sem cartão' },
                { value: '24/7', label: 'Notificações automáticas' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-lg md:text-2xl font-bold text-amber-500 mb-1 leading-tight">{stat.value}</p>
                  <p className="text-white/40 text-[10px] md:text-xs leading-snug">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section id="planos" className="py-24 px-8 md:px-16 border-t border-white/10" aria-label="Planos e preços">
          <div className="max-w-5xl mx-auto">
            <div className="w-8 h-px bg-amber-500 mb-4" aria-hidden="true" />
            <h2 className="text-3xl font-bold mb-4">Planos</h2>
            <p className="text-white/50 text-lg mb-16">
              Escolha o plano ideal para o seu escritório. Todos os planos incluem{' '}
              <span className="text-amber-500 font-medium">14 dias grátis</span>, sem cartão de crédito.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Pro */}
              <article className="border border-white/10 rounded-xl p-8 flex flex-col gap-6 hover:border-amber-500/40 transition-colors">
                <div>
                  <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-2">Pro</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">R$ 147</span>
                    <span className="text-white/40 text-sm mb-1">/mês</span>
                  </div>
                  <p className="text-xs text-white/40 mt-2">14 dias grátis para começar</p>
                </div>
                <ul className="flex flex-col gap-3 text-sm text-white/60">
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> Até 3 advogados</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> 50 casos ativos</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> 50 links de compartilhamento</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> Documentos ilimitados</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> Notificações por email</li>
                </ul>
                <ScrollLink to="cadastro" className="mt-auto block text-center py-3 px-6 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                  Começar agora
                </ScrollLink>
              </article>

              {/* Business */}
              <article className="border border-amber-500/60 rounded-xl p-8 flex flex-col gap-6 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Mais popular
                </span>
                <div>
                  <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-2">Business</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">R$ 297</span>
                    <span className="text-white/40 text-sm mb-1">/mês</span>
                  </div>
                  <p className="text-xs text-white/40 mt-2">14 dias grátis para começar</p>
                </div>
                <ul className="flex flex-col gap-3 text-sm text-white/60">
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> Até 10 advogados</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> 300 casos ativos</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> 300 links de compartilhamento</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> Documentos ilimitados</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> Notificações por email</li>
                </ul>
                <ScrollLink to="cadastro" className="mt-auto block text-center py-3 px-6 bg-amber-500 text-black rounded-lg text-sm font-bold hover:bg-amber-400 transition-colors">
                  Começar agora
                </ScrollLink>
              </article>

              {/* Enterprise */}
              <article className="border border-white/10 rounded-xl p-8 flex flex-col gap-6 hover:border-amber-500/40 transition-colors">
                <div>
                  <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-2">Enterprise</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">R$ 497</span>
                    <span className="text-white/40 text-sm mb-1">/mês</span>
                  </div>
                  <p className="text-xs text-white/40 mt-2">14 dias grátis para começar</p>
                </div>
                <ul className="flex flex-col gap-3 text-sm text-white/60">
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> Advogados ilimitados</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> Casos ilimitados</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> Links ilimitados</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> Documentos ilimitados</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500" aria-hidden="true">✓</span> Notificações por email</li>
                </ul>
                <ScrollLink to="cadastro" className="mt-auto block text-center py-3 px-6 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                  Começar agora
                </ScrollLink>
              </article>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contato" className="py-24 px-8 md:px-16 border-t border-white/10" aria-label="Contato">
          <div className="max-w-5xl mx-auto">
            <div className="w-8 h-px bg-amber-500 mb-4" aria-hidden="true" />
            <h2 className="text-3xl font-bold mb-4">Fale conosco</h2>
            <p className="text-white/50 text-lg mb-10">Dúvidas, sugestões ou suporte? Entre em contato.</p>
            <a
              href="mailto:kairos.devsolutions@gmail.com"
              className="inline-flex items-center gap-3 text-amber-500 hover:text-amber-400 transition-colors text-lg font-medium"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              kairos.devsolutions@gmail.com
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 px-8 md:px-16 py-8 flex items-center justify-between text-white/30 text-sm">
          <span>© {new Date().getFullYear()} Kronolex. Todos os direitos reservados.</span>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500" aria-hidden="true">
              <path d="M12 3v18"/>
              <path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/>
              <path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/>
              <path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/>
              <path d="M7 21h10"/>
            </svg>
            <span>Kronolex</span>
          </div>
        </footer>
      </div>
    </>
  );
}
