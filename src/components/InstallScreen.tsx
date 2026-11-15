import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Globe2,
  Loader2,
  Lock,
  Menu,
  MonitorSmartphone,
  PlusSquare,
  Share,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { GanamosLogo } from './GanamosLogo';
import {
  getDeferredInstallPrompt,
  getInstallEnvironment,
  getManualInstallSteps,
  hasAppInstalledEvent,
  promptForInstall,
  subscribeToInstallChanges,
} from '../lib/pwa/installation';

type FeedbackTone = 'success' | 'info' | 'error';

interface Feedback {
  tone: FeedbackTone;
  message: string;
}

const FeedbackBanner: React.FC<Feedback> = ({ tone, message }) => {
  const styles =
    tone === 'success'
      ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100'
      : tone === 'error'
        ? 'border-red-500/25 bg-red-500/10 text-red-100'
        : 'border-violet-500/20 bg-violet-500/10 text-violet-100';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mb-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[11px] leading-relaxed ${styles}`}
    >
      {tone === 'success' ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : tone === 'error' ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};

const PanelHeading: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  tone?: 'violet' | 'emerald';
}> = ({ icon, title, description, tone = 'violet' }) => (
  <div className="flex flex-col items-center text-center">
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-[0_0_26px_rgba(124,58,237,0.12)] ${
        tone === 'emerald'
          ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
          : 'border-violet-400/25 bg-violet-500/10 text-violet-200'
      }`}
    >
      {icon}
    </div>
    <h2 className="mt-3.5 text-[17px] font-extrabold tracking-tight text-white">{title}</h2>
    <p className="mt-1.5 max-w-[320px] text-[11.5px] leading-relaxed text-violet-200/65">
      {description}
    </p>
  </div>
);

const StepsList: React.FC<{
  steps: Array<{ icon: React.ReactNode; title: string; description?: string }>;
}> = ({ steps }) => (
  <ul className="mt-4 space-y-2">
    {steps.map((step, index) => (
      <li
        key={`${index}-${step.title}`}
        className="flex items-start gap-2.5 rounded-xl border border-violet-500/15 bg-[#0a0318]/60 px-3 py-2.5"
      >
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-300">
          {step.icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11.5px] font-bold leading-snug text-violet-50">{step.title}</p>
          {step.description && (
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-violet-300/55">
              {step.description}
            </p>
          )}
        </div>
      </li>
    ))}
  </ul>
);

const primaryButtonClass =
  'group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-violet-300/25 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 px-4 text-[12.5px] font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(109,40,217,0.38)] transition-all duration-200 hover:from-violet-500 hover:via-purple-500 hover:to-violet-600 hover:shadow-[0_12px_36px_rgba(124,58,237,0.48)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70';

