import React, { useState, useEffect } from 'react';
import { 
  Search, 
  History, 
  Lightbulb, 
  Settings, 
  Lock, 
  TriangleAlert, 
  RefreshCcw, 
  ChevronRight,
  Loader2,
  MailWarning,
  GlobeLock,
  CheckSquare,
  Trash2,
  ArrowLeft,
  Moon,
  Globe,
  Bell
} from 'lucide-react';

type RiskLevel = 'safe' | 'doubt' | 'danger';
type ViewState = 'analyze' | 'loading' | 'result' | 'history' | 'tips' | 'details' | 'settings';

const TRANSLATIONS = {
  'es-AR': {
    analyze_title: 'Analizá tu correo',
    analyze_desc: 'Pegá acá el contenido del correo que te genere dudas y dejá que la IA lo analice.',
    analyze_placeholder: 'Pegá aquí el cuerpo del correo...',
    analyze_btn: 'ANALIZAR CORREO',
    privacy_title: 'Tu privacidad es importante',
    privacy_desc: 'No guardamos ni compartimos el contenido de tus correos.',
    analyzing: 'Analizando contenido...',
    detecting: 'Detectando patrones de phishing',
    prob_title: 'Probabilidad de phishing',
    high_risk: 'Alto Riesgo',
    med_risk: 'Riesgo Medio',
    low_risk: 'Bajo Riesgo',
    reason_why: '¿Por qué lo marcamos así?',
    danger_tip: 'Este correo tiene una alta probabilidad de ser malicioso. Te recomendamos',
    danger_highlight: 'no hacer clic en enlaces ni descargar archivos adjuntos',
    danger_end: '.',
    doubt_tip: 'Este correo muestra señales mixtas.',
    doubt_highlight: 'Mantené precaución',
    doubt_end: 'antes de proporcionar datos o hacer clic.',
    safe_tip: 'Este correo parece legítimo.',
    safe_highlight: 'Sin embargo, siempre tené cuidado',
    safe_end: 'con la información que compartís.',
    details_btn: 'VER DETALLES DEL ANÁLISIS',
    another_btn: 'ANALIZAR OTRO CORREO',
    history_title: 'Historial',
    history_sub: 'TUS ANÁLISIS',
    history_search: 'Buscar en el historial...',
    history_all: 'Todos',
    history_empty: 'No realizaste análisis todavía.',
    history_notfound: 'No se encontraron resultados para tu búsqueda.',
    clear_btn: 'BORRAR TODO',
    tips_title: 'Consejos',
    tips_sub: 'CONSEJOS ANTI-PHISHING',
    details_title: 'Detalles del Análisis',
    advice: 'Consejo',
    advice_desc: 'No hagas clic en enlaces ni descargues archivos de remitentes desconocidos.',
    nav_analyze: 'Analizar',
    nav_history: 'Historial',
    nav_tips: 'Consejos',
    nav_settings: 'Ajustes',
    set_title: 'Ajustes',
    set_sub: 'Configuración de la app',
    set_lang: 'Idioma',
    set_theme: 'Tema Visual',
    set_dark: 'Oscuro',
    set_light: 'Claro',
    set_notif: 'Notificaciones',
    set_push: 'Notificaciones Push',
    set_push_desc: 'Alertas de nuevos análisis',
    set_email: 'Correos del sistema',
    set_email_desc: 'Novedades y reportes',
    date_label: 'Fecha de análisis',
    id_label: 'ID de análisis',
    body_label: 'Cuerpo del correo',
    score_label: 'Probabilidad'
  },
  'en-US': {
    analyze_title: 'Analyze your email',
    analyze_desc: 'Paste the content of the email you are unsure about and let the AI analyze it.',
    analyze_placeholder: 'Paste email body here...',
    analyze_btn: 'ANALYZE EMAIL',
    privacy_title: 'Your privacy matters',
    privacy_desc: 'We do not store or share the content of your emails.',
    analyzing: 'Analyzing content...',
    detecting: 'Detecting phishing patterns',
    prob_title: 'Phishing Probability',
    high_risk: 'High Risk',
    med_risk: 'Medium Risk',
    low_risk: 'Low Risk',
    reason_why: 'Why did we flag it like this?',
    danger_tip: 'This email has a high probability of being malicious. We recommend',
    danger_highlight: 'not clicking on links or downloading attachments',
    danger_end: '.',
    doubt_tip: 'This email shows mixed signals.',
    doubt_highlight: 'Exercise caution',
    doubt_end: 'before providing data or clicking.',
    safe_tip: 'This email seems legitimate.',
    safe_highlight: 'However, always be careful',
    safe_end: 'with the information you share.',
    details_btn: 'VIEW ANALYSIS DETAILS',
    another_btn: 'ANALYZE ANOTHER EMAIL',
    history_title: 'History',
    history_sub: 'YOUR ANALYSES',
    history_search: 'Search history...',
    history_all: 'All',
    history_empty: 'No analyses performed yet.',
    history_notfound: 'No results found for your search.',
    clear_btn: 'CLEAR ALL',
    tips_title: 'Tips',
    tips_sub: 'ANTI-PHISHING TIPS',
    details_title: 'Analysis Details',
    advice: 'Advice',
    advice_desc: 'Do not click on links or download files from unknown senders.',
    nav_analyze: 'Analyze',
    nav_history: 'History',
    nav_tips: 'Tips',
    nav_settings: 'Settings',
    set_title: 'Settings',
    set_sub: 'App configuration',
    set_lang: 'Language',
    set_theme: 'Visual Theme',
    set_dark: 'Dark',
    set_light: 'Light',
    set_notif: 'Notifications',
    set_push: 'Push Notifications',
    set_push_desc: 'Alerts for new analyses',
    set_email: 'System Emails',
    set_email_desc: 'News and reports',
    date_label: 'Analysis date',
    id_label: 'Analysis ID',
    body_label: 'Email body',
    score_label: 'Probability'
  }
};

