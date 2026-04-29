/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sun, 
  MapPin, 
  Cloud, 
  Building2, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Copy,
  FileJson,
  RefreshCw,
  ChevronRight,
  Image as ImageIcon,
  Globe,
  ChevronDown,
  Lock,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContextInfo, PromptResult } from './types';
import { generateArchitecturalPrompts } from './services/geminiService';

import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './services/firebase';

const LANGUAGES = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
];

const TRANSLATIONS: Record<string, any> = {
  pt: {
    headerTitle: 'ArchPrompt',
    headerBadge: 'AI',
    systemOnline: 'System Online',
    loginTitle: 'Acesso',
    loginSubtitle: 'Faça login para gerar prompts de arquitetura.',
    email: 'Email',
    emailPlaceholder: 'Ex: arquiteto@studio.com',
    password: 'Senha',
    passwordPlaceholder: '••••••••',
    enter: 'Entrar',
    
    startProcess: 'Início do Processo',
    continueProcess: 'Continuação do Projeto',
    startDesc: 'Para gerar prompts hiper-realistas, precisamos analisar sua cena e entender o contexto do projeto.',
    continueDesc: 'Suba uma nova cena (print) e referência de luz. O sistema irá reaproveitar o "DNA de Materiais" gerado na cena anterior para manter a consistência visual do seu projeto.',
    dnaLocked: 'DNA de Materiais travado na sessão anterior',
    
    scenePrint: '1. Print da Cena (Arquitetura e Materiais)',
    clickScene: 'Clique para enviar o print da cena',
    lightRef: '2. Referência de Iluminação',
    clickLight: 'Clique para enviar a referência de luz',
    
    contextInfo: 'Informações do Contexto',
    country: 'País',
    countryPlaceholder: 'Ex: Brasil',
    city: 'Cidade / Região',
    cityPlaceholder: 'Ex: São Paulo',
    projectType: 'Tipo de Projeto',
    projectTypePlaceholder: 'Ex: Residencial de Luxo',
    neighbors: 'Vizinhos',
    neighborsPlaceholder: 'Ex: Casas modernas, área arborizada',
    climate: 'Clima Predominante',
    climatePlaceholder: 'Ex: Ensolarado, Tropical',
    
    startAnalysis: 'Iniciar Análise',
    startingAgents: 'Iniciando Agentes...',
    
    generatedPromptsTitle: 'Prompts Gerados',
    generatedPromptsDesc: '4 variações hiper-detalhadas prontas para uso.',
    newProject: 'Novo Projeto',
    
    copyText: 'Copiar Texto',
    copyJson: 'Copiar JSON',
    copied: 'Copiado!',
    
    mainPrompt: 'Prompt Principal',
    negativePrompt: 'Negative Prompt',
    
    processingAgents: 'Processando Agentes',
    processingDesc: 'Nossos 7 agentes especializados estão analisando cada detalhe da sua cena para garantir o máximo realismo.',
    agents: [
      'Analista de Cena extraindo volumetria...',
      'Diretor de Arte definindo narrativa estética...',
      'Especialista em Materiais refinando texturas PBR...',
      'Especialista em Fotografia ajustando exposição...',
      'Especialista em Iluminação aplicando referências...',
      'Especialista em Pós-Produção finalizando cores...',
      'Consolidador unificando prompts finais...'
    ],
    errorGenerating: 'Ocorreu um erro ao gerar os prompts. Por favor, tente novamente.'
  },
  en: {
    headerTitle: 'ArchPrompt',
    headerBadge: 'AI',
    systemOnline: 'System Online',
    loginTitle: 'Access',
    loginSubtitle: 'Log in to generate architectural prompts.',
    email: 'Email',
    emailPlaceholder: 'Ex: architect@studio.com',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    enter: 'Login',
    
    startProcess: 'Process Start',
    continueProcess: 'Project Continuation',
    startDesc: 'To generate hyper-realistic prompts, we need to analyze your scene and understand the project context.',
    continueDesc: 'Upload a new scene (screenshot) and light reference. The system will reuse the "Material DNA" generated in the previous scene to maintain visual consistency for your project.',
    dnaLocked: 'Material DNA locked from previous session',
    
    scenePrint: '1. Scene Print (Architecture and Materials)',
    clickScene: 'Click to upload scene print',
    lightRef: '2. Lighting Reference',
    clickLight: 'Click to upload lighting reference',
    
    contextInfo: 'Context Information',
    country: 'Country',
    countryPlaceholder: 'Ex: USA',
    city: 'City / Region',
    cityPlaceholder: 'Ex: New York',
    projectType: 'Project Type',
    projectTypePlaceholder: 'Ex: Luxury Residential',
    neighbors: 'Neighbors',
    neighborsPlaceholder: 'Ex: Modern houses, wooded area',
    climate: 'Predominant Climate',
    climatePlaceholder: 'Ex: Sunny, Tropical',
    
    startAnalysis: 'Start Analysis',
    startingAgents: 'Starting Agents...',
    
    generatedPromptsTitle: 'Generated Prompts',
    generatedPromptsDesc: '4 hyper-detailed variations ready for use.',
    newProject: 'New Project',
    
    copyText: 'Copy Text',
    copyJson: 'Copy JSON',
    copied: 'Copied!',
    
    mainPrompt: 'Main Prompt',
    negativePrompt: 'Negative Prompt',
    
    processingAgents: 'Processing Agents',
    processingDesc: 'Our 7 specialized agents are analyzing every detail of your scene to ensure maximum realism.',
    agents: [
      'Scene Analyst extracting volumetry...',
      'Art Director defining aesthetic narrative...',
      'Materials Expert refining PBR textures...',
      'Photography Expert adjusting exposure...',
      'Lighting Expert applying references...',
      'Post-Production Expert finalizing colors...',
      'Consolidator unifying final prompts...'
    ],
    errorGenerating: 'An error occurred while generating prompts. Please try again.'
  },
  es: {
    headerTitle: 'ArchPrompt',
    headerBadge: 'AI',
    systemOnline: 'Sistema en línea',
    loginTitle: 'Acceso',
    loginSubtitle: 'Inicia sesión para generar prompts arquitectónicos.',
    email: 'Correo',
    emailPlaceholder: 'Ej: arquitecto@studio.com',
    password: 'Contraseña',
    passwordPlaceholder: '••••••••',
    enter: 'Entrar',
    
    startProcess: 'Inicio del Proceso',
    continueProcess: 'Continuación del Proyecto',
    startDesc: 'Para generar prompts hiperrealistas, necesitamos analizar tu escena y comprender el contexto del proyecto.',
    continueDesc: 'Sube una nueva escena (captura) y referencia de luz. El sistema reutilizará el "ADN de Materiales" de la escena anterior para mantener la consistencia.',
    dnaLocked: 'ADN de Materiales bloqueado de la sesión anterior',
    
    scenePrint: '1. Captura de la Escena (Arquitectura)',
    clickScene: 'Haz clic para subir la captura de la escena',
    lightRef: '2. Referencia de Iluminación',
    clickLight: 'Haz clic para subir la referencia de luz',
    
    contextInfo: 'Información del Contexto',
    country: 'País',
    countryPlaceholder: 'Ej: España',
    city: 'Ciudad / Región',
    cityPlaceholder: 'Ej: Madrid',
    projectType: 'Tipo de Proyecto',
    projectTypePlaceholder: 'Ej: Residencial de Lujo',
    neighbors: 'Vecinos',
    neighborsPlaceholder: 'Ej: Casas modernas, área boscosa',
    climate: 'Clima Predominante',
    climatePlaceholder: 'Ej: Soleado, Tropical',
    
    startAnalysis: 'Iniciar Análisis',
    startingAgents: 'Iniciando Agentes...',
    
    generatedPromptsTitle: 'Prompts Generados',
    generatedPromptsDesc: '4 variaciones hiperdetalladas listas para usar.',
    newProject: 'Nuevo Proyecto',
    
    copyText: 'Copiar Texto',
    copyJson: 'Copiar JSON',
    copied: '¡Copiado!',
    
    mainPrompt: 'Prompt Principal',
    negativePrompt: 'Prompt Negativo',
    
    processingAgents: 'Procesando Agentes',
    processingDesc: 'Nuestros 7 agentes están analizando cada detalle para asegurar el máximo realismo.',
    agents: [
      'Analista de Escena extrayendo volumetría...',
      'Director de Arte definiendo la narrativa...',
      'Experto en Materiales refinando texturas PBR...',
      'Experto en Fotografía ajustando exposición...',
      'Experto en Iluminación aplicando referencias...',
      'Experto en Post-Producción finalizando colores...',
      'Consolidador unificando prompts finales...'
    ],
    errorGenerating: 'Ocurrió un error al generar los prompts. Por favor, inténtalo de nuevo.'
  },
  ar: {
    headerTitle: 'ArchPrompt',
    headerBadge: 'AI',
    systemOnline: 'النظام متصل',
    loginTitle: 'تسجيل الدخول',
    loginSubtitle: 'قم بتسجيل الدخول لإنشاء مطالبات معمارية.',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'مثال: architect@studio.com',
    password: 'كلمة المرور',
    passwordPlaceholder: '••••••••',
    enter: 'دخول',
    
    startProcess: 'بداية العملية',
    continueProcess: 'استمرار المشروع',
    startDesc: 'لإنشاء مطالبات واقعية للغاية، نحتاج إلى تحليل المشهد الخاص بك وفهم سياق المشروع.',
    continueDesc: 'قم بتحميل مشهد جديد (لقطة شاشة) ومرجع الضوء. سيعيد النظام استخدام "الحمض النووي للمواد" للحفاظ على الاتساق.',
    dnaLocked: 'تم تأمين الحمض النووي للمواد من الجلسة السابقة',
    
    scenePrint: '1. طباعة المشهد (الهندسة المعمارية)',
    clickScene: 'انقر لتحميل لقطة المشهد',
    lightRef: '2. مرجع الإضاءة',
    clickLight: 'انقر لتحميل مرجع الضوء',
    
    contextInfo: 'معلومات السياق',
    country: 'دولة',
    countryPlaceholder: 'مثال: الإمارات',
    city: 'المدينة / المنطقة',
    cityPlaceholder: 'مثال: دبي',
    projectType: 'نوع المشروع',
    projectTypePlaceholder: 'مثال: سكني فاخر',
    neighbors: 'الجيران',
    neighborsPlaceholder: 'مثال: منازل حديثة، الغابات',
    climate: 'المناخ السائد',
    climatePlaceholder: 'مثال: مشمس، استوائي',
    
    startAnalysis: 'بدء التحليل',
    startingAgents: 'بدء الوكلاء...',
    
    generatedPromptsTitle: 'المطالبات المولدة',
    generatedPromptsDesc: '4 أشكال مفصلة للغاية جاهزة للاستخدام.',
    newProject: 'مشروع جديد',
    
    copyText: 'نسخ النص',
    copyJson: 'نسخ JSON',
    copied: 'تم النسخ!',
    
    mainPrompt: 'المطالبة الرئيسية',
    negativePrompt: 'المطالبة السلبية',
    
    processingAgents: 'وكلاء المعالجة',
    processingDesc: 'يقوم 7 وكلاء متخصصين لدينا بتحليل كل تفاصيل المشهد الخاص بك لضمان أقصى قدر من الواقعية.',
    agents: [
      'محلل المشهد يستخرج الحجم...',
      'المدير الفني يحدد السرد الجمالي...',
      'خبير المواد يحسن قوام PBR...',
      'خبير التصوير يضبط التعرض...',
      'خبير الإضاءة يطبق المراجع...',
      'خبير ما بعد الإنتاج يضع اللمسات الأخيرة...',
      'موحد يدمج المطالبات النهائية...'
    ],
    errorGenerating: 'حدث خطأ أثناء إنشاء المطالبات. يرجى المحاولة مرة أخرى.'
  }
};