export const InstallScreen: React.FC = () => {
  const environment = getInstallEnvironment();
  const currentUrl = typeof window === 'undefined' ? '' : window.location.href;

  const [promptAvailable, setPromptAvailable] = useState(
    () => getDeferredInstallPrompt() !== null,
  );
  const [appInstalled, setAppInstalled] = useState(() => hasAppInstalledEvent());
  const [installRequested, setInstallRequested] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [preparing, setPreparing] = useState(
    () => environment === 'chromium' && !getDeferredInstallPrompt() && !hasAppInstalledEvent(),
  );

  useEffect(
    () =>
      subscribeToInstallChanges(() => {
        const prompt = getDeferredInstallPrompt();
        const installed = hasAppInstalledEvent();

        setPromptAvailable(prompt !== null);
        setAppInstalled(installed);

        if (prompt) {
          setPreparing(false);
          setFeedback(null);
        }
        if (installed) {
          setInstallRequested(false);
          setFeedback(null);
        }
      }),
    [],
  );

  useEffect(() => {
    if (!preparing) return;
    const timeout = window.setTimeout(() => setPreparing(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [preparing]);

  const handleInstall = async () => {
    if (installing) return;

    setInstalling(true);
    setFeedback(null);

    const outcome = await promptForInstall();
    setInstalling(false);

    if (outcome === 'accepted') {
      setInstallRequested(true);
      return;
    }

    if (outcome === 'dismissed') {
      setFeedback({
        tone: 'info',
        message: 'Cancelaste la instalación. Podés reintentarla desde el menú del navegador.',
      });
      return;
    }

    if (outcome === 'error') {
      setFeedback({
        tone: 'error',
        message: 'No pudimos abrir el instalador. Usá el menú del navegador para instalar GANAMOS.',
      });
      return;
    }

    setFeedback({
      tone: 'info',
      message: 'El instalador no está disponible en este momento. Usá las instrucciones de abajo.',
    });
  };

  const handleCopyLink = async () => {
    let copied = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(currentUrl);
        copied = true;
      } catch {
        copied = false;
      }
    }

    // Fallback para navegadores sin Clipboard API o contextos sin permiso
    // (por ejemplo, abrir la app desde una IP de la red local por HTTP).
    if (!copied && typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = currentUrl;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-1000px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      }
      document.body.removeChild(textarea);
    }

    setCopyState(copied ? 'copied' : 'error');
  };

  const copyLinkBlock = (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleCopyLink}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 text-[11px] font-bold uppercase tracking-wider text-violet-100 transition-all hover:bg-violet-500/15 active:scale-[0.99]"
      >
        {copyState === 'copied' ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        <span>{copyState === 'copied' ? 'Enlace copiado' : 'Copiar enlace'}</span>
      </button>

      <p className="mt-2 select-all break-all rounded-xl border border-violet-500/15 bg-[#07020f]/80 px-3 py-2 text-center text-[10.5px] leading-relaxed text-violet-300/50">
        {currentUrl}
      </p>

      {copyState === 'copied' && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-center text-[10.5px] leading-relaxed text-emerald-300/80"
        >
          Enlace copiado. Pegalo en el navegador recomendado para continuar.
        </p>
      )}
      {copyState === 'error' && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-center text-[10.5px] leading-relaxed text-red-300/80"
        >
          No pudimos copiar el enlace. Copiá la dirección desde la barra del navegador.
        </p>
      )}
    </div>
  );

  const manualSteps = getManualInstallSteps().map((step, index) => ({
    icon:
      index === 0 ? (
        <Menu className="h-3.5 w-3.5" />
      ) : index === 1 ? (
        <Download className="h-3.5 w-3.5" />
      ) : (
        <Check className="h-3.5 w-3.5" />
      ),
    title: step,
  }));

  // Solo los navegadores Chromium permiten instalar con beforeinstallprompt.
  // En iOS, navegadores embebidos o navegadores sin soporte nunca mostramos
  // una instalación automática, aunque el evento llegue por error.
  const canUseAutomaticPrompt =
    (promptAvailable || installing) && environment === 'chromium';

  let panel: React.ReactNode;

  if (appInstalled) {
    panel = (
      <>
        <PanelHeading
          tone="emerald"
          icon={<CheckCircle2 className="h-6 w-6" />}
          title="GANAMOS está instalada"
          description="Abrila desde el icono de tu pantalla de inicio. Por seguridad, esta pestaña del navegador seguirá bloqueada."
        />
        <div className="mt-4 rounded-xl border border-violet-500/15 bg-[#0a0318]/70 px-3 py-2.5 text-center text-[10.5px] leading-relaxed text-violet-300/55">
          ¿No ves el icono? Revisá tu pantalla de inicio o el cajón de aplicaciones.
        </div>
      </>
    );
  } else if (installRequested) {
    panel = (
      <PanelHeading
        icon={<Download className="h-6 w-6" />}
        title="Instalación iniciada"
        description="Terminá la instalación en el aviso del navegador. Cuando finalice, abrí GANAMOS desde tu pantalla de inicio."
      />
    );
  } else if (canUseAutomaticPrompt) {
    panel = (
      <>
        <div className="flex items-center gap-3 rounded-2xl border border-violet-500/15 bg-violet-500/[0.06] px-3 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/15 text-violet-200">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[12px] font-extrabold text-white">Instalación oficial</p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-violet-300/55">
              Se abrirá el instalador de tu navegador. Sin tiendas ni pasos extra.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInstall}
          disabled={installing}
          aria-busy={installing}
          className={`${primaryButtonClass} mt-3.5`}
        >
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent" />
          {installing ? (
            <Loader2 className="relative h-5 w-5 animate-spin" />
          ) : (
            <Download className="relative h-5 w-5" />
          )}
          <span className="relative">
            {installing ? 'Abriendo instalador…' : 'Instalar GANAMOS'}
          </span>
          {!installing && (
            <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
      </>
    );
  } else if (environment === 'ios-safari') {
    panel = (
      <>
        <PanelHeading
          icon={<Share className="h-6 w-6" />}
          title="Instalá GANAMOS en tu iPhone"
          description="Safari no permite instalar apps automáticamente, pero podés agregarla en segundos."
        />
        <StepsList
          steps={[
            {
              icon: <Share className="h-3.5 w-3.5" />,
              title: 'Tocá Compartir en la barra de Safari.',
            },
            {
              icon: <PlusSquare className="h-3.5 w-3.5" />,
              title: 'Elegí “Añadir a pantalla de inicio”.',
            },
            {
              icon: <Check className="h-3.5 w-3.5" />,
              title: 'Tocá “Agregar” y abrí GANAMOS desde el icono.',
            },
          ]}
        />
        <p className="mt-3 text-center text-[10.5px] leading-relaxed text-violet-300/50">
          Al abrirla desde el icono vas a acceder a la app completa.
        </p>
      </>
    );
  } else if (environment === 'ios-other') {
    panel = (
      <>
        <PanelHeading
          icon={<Globe2 className="h-6 w-6" />}
          title="Abrí GANAMOS en Safari"
          description="En iPhone y iPad, la instalación desde la pantalla de inicio se realiza desde Safari."
        />
        <StepsList
          steps={[
            {
              icon: <Copy className="h-3.5 w-3.5" />,
              title: 'Copiá el enlace de GANAMOS.',
            },
            {
              icon: <Globe2 className="h-3.5 w-3.5" />,
              title: 'Abrilo en Safari.',
            },
            {
              icon: <Share className="h-3.5 w-3.5" />,
              title: 'Compartir → Añadir a pantalla de inicio → Agregar.',
            },
          ]}
        />
        {copyLinkBlock}
      </>
    );
  } else if (environment === 'in-app') {
    panel = (
      <>
        <PanelHeading
          icon={<Globe2 className="h-6 w-6" />}
          title="Abrí GANAMOS en tu navegador"
          description="Estás viendo esta página dentro de otra aplicación. Para instalar GANAMOS, abrí el enlace en un navegador compatible."
        />
        <StepsList
          steps={[
            {
              icon: <Menu className="h-3.5 w-3.5" />,
              title: 'Abrí el menú de esta aplicación.',
              description: 'Buscá el botón ⋯ o “Abrir en el navegador”.',
            },
            {
              icon: <Globe2 className="h-3.5 w-3.5" />,
              title: 'Continuá en Chrome, Brave, Edge o Safari.',
            },
            {
              icon: <Download className="h-3.5 w-3.5" />,
              title: 'Instalá GANAMOS desde allí.',
            },
          ]}
        />
        {copyLinkBlock}
      </>
    );
  } else if (environment === 'chromium') {
    panel = preparing ? (
      <PanelHeading
        icon={<Loader2 className="h-6 w-6 animate-spin" />}
        title="Preparando la instalación…"
        description="Estamos verificando el instalador de tu navegador. Esto puede tardar unos segundos."
      />
    ) : (
      <>
        <PanelHeading
          icon={<Download className="h-6 w-6" />}
          title="Instalá GANAMOS desde el menú"
          description="Tu navegador permite instalar la app, pero el instalador automático no está disponible en este momento."
        />
        <StepsList steps={manualSteps} />
        {copyLinkBlock}
      </>
    );
  } else {
    panel = (
      <>
        <PanelHeading
          icon={<Globe2 className="h-6 w-6" />}
          title="Abrí GANAMOS en un navegador compatible"
          description="Este navegador no ofrece la instalación automática de GANAMOS. Abrí esta dirección en uno de los navegadores recomendados."
        />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {['Chrome', 'Brave', 'Edge', 'Safari'].map((browser) => (
            <div
              key={browser}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-violet-500/15 bg-[#0a0318]/60 px-2.5 py-2 text-[10.5px] font-semibold text-violet-200/75"
            >
              <MonitorSmartphone className="h-3.5 w-3.5 text-violet-400/70" />
              {browser}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[10.5px] leading-relaxed text-violet-300/50">
          En Android o escritorio: Chrome, Brave o Edge.
          <br />
          En iPhone/iPad: Safari.
        </p>
        {copyLinkBlock}
      </>
    );
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto bg-[#05010a] text-white">
      {/* Iluminación ambiental violeta */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[110px]" />
        <div className="absolute bottom-[-160px] left-[-110px] h-[360px] w-[360px] rounded-full bg-purple-900/20 blur-[100px]" />
        <div className="absolute right-[-130px] top-1/3 h-[300px] w-[300px] rounded-full bg-indigo-700/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(168, 85, 247, 0.35) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
      </div>

      <main
        className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col items-center justify-center px-5 py-10 sm:px-7"
        style={{
          paddingTop: 'max(2.5rem, env(safe-area-inset-top))',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1.25rem, env(safe-area-inset-left))',
          paddingRight: 'max(1.25rem, env(safe-area-inset-right))',
        }}
      >
        <div className="w-full">
          <div className="animate-screen-fade flex flex-col items-center text-center">
            <GanamosLogo size="lg" showSubtitle={false} />

            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.18em] text-violet-300">
              <Sparkles className="h-3 w-3" />
              Aplicación oficial
            </div>

            <h1 className="mt-5 text-[28px] font-black leading-[1.04] tracking-tight text-white sm:text-[34px]">
              TU EXPERIENCIA
              <span className="mt-1 block bg-gradient-to-r from-violet-300 via-purple-200 to-white bg-clip-text text-transparent">
                GANAMOS
              </span>
            </h1>

            <p className="mt-3 max-w-[330px] text-[13px] leading-relaxed text-violet-200/65 sm:text-sm">
              Para disfrutar de todas las funciones, instalá nuestra aplicación oficial.
            </p>
          </div>

          <section
            className="animate-screen-fade relative mt-7 w-full overflow-hidden rounded-[26px] border border-violet-500/20 bg-gradient-to-b from-[#140829]/95 to-[#0b0318]/95 shadow-[0_18px_60px_rgba(76,29,149,0.25)] backdrop-blur-xl"
            style={{ animationDelay: '80ms' }}
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/35 to-transparent" />
            <div className="relative p-4 sm:p-5">
              {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}
              {panel}
            </div>
          </section>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10.5px] leading-relaxed text-violet-300/55">
            <Smartphone className="h-3.5 w-3.5 shrink-0 text-violet-400/70" />
            Accedé directamente desde tu pantalla de inicio.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-semibold text-violet-300/45">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-400/60" />
              Aplicación oficial
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-violet-400/60" />
              Acceso seguro
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
