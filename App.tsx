
import React, { useState, useEffect } from 'react';
import { 
  LogIn, LogOut, Search, UserPlus, ArrowLeft, BrainCircuit, 
  LayoutDashboard, Settings, User, Trash2, Users, Sun, Moon, Languages 
} from 'lucide-react';
import { Client, User as UserType, LedgerEntry, Language, Theme } from './types';
import { ClientCard } from './components/ClientCard';
import { LedgerTable } from './components/LedgerTable';
import { analyzeClientFinance } from './services/geminiService';
import { STORAGE_KEYS } from './constants';
import { translations } from './translations';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('ma_lang') as Language) || 'en');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('ma_theme') as Theme) || 'light');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [newClientName, setNewClientName] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const t = translations[lang];

  // Initialize data
  useEffect(() => {
    const savedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
    const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (savedAuth) {
      setCurrentUser(JSON.parse(savedAuth));
      setIsLoginView(false);
    }
  }, []);

  // Theme and RTL logic
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('ma_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('ma_lang', lang);
  }, [lang]);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username && loginData.password) {
      const user: UserType = { username: loginData.username, role: 'admin' };
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
      setIsLoginView(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    setIsLoginView(true);
    setSelectedClientId(null);
  };

  const addClient = () => {
    if (!newClientName.trim()) return;
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: newClientName,
      entries: [],
      createdAt: new Date().toISOString(),
    };
    setClients(prev => [newClient, ...prev]);
    setNewClientName('');
  };

  const deleteClient = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      setClients(prev => prev.filter(c => c.id !== id));
      if (selectedClientId === id) setSelectedClientId(null);
    }
  };

  const addEntry = (clientId: string, entry: Omit<LedgerEntry, 'id'>) => {
    const fullEntry: LedgerEntry = { ...entry, id: Math.random().toString(36).substr(2, 9) };
    setClients(prev => prev.map(c => 
      c.id === clientId ? { ...c, entries: [fullEntry, ...c.entries] } : c
    ));
    setAiAnalysis(null);
  };

  const deleteEntry = (clientId: string, entryId: string) => {
    setClients(prev => prev.map(c => 
      c.id === clientId ? { ...c, entries: c.entries.filter(e => e.id !== entryId) } : c
    ));
    setAiAnalysis(null);
  };

  const runAiAnalysis = async (client: Client) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const result = await analyzeClientFinance(client, lang);
      setAiAnalysis(result || t.analysisUnavailable);
    } catch (err) {
      setAiAnalysis(t.analysisUnavailable);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  if (isLoginView) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 transition-colors duration-300`}>
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex justify-end mb-4 gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="relative group">
               <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
                <Languages size={20} />
              </button>
              <div className={`absolute ${lang === 'ar' ? 'left-0' : 'right-0'} top-full mt-1 hidden group-hover:block bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden z-20`}>
                <button onClick={() => setLang('en')} className="block w-full px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200">English</button>
                <button onClick={() => setLang('fr')} className="block w-full px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200">Français</button>
                <button onClick={() => setLang('ar')} className="block w-full px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200 text-right">العربية</button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200 dark:shadow-none">
              <span className="text-2xl font-bold">M.A</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.loginTitle}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t.loginSub}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.username}</label>
              <input 
                type="text" required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder={t.username}
                value={loginData.username}
                onChange={e => setLoginData({...loginData, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.password}</label>
              <input 
                type="password" required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                value={loginData.password}
                onChange={e => setLoginData({...loginData, password: e.target.value})}
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
            >
              <LogIn size={20} /> {t.loginBtn}
            </button>
          </form>
          <p className="mt-8 text-center text-xs text-slate-400">
            &copy; 2024 {t.appName}. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300`}>
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-slate-400 p-4 hidden md:flex flex-col border-r border-slate-800">
        <div className={`flex items-center gap-3 px-2 mb-10 text-white ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">M</div>
          <span className="font-bold text-xl hidden lg:block">{t.portal}</span>
        </div>
        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => setSelectedClientId(null)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${!selectedClientId ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'} ${lang === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
          >
            <LayoutDashboard size={20} />
            <span className="hidden lg:block font-medium">{t.dashboard}</span>
          </button>
          <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-800 transition-colors ${lang === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
            <User size={20} />
            <span className="hidden lg:block font-medium">{t.clients}</span>
          </button>
          <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-800 transition-colors ${lang === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
            <Settings size={20} />
            <span className="hidden lg:block font-medium">{t.settings}</span>
          </button>
        </nav>
        <div className="pt-6 border-t border-slate-800 mt-auto">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-rose-900/30 hover:text-rose-400 transition-colors ${lang === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
          >
            <LogOut size={20} />
            <span className="hidden lg:block font-medium">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <header className="bg-white dark:bg-slate-900 h-16 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {selectedClientId && (
              <button 
                onClick={() => setSelectedClientId(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
              >
                <ArrowLeft size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
              </button>
            )}
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
              {selectedClient ? `${t.clients}: ${selectedClient.name}` : t.overview}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <div className="relative group">
                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Languages size={20} />
                  <span className="text-xs font-bold uppercase hidden lg:block">{lang}</span>
                </button>
                <div className={`absolute ${lang === 'ar' ? 'left-0' : 'right-0'} top-full mt-1 hidden group-hover:block bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden z-20`}>
                  <button onClick={() => setLang('en')} className="block w-full px-6 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200 text-left">English</button>
                  <button onClick={() => setLang('fr')} className="block w-full px-6 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200 text-left">Français</button>
                  <button onClick={() => setLang('ar')} className="block w-full px-6 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200 text-right">العربية</button>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
              <input 
                type="text" 
                placeholder={t.search} 
                className={`bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48 xl:w-64 dark:text-slate-100 ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className={`flex items-center gap-3 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`text-right hidden sm:block ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">{currentUser?.username}</p>
                <p className="text-xs text-slate-500 capitalize">{currentUser?.role}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                {currentUser?.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {selectedClient ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 ${lang === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{selectedClient.name}</h1>
                  <p className="text-slate-500 dark:text-slate-400">{t.managingSince} {new Date(selectedClient.createdAt).toLocaleDateString(lang)}</p>
                </div>
                <div className={`flex gap-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <button 
                    onClick={() => runAiAnalysis(selectedClient)}
                    disabled={isAnalyzing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
                      isAnalyzing ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white'
                    }`}
                  >
                    <BrainCircuit size={18} /> {isAnalyzing ? t.analyzing : t.aiInsights}
                  </button>
                  <button 
                    onClick={() => deleteClient(selectedClient.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                  >
                    <Trash2 size={18} /> {t.deleteClient}
                  </button>
                </div>
              </div>

              {aiAnalysis && (
                <div className={`bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 mb-8 relative overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  <div className={`absolute top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} p-4 opacity-10`}>
                    <BrainCircuit size={80} />
                  </div>
                  <h3 className="text-indigo-900 dark:text-indigo-300 font-bold mb-2 flex items-center gap-2">
                    <BrainCircuit size={18} className="text-indigo-600" /> 
                    {t.aiAnalysis}
                  </h3>
                  <p className="text-indigo-800 dark:text-indigo-200 text-sm leading-relaxed">{aiAnalysis}</p>
                  <button 
                    onClick={() => setAiAnalysis(null)}
                    className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                  >
                    {t.dismiss}
                  </button>
                </div>
              )}

              <LedgerTable 
                client={selectedClient} 
                language={lang}
                onAddEntry={(entry) => addEntry(selectedClient.id, entry)}
                onDeleteEntry={(entryId) => deleteEntry(selectedClient.id, entryId)}
              />
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className={`flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 ${lang === 'ar' ? 'md:flex-row-reverse' : ''}`}>
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t.welcome}</h1>
                  <p className="text-slate-500 dark:text-slate-400">{t.welcomeSub}</p>
                </div>
                <div className={`flex gap-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <input 
                      type="text" 
                      placeholder={t.addClient} 
                      className={`px-4 py-2 border-none outline-none text-sm w-48 md:w-64 dark:bg-slate-800 dark:text-slate-100 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                      value={newClientName}
                      onChange={e => setNewClientName(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addClient()}
                    />
                    <button 
                      onClick={addClient}
                      className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <UserPlus size={18} /> <span className="hidden sm:inline">{t.addBtn}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title={t.totalClients} value={clients.length.toString()} accent="blue" />
                <StatCard 
                  title={t.totalReceivables} 
                  value={`$${clients.reduce((acc, c) => acc + c.entries.reduce((sum, e) => sum + e.price, 0), 0).toLocaleString()}`} 
                  accent="slate" 
                />
                <StatCard 
                  title={t.totalCollections} 
                  value={`$${clients.reduce((acc, c) => acc + c.entries.reduce((sum, e) => sum + e.paid, 0), 0).toLocaleString()}`} 
                  accent="emerald" 
                />
                <StatCard 
                  title={t.overallCredit} 
                  value={`$${clients.reduce((acc, c) => acc + c.entries.reduce((sum, e) => sum + (e.price - e.paid), 0), 0).toLocaleString()}`} 
                  accent="rose" 
                />
              </div>

              <h3 className={`text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <Users size={20} className="text-blue-600" />
                {t.activeClients}
              </h3>

              {filteredClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredClients.map(client => (
                    <ClientCard 
                      key={client.id} 
                      client={client} 
                      language={lang}
                      onClick={() => setSelectedClientId(client.id)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                    <UserPlus size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t.noClients}</h4>
                  <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-6">{t.noClientsSub}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, accent: string }> = ({ title, value, accent }) => {
  const accentClasses: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    rose: "text-rose-600 dark:text-rose-400",
    slate: "text-slate-800 dark:text-slate-200"
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h4 className={`text-2xl font-bold ${accentClasses[accent] || accentClasses.slate}`}>{value}</h4>
    </div>
  );
};

export default App;