interface HistoryItem {
  id: string;
  date: string;
  score: number;
  level: RiskLevel;
  snippet: string;
  reasons: string[];
  fullText?: string;
}

export default function App() {
  const [view, setView] = useState<ViewState>('analyze');
  const [detailsOrigin, setDetailsOrigin] = useState<'result' | 'history'>('result');
  const [text, setText] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<HistoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all');
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailAddress, setEmailAddress] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<'es-AR' | 'en-US'>('es-AR');

  useEffect(() => {
    const storedHistory = localStorage.getItem('avivate_history');
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error('Failed to parse history');
      }
    }
    
    const storedSettings = localStorage.getItem('avivate_settings');
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        if (parsed.pushEnabled !== undefined) setPushEnabled(parsed.pushEnabled);
        if (parsed.emailAddress !== undefined) setEmailAddress(parsed.emailAddress);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.language) setLanguage(parsed.language);
      } catch {}
    }
  }, []);

  const saveSettings = (newSettings: any) => {
    const updated = { pushEnabled, emailAddress, theme, language, ...newSettings };
    localStorage.setItem('avivate_settings', JSON.stringify(updated));
    if (newSettings.pushEnabled !== undefined) setPushEnabled(newSettings.pushEnabled);
    if (newSettings.emailAddress !== undefined) setEmailAddress(newSettings.emailAddress);
    if (newSettings.theme !== undefined) setTheme(newSettings.theme);
    if (newSettings.language !== undefined) setLanguage(newSettings.language);
  };

  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS['es-AR'];

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('avivate_history');
  };

  const currentLength = text.length;
  const maxLength = 10000;

  const handleAnalyze = async () => {
    if (text.trim() === '') return;
    
    // Mostramos la pantalla de carga ("Analizando contenido...")
    setView('loading');
    
    try {
      // Petición asíncrona real a tu motor de IA
      // ANTES: const response = await fetch('http://192.168.101.24:8000/predict', {
      // AHORA: const response = await fetch('https://avivate-app-render.onrender.com', {
      const response = await fetch('https://avivate-app-render.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      
      const data = await response.json();
      
      // Convertimos el decimal (ej: 0.8754) a porcentaje entero (88)
      const score = Math.round(data.probabilidad * 100);
      
      // Determinamos el nivel de riesgo según los umbrales
      let level: RiskLevel = 'safe';
      if (score >= 70) {
        level = 'danger';
      } else if (score >= 30) {
        level = 'doubt';
      }

      // Preparamos el resumen para el historial
      const snippet = text.trim().split('\n')[0].substring(0, 30) + (text.length > 30 ? '...' : '');

      // Asignamos razones dinámicas según el análisis del modelo
      let reasons: string[] = [];
      if (level === 'danger') {
        reasons = [
           "La IA detectó un alto grado de manipulación psicológica",
           "Patrones lingüísticos consistentes con ataques de phishing"
        ];
      } else if (level === 'doubt') {
        reasons = [
           "El modelo detectó señales mixtas o inusuales",
           "Falta de contexto claro que asegure la legitimidad"
        ];
      } else {
        reasons = [
           "La estructura semántica corresponde a comunicaciones normales",
           "No se hallaron urgencias ni solicitudes sospechosas"
        ];
      }

      // Creamos el registro para el historial
      const newAnalysis: HistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(language, { dateStyle: 'medium', timeStyle: 'short' }).toUpperCase(),
        score,
        level,
        snippet: snippet || 'Correo sin asunto',
        reasons,
        fullText: text.trim()
      };

      // Actualizamos los estados y guardamos en LocalStorage
      setCurrentAnalysis(newAnalysis);
      const newHistory = [newAnalysis, ...history];
      setHistory(newHistory);
      localStorage.setItem('avivate_history', JSON.stringify(newHistory));

      // Mostramos la vista de resultados
      setView('result');

    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de red: Verifica que el servidor de FastAPI (uvicorn) esté corriendo en tu computadora.");
      setView('analyze'); // Volvemos a la pantalla principal si falla
    }
  };

  const resetAnalysis = () => {
    setText('');
    setView('analyze');
  };

  return (
    <div className={`max-w-[390px] mx-auto h-screen bg-av-bg font-sans text-white relative overflow-x-hidden flex flex-col pb-[80px] ${theme === 'light' ? 'theme-light' : ''}`}>
      
      {/* Header */}
      <header className="flex flex-col items-center justify-center p-6 pt-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-12 h-12">
            <svg viewBox="0 0 100 100" className="w-full h-full text-av-primary-green">
               <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="currentColor" strokeWidth="4"/>
               <rect x="25" y="40" width="50" height="35" fill="none" stroke="currentColor" strokeWidth="4" rx="2" />
               <polyline points="25,40 50,60 75,40" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
            <div className="absolute -bottom-1 -right-1 bg-av-bg rounded-full p-0.5">
               <Search className="w-5 h-5 text-av-accent-green" strokeWidth={3} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-white">AVIVATE<span className="text-av-accent-green">APP</span></h1>
          </div>
        </div>
        <p className="text-av-primary-green text-xs font-mono tracking-widest mt-2 uppercase opacity-80">
          &lt; Avivate antes de caer. &gt;
        </p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 hide-scrollbar flex flex-col gap-6">
        
        {view === 'analyze' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-av-accent-green">{t.analyze_title}</h2>
              <p className="text-white/70 text-sm leading-relaxed px-2">
                {t.analyze_desc}
              </p>
            </div>

            <div className="flex flex-col flex-1 gap-2">
              <div className="relative flex-1 min-h-[240px]">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t.analyze_placeholder}
                  className="w-full h-full bg-av-bg border border-av-primary-green/30 rounded-2xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-av-accent-green resize-none transition-all duration-300 active:scale-[0.99]"
                />
              </div>
              <div className="flex justify-end px-2">
                <span className="text-xs text-white/50 font-mono">{currentLength} / {maxLength} caracteres</span>
              </div>
            </div>

            <div className="bg-av-bg border border-av-primary-green/20 rounded-2xl p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-av-primary-green shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white">{t.privacy_title}</h3>
                <p className="text-xs text-white/60 mt-1">{t.privacy_desc}</p>
              </div>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={text.trim() === ''}
              className="mt-auto w-full bg-av-accent-green text-[#010D03] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 ease-in-out hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              <Search className="w-5 h-5" />
              <span>{t.analyze_btn}</span>
            </button>
          </div>
        )}

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 animate-in fade-in duration-500">
             <div className="relative">
                <div className="absolute inset-0 bg-av-accent-green/20 blur-xl rounded-full"></div>
                <Loader2 className="w-16 h-16 text-av-accent-green animate-spin relative" />
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-white">{t.analyzing}</h3>
                <p className="text-sm text-av-primary-green font-mono animate-pulse">{t.detecting}</p>
             </div>
          </div>
        )}

        {view === 'result' && currentAnalysis && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-6">
            <div className="text-center space-y-6">
              <h2 className="text-lg font-semibold text-white/90">{t.prob_title}</h2>
              
              <div className="flex flex-col items-center justify-center relative">
                 <div className={`text-[5rem] leading-none font-bold tracking-tighter ${
                   currentAnalysis.level === 'danger' ? 'text-av-danger' :
                   currentAnalysis.level === 'doubt' ? 'text-av-doubt' : 'text-av-safe'
                 }`}>
                   {currentAnalysis.score}<span className="text-4xl opacity-80">%</span>
                 </div>
                 <div className={`text-sm font-bold uppercase tracking-widest mt-2 px-3 py-1 rounded-full border ${
                   currentAnalysis.level === 'danger' ? 'text-av-danger bg-av-danger/10 border-av-danger/20' :
                   currentAnalysis.level === 'doubt' ? 'text-av-doubt bg-av-doubt/10 border-av-doubt/20' :
                   'text-av-safe bg-av-safe/10 border-av-safe/20'
                 }`}>
                    {currentAnalysis.level === 'danger' ? t.high_risk : 
                     currentAnalysis.level === 'doubt' ? t.med_risk : t.low_risk}
                 </div>
              </div>

               {/* Progress bar line */}
              <div className="w-full h-2 bg-av-bg border border-white/10 rounded-full overflow-hidden mt-2 relative">
                 <div className={`absolute top-0 left-0 h-full rounded-full relative transition-all duration-1000 ease-out ${
                   currentAnalysis.level === 'danger' ? 'bg-av-danger' :
                   currentAnalysis.level === 'doubt' ? 'bg-av-doubt' : 'bg-av-safe'
                 }`} style={{ width: `${currentAnalysis.score}%` }}>
                    <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#010D03] scale-[1.5] ${
                      currentAnalysis.level === 'danger' ? 'bg-av-danger' :
                      currentAnalysis.level === 'doubt' ? 'bg-av-doubt' : 'bg-av-safe'
                    }`}></div>
                 </div>
              </div>
            </div>

            <div className={`border rounded-2xl p-5 flex items-start gap-4 mt-2 ${
              currentAnalysis.level === 'danger' ? 'bg-av-card-danger border-av-danger/40' :
              currentAnalysis.level === 'doubt' ? 'bg-av-card-doubt border-av-doubt/40' :
              'bg-av-card-safe border-av-safe/40'
            }`}>
              <TriangleAlert className={`w-7 h-7 shrink-0 ${
                currentAnalysis.level === 'danger' ? 'text-av-danger drop-shadow-[0_0_8px_rgba(242,65,65,0.5)]' :
                currentAnalysis.level === 'doubt' ? 'text-av-doubt drop-shadow-[0_0_8px_rgba(248,195,64,0.5)]' :
                'text-av-safe drop-shadow-[0_0_8px_rgba(118,217,48,0.5)]'
              }`} />
              <p className="text-sm text-white/90 leading-relaxed">
                {currentAnalysis.level === 'danger' ? (
                  <>{t.danger_tip} <strong className="text-av-danger">{t.danger_highlight}</strong>{t.danger_end || '.'}</>
                ) : currentAnalysis.level === 'doubt' ? (
                  <>{t.doubt_tip} <strong className="text-av-doubt">{t.doubt_highlight}</strong> {t.doubt_end}</>
                ) : (
                  <>{t.safe_tip} <strong className="text-av-safe">{t.safe_highlight}</strong> {t.safe_end}</>
                )}
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={() => setView('details')}
                className="w-full bg-transparent border border-av-primary-green text-av-primary-green font-bold py-4 rounded-2xl transition-all duration-300 ease-in-out hover:bg-av-primary-green/10 active:scale-95"
              >
                {t.details_btn}
              </button>
              <button 
                onClick={resetAnalysis}
                className="w-full bg-transparent text-white/70 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 ease-in-out hover:text-white active:scale-95"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>{t.another_btn}</span>
              </button>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6 w-full">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                 <h2 className="text-2xl font-bold text-white">{t.history_title}</h2>
                 <p className="text-av-primary-green text-sm font-semibold tracking-wider uppercase">{t.history_sub}</p>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 text-av-danger text-xs font-bold tracking-wide hover:brightness-110 active:scale-95 transition-all mb-0.5 bg-av-danger/10 px-3 py-1.5 rounded-lg border border-av-danger/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.clear_btn}
                </button>
              )}
            </div>

            {history.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t.history_search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-av-bg border border-av-primary-green/30 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-av-accent-green transition-all"
                  />
                  <Search className="w-4 h-4 text-av-primary-green/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                   <button onClick={() => setRiskFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${riskFilter === 'all' ? 'bg-av-primary-green/20 text-av-accent-green border-av-primary-green/50' : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'}`}>{t.history_all}</button>
                   <button onClick={() => setRiskFilter('danger')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${riskFilter === 'danger' ? 'bg-av-danger/20 text-av-danger border-av-danger/50' : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'}`}>{t.high_risk}</button>
                   <button onClick={() => setRiskFilter('doubt')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${riskFilter === 'doubt' ? 'bg-av-doubt/20 text-av-doubt border-av-doubt/50' : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'}`}>{t.med_risk}</button>
                   <button onClick={() => setRiskFilter('safe')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${riskFilter === 'safe' ? 'bg-av-safe/20 text-av-safe border-av-safe/50' : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'}`}>{t.low_risk}</button>
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              {history.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                  <History className="w-12 h-12 text-av-primary-green mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{t.history_empty}</p>
                </div>
              ) : (
                history
                  .filter(item => item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) && (riskFilter === 'all' || item.level === riskFilter))
                  .map(item => (
                  <div key={item.id} onClick={() => { setCurrentAnalysis(item); setDetailsOrigin('history'); setView('details'); }} className="bg-av-card border border-av-primary-green/30 rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98] cursor-pointer hover:border-av-primary-green/60">
                     <div className={`w-4 h-4 rounded-full shrink-0 ${
                       item.level === 'danger' ? 'bg-av-danger drop-shadow-[0_0_8px_rgba(242,65,65,0.8)]' : 
                       item.level === 'doubt' ? 'bg-av-doubt drop-shadow-[0_0_8px_rgba(248,195,64,0.8)]' : 
                       'bg-av-safe drop-shadow-[0_0_8px_rgba(118,217,48,0.8)]'
                     }`}></div>
                     <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate text-[15px]">{item.snippet}</p>
                        <p className="text-white/60 text-[12px] mt-1">{item.date}</p>
                        <p className="text-[13px] mt-1">
                           <span className="text-white/60">Analizado </span>
                           <strong className={item.level === 'danger' ? 'text-av-danger' : item.level === 'doubt' ? 'text-av-doubt' : 'text-av-safe'}>
                             {item.score}% ({item.level === 'danger' ? t.high_risk : item.level === 'doubt' ? t.med_risk : t.low_risk})
                           </strong>
                        </p>
                     </div>
                     <div className="text-av-primary-green/50 shrink-0">
                        <ChevronRight className="w-5 h-5" />
                     </div>
                  </div>
                ))
              )}
              {history.length > 0 && history.filter(item => item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) && (riskFilter === 'all' || item.level === riskFilter)).length === 0 && (
                <div className="text-center py-6 opacity-60">
                  <p className="text-sm">No se encontraron resultados para tu búsqueda.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'tips' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6 w-full">
            <div className="space-y-1">
               <h2 className="text-2xl font-bold text-white">{t.tips_title}</h2>
               <p className="text-av-primary-green text-sm font-semibold tracking-wider uppercase">{t.tips_sub}</p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Tip Card 1 */}
              <div className="bg-av-card border border-av-primary-green/50 rounded-2xl p-5 flex gap-4 transition-all">
                 <div className="shrink-0 mt-1">
                    <Lightbulb className="w-8 h-8 text-av-accent-green drop-shadow-[0_0_12px_rgba(89,191,42,0.8)]" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-av-accent-green font-bold text-sm tracking-wide">CONSEJO DEL DÍA</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      No abras enlaces ni descargues adjuntos de correos que parezcan de bancos pidiendo confirmar tus datos. Tu banco nunca te pedirá eso por correo.
                    </p>
                 </div>
              </div>

              {/* Tip Card 2 */}
              <div className="bg-av-card border border-av-primary-green/50 rounded-2xl p-5 flex gap-4 transition-all">
                 <div className="shrink-0 mt-1">
                    <MailWarning className="w-8 h-8 text-av-accent-green drop-shadow-[0_0_12px_rgba(89,191,42,0.8)]" />
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-av-accent-green font-bold text-sm tracking-wide">CÓMO IDENTIFICAR UN CORREO FALSO</h3>
                    <ul className="space-y-3">
                       <li className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-av-primary-green shrink-0 mt-0.5" />
                          <span className="text-white/80 text-sm leading-snug">Revisá la dirección del remitente, si no coincide exactamente con el dominio de la empresa es falso.</span>
                       </li>
                       <li className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-av-primary-green shrink-0 mt-0.5" />
                          <span className="text-white/80 text-sm leading-snug">Prestá atención a errores ortográficos o saludos genéricos ("Estimado cliente").</span>
                       </li>
                       <li className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-av-primary-green shrink-0 mt-0.5" />
                          <span className="text-white/80 text-sm leading-snug">Desconfiá si el correo intenta generar pánico o te obliga a actuar con inmediatez.</span>
                       </li>
                    </ul>
                 </div>
              </div>

              {/* Tip Card 3 */}
              <div className="bg-av-card border border-av-primary-green/50 rounded-2xl p-5 flex gap-4 transition-all">
                 <div className="shrink-0 mt-1">
                    <GlobeLock className="w-8 h-8 text-av-accent-green drop-shadow-[0_0_12px_rgba(89,191,42,0.8)]" />
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-av-accent-green font-bold text-sm tracking-wide">SEGURIDAD GENERAL</h3>
                    <ul className="space-y-3">
                       <li className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-av-primary-green shrink-0 mt-0.5" />
                          <span className="text-white/80 text-sm leading-snug">Activá la autenticación de dos factores (2FA) en todas tus cuentas importantes.</span>
                       </li>
                       <li className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-av-primary-green shrink-0 mt-0.5" />
                          <span className="text-white/80 text-sm leading-snug">Usá un gestor de contraseñas y generá claves únicas para cada servicio.</span>
                       </li>
                    </ul>
                 </div>
              </div>
            </div>
          </div>
        )}

        {view === 'details' && currentAnalysis && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-6 w-full">
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setView(detailsOrigin)}
                 className="p-2 -ml-2 rounded-full hover:bg-av-primary-green/20 transition-colors text-white"
               >
                 <ArrowLeft className="w-6 h-6" />
               </button>
               <h2 className="text-xl font-bold text-white">{t.details_title}</h2>
            </div>

            <div className="bg-av-card border border-av-primary-green/30 rounded-2xl p-4 flex flex-col gap-2">
               <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{t.id_label}:</span>
                  <span className="text-white font-mono text-xs opacity-70">{currentAnalysis.id}</span>
               </div>
               <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{t.date_label}:</span>
                  <span className="text-white font-medium">{currentAnalysis.date}</span>
               </div>
            </div>

            <div className={`border rounded-2xl p-4 flex items-center justify-between ${
                  currentAnalysis.level === 'danger' ? 'bg-av-card-danger border-av-danger/40' :
                  currentAnalysis.level === 'doubt' ? 'bg-av-card-doubt border-av-doubt/40' :
                  'bg-av-card-safe border-av-safe/40'
            }`}>
               <span className="text-white/80 text-sm font-semibold uppercase tracking-wider">{t.score_label}</span>
               <div className="flex items-center gap-2">
                  <span className={`text-xl font-black ${
                     currentAnalysis.level === 'danger' ? 'text-av-danger' :
                     currentAnalysis.level === 'doubt' ? 'text-av-doubt' :
                     'text-av-safe'
                  }`}>{currentAnalysis.score}%</span>
                  <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wide ${
                     currentAnalysis.level === 'danger' ? 'bg-av-danger/20 text-av-danger' :
                     currentAnalysis.level === 'doubt' ? 'bg-av-doubt/20 text-av-doubt' :
                     'bg-av-safe/20 text-av-safe'
                  }`}>
                     {currentAnalysis.level === 'danger' ? t.high_risk : 
                      currentAnalysis.level === 'doubt' ? t.med_risk : t.low_risk}
                  </span>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <p className="text-av-primary-green text-sm font-semibold tracking-wider uppercase mb-3">{t.reason_why}</p>
               </div>
               
               <div className="flex flex-col gap-3">
                  {(currentAnalysis.reasons || []).map((reason, index) => {
                    const [title, desc] = reason.includes('(') 
                      ? reason.split('(').map(s => s.replace(')', '').trim()) 
                      : [reason, ''];

                    return (
                      <div key={index} className="bg-av-card border border-av-primary-green/30 rounded-2xl p-4 flex items-start gap-4 transition-all">
                         <div className="shrink-0 mt-1">
                            <div className={`w-3 h-3 rounded-full ${
                              currentAnalysis.level === 'danger' ? 'bg-av-danger drop-shadow-[0_0_6px_rgba(242,65,65,0.8)]' : 
                              currentAnalysis.level === 'doubt' ? 'bg-av-doubt drop-shadow-[0_0_6px_rgba(248,195,64,0.8)]' : 
                              'bg-av-safe drop-shadow-[0_0_6px_rgba(118,217,48,0.8)]'
                            }`}></div>
                         </div>
                         <div className="space-y-1">
                            <h3 className="text-white font-semibold text-[15px]">{title}</h3>
                            {desc && <p className="text-white/70 text-sm leading-relaxed">{desc}</p>}
                         </div>
                      </div>
                    );
                  })}
               </div>
            </div>

            <div className="space-y-3">
               <div>
                  <p className="text-av-primary-green text-sm font-semibold tracking-wider uppercase">{t.body_label}</p>
               </div>
               <div className="bg-av-card border border-av-primary-green/20 rounded-2xl p-4 max-h-[240px] overflow-y-auto custom-scrollbar">
                  <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                     {currentAnalysis.fullText || currentAnalysis.snippet}
                  </p>
               </div>
            </div>

            <div className={`border rounded-2xl p-4 mt-2 ${
                  currentAnalysis.level === 'danger' ? 'bg-av-card-danger border-av-danger/20' :
                  currentAnalysis.level === 'doubt' ? 'bg-av-card-doubt border-av-doubt/20' :
                  'bg-av-card-safe border-av-safe/20'
            }`}>
               <h3 className={`text-sm font-bold tracking-wide uppercase mb-2 ${
                  currentAnalysis.level === 'danger' ? 'text-av-danger' :
                  currentAnalysis.level === 'doubt' ? 'text-av-doubt' :
                  'text-av-safe'
               }`}>{t.advice}</h3>
               <p className="text-white/80 text-sm leading-relaxed flex items-start gap-2">
                 <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
                 {t.advice_desc}
               </p>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6 w-full">
            <div className="space-y-1">
               <h2 className="text-2xl font-bold text-white">{t.set_title}</h2>
               <p className="text-av-primary-green text-sm font-semibold tracking-wider uppercase">{t.set_sub}</p>
            </div>
            
            <div className="flex flex-col gap-4">
               {/* Language */}
               <div className="bg-av-card border border-av-primary-green/30 rounded-2xl p-5 flex flex-col gap-3 transition-colors">
                  <div className="flex items-center gap-3 text-av-accent-green">
                     <Globe className="w-5 h-5" />
                     <h3 className="font-bold text-sm tracking-wide uppercase">{t.set_lang}</h3>
                  </div>
                  <select 
                     value={language} 
                     onChange={(e) => saveSettings({ language: e.target.value })}
                     className="w-full bg-av-bg border border-av-primary-green/50 rounded-xl p-3 text-white focus:outline-none focus:border-av-accent-green appearance-none cursor-pointer"
                  >
                     <option value="es-AR">Español (Argentina)</option>
                     <option value="en-US">English (US)</option>
                  </select>
               </div>

               {/* Theme */}
               <div className="bg-av-card border border-av-primary-green/30 rounded-2xl p-5 flex flex-col gap-3 transition-colors">
                  <div className="flex items-center gap-3 text-av-accent-green">
                     <Moon className="w-5 h-5" />
                     <h3 className="font-bold text-sm tracking-wide uppercase">{t.set_theme}</h3>
                  </div>
                  <div className="flex bg-av-bg border border-av-primary-green/30 rounded-xl p-1 relative">
                     <button 
                        onClick={() => saveSettings({ theme: 'dark' })}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all z-10 ${theme === 'dark' ? 'text-av-accent-green' : 'text-white/50 hover:text-white/80'}`}
                     >
                        {t.set_dark}
                     </button>
                     <button 
                        onClick={() => saveSettings({ theme: 'light' })}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all z-10 ${theme === 'light' ? 'text-av-accent-green' : 'text-white/50 hover:text-white/80'}`}
                     >
                        {t.set_light}
                     </button>
                     <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-av-primary-green/20 rounded-lg transition-transform duration-300 pointer-events-none ${theme === 'light' ? 'translate-x-[100%]' : 'translate-x-0'}`}></div>
                  </div>
               </div>

               {/* Notifications */}
               <div className="bg-av-card border border-av-primary-green/30 rounded-2xl p-5 flex flex-col gap-4 transition-colors">
                  <div className="flex items-center gap-3 text-av-accent-green">
                     <Bell className="w-5 h-5" />
                     <h3 className="font-bold text-sm tracking-wide uppercase">{t.set_notif}</h3>
                  </div>
                  
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-white font-semibold text-sm">{t.set_push}</p>
                        <p className="text-white/60 text-xs mt-0.5">{t.set_push_desc}</p>
                     </div>
                     <button 
                        onClick={() => saveSettings({ pushEnabled: !pushEnabled })}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${pushEnabled ? 'bg-av-accent-green' : 'bg-av-primary-green/30'}`}
                     >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 shadow-sm ${pushEnabled ? 'left-7' : 'left-1'}`}></div>
                     </button>
                  </div>

                  <div className="w-full h-px bg-av-primary-green/20"></div>

                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-white font-semibold text-sm">{t.set_email}</p>
                        <p className="text-white/60 text-xs mt-0.5">{t.set_email_desc}</p>
                     </div>
                      <input
                        type="email"
                        placeholder="tu@correo.com"
                        value={emailAddress}
                        onChange={(e) => saveSettings({ emailAddress: e.target.value })}
                        className="w-full bg-av-bg border border-av-primary-green/30 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-av-accent-green transition-all"
                     />
                  </div>
               </div>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full bg-av-card border-t border-av-primary-green/20 pb-safe z-50">
        <div className="flex justify-around items-center h-20 px-2 max-w-[390px] mx-auto">
          <NavItem 
            icon={<Search />} 
            label={t.nav_analyze} 
            active={view === 'analyze' || view === 'loading' || view === 'result'} 
            onClick={() => { setView('analyze'); setText(''); }} 
          />
          <NavItem 
            icon={<History />} 
            label={t.nav_history} 
            active={view === 'history' || view === 'details'} 
            onClick={() => setView('history')} 
          />
          <NavItem 
            icon={<Lightbulb />} 
            label={t.nav_tips} 
            active={view === 'tips'} 
            onClick={() => setView('tips')} 
          />
          <NavItem 
            icon={<Settings />} 
            label={t.nav_settings} 
            active={view === 'settings'} 
            onClick={() => setView('settings')} 
          />
        </div>
      </nav>

    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center w-16 gap-1.5 transition-all duration-300 ${active ? 'text-av-accent-green' : 'text-white/40 hover:text-white/60'}`}
    >
      <div className={`
        ${active ? 'drop-shadow-[0_0_8px_rgba(89,191,42,0.8)] scale-110' : 'scale-100'}
        transition-all duration-300 w-6 h-6 flex items-center justify-center
      `}>
        {/* Aquí renderizas el ícono directamente sin clonar */}
        {icon}
      </div>
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  );
}