export default function App() {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState('pt');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [archImage, setArchImage] = useState<string | null>(null);
  const [lightImage, setLightImage] = useState<string | null>(null);
  const [context, setContext] = useState<ContextInfo>({
    country: '',
    city: '',
    projectType: '',
    neighbors: '',
    climate: ''
  });
  const [results, setResults] = useState<PromptResult[]>([]);
  const [copiedState, setCopiedState] = useState<{ index: number, type: 'text' | 'json' } | null>(null);
  const [isDraggingArch, setIsDraggingArch] = useState(false);
  const [isDraggingLight, setIsDraggingLight] = useState(false);

  const [lockedMaterials, setLockedMaterials] = useState<string>('');

  const archInputRef = useRef<HTMLInputElement>(null);
  const lightInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStep(1);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          setStep(1);
        } catch (createErr: any) {
          alert('Erro na autenticação: ' + createErr.message + '\n\nCertifique-se de que "Email/Password" está ativado no Firebase Console (Authentication > Sign-in method).');
        }
      } else {
        alert('Erro na autenticação: ' + err.message);
      }
    }
  };

  const processFile = (file: File, type: 'arch' | 'light') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'arch') setArchImage(reader.result as string);
      else setLightImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'arch' | 'light') => {
    const file = e.target.files?.[0];
    if (file) processFile(file, type);
  };

  const handleDragOver = (e: React.DragEvent, type: 'arch' | 'light') => {
    e.preventDefault();
    if (type === 'arch') setIsDraggingArch(true);
    else setIsDraggingLight(true);
  };

  const handleDragLeave = (e: React.DragEvent, type: 'arch' | 'light') => {
    e.preventDefault();
    if (type === 'arch') setIsDraggingArch(false);
    else setIsDraggingLight(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'arch' | 'light') => {
    e.preventDefault();
    if (type === 'arch') setIsDraggingArch(false);
    else setIsDraggingLight(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file, type);
    }
  };

  const handleSubmit = async () => {
    if (!archImage || !lightImage) return;
    setLoading(true);
    try {
      const data = await generateArchitecturalPrompts(archImage, lightImage, context);
      setResults(data.prompts);
      if (data.lockedMaterials) {
        setLockedMaterials(data.lockedMaterials);
        setContext(prev => ({ ...prev, lockedMaterials: data.lockedMaterials }));
      }
      setStep(3);
    } catch (error) {
      console.error('Error generating prompts:', error);
      alert(t.errorGenerating);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number, type: 'text' | 'json') => {
    navigator.clipboard.writeText(text);
    setCopiedState({ index, type });
    setTimeout(() => setCopiedState(null), 2000);
  };

  const resetAll = () => {
    setStep(1);
    setArchImage(null);
    setLightImage(null);
    setResults([]);
    setLockedMaterials('');
    setContext({
      country: '',
      city: '',
      projectType: '',
      neighbors: '',
      climate: '',
      lockedMaterials: ''
    });
  };

  const continueProject = () => {
    setStep(1);
    // Removemos os prints para o usuário subir as novas cenas,
    // mas MANTEREMOS os textos do contexto e os lockedMaterials.
    setArchImage(null);
    setLightImage(null);
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 font-sans selection:bg-orange-500/30" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-white">{t.headerTitle} <span className="text-orange-500">{t.headerBadge}</span></h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {t.systemOnline}
            </span>
            <span className="hidden sm:block">v1.0.4</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto relative pt-8"
            >
              <div className="flex justify-end mb-6 relative z-50">
                <div className="relative">
                  <button 
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all"
                  >
                    <Globe className="w-4 h-4 text-orange-500" />
                    {LANGUAGES.find(l => l.code === language)?.name}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showLangMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1D] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[100]"
                      >
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              setShowLangMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors ${language === lang.code ? 'bg-orange-500/10 text-orange-400' : 'text-slate-300'}`}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            {lang.name}
                            {language === lang.code && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-3xl rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10 space-y-8">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
                      <Sparkles className="w-8 h-8 text-black" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{t.loginTitle}</h2>
                    <p className="text-slate-400 text-sm">{t.loginSubtitle}</p>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-500 uppercase">{t.email}</label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                          type="email" 
                          placeholder={t.emailPlaceholder}
                          className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-500 uppercase">{t.password}</label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                          type="password" 
                          placeholder={t.passwordPlaceholder}
                          className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={!email || !password}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
                    >
                      {t.enter} <ChevronRight className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white tracking-tight">
                  {lockedMaterials ? t.continueProcess : t.startProcess}
                </h2>
                <p className="text-slate-400 max-w-2xl">
                  {lockedMaterials 
                    ? t.continueDesc
                    : t.startDesc}
                </p>
                {lockedMaterials && (
                  <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-lg text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    {t.dnaLocked}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Arch Print Upload */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                    {t.scenePrint}
                  </label>
                  <div 
                    onClick={() => archInputRef.current?.click()}
                    onDragOver={(e) => handleDragOver(e, 'arch')}
                    onDragLeave={(e) => handleDragLeave(e, 'arch')}
                    onDrop={(e) => handleDrop(e, 'arch')}
                    className={`aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group
                      ${archImage ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'}
                      ${isDraggingArch ? 'border-orange-500 bg-orange-500/10 scale-[1.02]' : ''}`}
                  >
                    {archImage ? (
                      <img src={archImage} alt="Arch Preview" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500">{t.clickScene}</p>
                      </>
                    )}
                    <input type="file" ref={archInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'arch')} accept="image/*" />
                  </div>
                </div>

                {/* Lighting Ref Upload */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-orange-500" />
                    {t.lightRef}
                  </label>
                  <div 
                    onClick={() => lightInputRef.current?.click()}
                    onDragOver={(e) => handleDragOver(e, 'light')}
                    onDragLeave={(e) => handleDragLeave(e, 'light')}
                    onDrop={(e) => handleDrop(e, 'light')}
                    className={`aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group
                      ${lightImage ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'}
                      ${isDraggingLight ? 'border-orange-500 bg-orange-500/10 scale-[1.02]' : ''}`}
                  >
                    {lightImage ? (
                      <img src={lightImage} alt="Light Preview" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500">{t.clickLight}</p>
                      </>
                    )}
                    <input type="file" ref={lightInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'light')} accept="image/*" />
                  </div>
                </div>
              </div>

              {/* Context Form */}
              <div className="bg-white/5 rounded-3xl p-8 border border-white/10 space-y-8">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-white">{t.contextInfo}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-500 uppercase">{t.country}</label>
                    <input 
                      type="text" 
                      placeholder={t.countryPlaceholder}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                      value={context.country}
                      onChange={e => setContext({...context, country: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-500 uppercase">{t.city}</label>
                    <input 
                      type="text" 
                      placeholder={t.cityPlaceholder}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                      value={context.city}
                      onChange={e => setContext({...context, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-500 uppercase">{t.projectType}</label>
                    <input 
                      type="text" 
                      placeholder={t.projectTypePlaceholder}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                      value={context.projectType}
                      onChange={e => setContext({...context, projectType: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-500 uppercase">{t.neighbors}</label>
                    <input 
                      type="text" 
                      placeholder={t.neighborsPlaceholder}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                      value={context.neighbors}
                      onChange={e => setContext({...context, neighbors: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-500 uppercase">{t.climate}</label>
                    <input 
                      type="text" 
                      placeholder={t.climatePlaceholder}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                      value={context.climate}
                      onChange={e => setContext({...context, climate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={!archImage || !lightImage || !context.country || loading}
                    onClick={handleSubmit}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t.startingAgents}
                      </>
                    ) : (
                      <>
                        {t.startAnalysis}
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {archImage && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shadow-2xl ring-2 ring-orange-500/20">
                        <img src={archImage} alt="Referência" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <h2 className="text-4xl font-bold text-white tracking-tight">{t.generatedPromptsTitle}</h2>
                      <p className="text-slate-400">{t.generatedPromptsDesc}</p>
                    </div>
                  </div>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                  <button 
                    onClick={resetAll}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-all px-4 py-2 rounded-lg hover:bg-white/10"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t.newProject}
                  </button>
                  <button 
                    onClick={continueProject}
                    className="flex items-center gap-2 text-sm font-medium text-white transition-all px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                  >
                    {t.continueProcess}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {results.map((res, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group"
                  >
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-mono text-sm font-bold">
                          0{idx + 1}
                        </span>
                        <h4 className="text-lg font-bold text-white uppercase tracking-wider">{res.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => copyToClipboard(`PROMPT:\n${res.prompt}\n\nNEGATIVE PROMPT:\n${res.negativePrompt}`, idx, 'text')}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium"
                        >
                          {copiedState?.index === idx && copiedState?.type === 'text' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          {copiedState?.index === idx && copiedState?.type === 'text' ? t.copied : t.copyText}
                        </button>
                        <button 
                          onClick={() => copyToClipboard(JSON.stringify(res, null, 2), idx, 'json')}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium"
                        >
                          {copiedState?.index === idx && copiedState?.type === 'json' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <FileJson className="w-4 h-4" />
                          )}
                          {copiedState?.index === idx && copiedState?.type === 'json' ? t.copied : t.copyJson}
                        </button>
                      </div>
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">{t.mainPrompt}</label>
                        <p className="text-slate-300 leading-relaxed text-sm font-light">
                          {res.prompt}
                        </p>
                      </div>
                      <div className="space-y-3 pt-6 border-t border-white/5">
                        <label className="text-[10px] font-mono text-red-500/70 uppercase tracking-[0.2em]">{t.negativePrompt}</label>
                        <p className="text-slate-500 text-xs italic">
                          {res.negativePrompt}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-md w-full space-y-12 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-[100px] rounded-full" />
                <Loader2 className="w-20 h-20 text-orange-500 animate-spin mx-auto relative z-10" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">{t.processingAgents}</h3>
                <p className="text-slate-400 text-sm">
                  {t.processingDesc}
                </p>
              </div>

              <div className="space-y-3 text-left">
                {t.agents.map((text: string, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.8 }}
                    className="flex items-center gap-3 text-xs font-mono"
                  >
                    <div className="w-1 h-1 rounded-full bg-orange-500" />
                    <span className="text-slate-500">{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
