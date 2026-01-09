import React, { useState, useEffect } from 'react';
import { AppState, ContactInfo, GeneratedEmail, ScanRecord, AppSettings } from './types';
import { extractContactFromImage } from './services/ocrService';
import { generateFollowUpEmail } from './services/emailService';
import { CameraView } from './components/CameraView';
import { ReviewScreen } from './components/ReviewScreen';
import { SettingsPanel } from './components/SettingsPanel';
import { HistoryList } from './components/HistoryList';
import { HistoryDetail } from './components/HistoryDetail';
import { Toast } from './components/Toast';
import { Settings, History as HistoryIcon } from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  autoSend: false,
  userName: '',
  userRole: '',
  userCompany: ''
};

const App: React.FC = () => {
  const [view, setView] = useState<AppState>(AppState.CAMERA);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('swiftscan_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentContact, setCurrentContact] = useState<ContactInfo | null>(null);
  const [currentEmail, setCurrentEmail] = useState<GeneratedEmail | null>(null);
  const [currentImage, setCurrentImage] = useState<string>(''); // Store image for current session
  
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);
  
  // Feedback State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    localStorage.setItem('swiftscan_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!settings.userName && !settings.googleUser && view !== AppState.SETTINGS) {
      setTimeout(() => setView(AppState.SETTINGS), 800);
    }
  }, [settings.userName]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleCapture = async (imageData: string) => {
    setIsProcessing(true);
    setCurrentImage(imageData); // Save image for record
    try {
      const contact = await extractContactFromImage(imageData);
      setCurrentContact(contact);

      const email = await generateFollowUpEmail(contact, {
        name: settings.userName,
        role: settings.userRole,
        company: settings.userCompany
      });
      setCurrentEmail(email);

      setTimeout(() => setView(AppState.REVIEW), 100);
      
    } catch (error) {
      showToast("Scan failed. Try improving lighting or focus.", 'error');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = (finalEmail: GeneratedEmail, finalContact: ContactInfo, method: 'sent_manual' | 'sent_gmail') => {
    const newRecord: ScanRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      contact: finalContact,
      emailDraft: finalEmail,
      imageUri: currentImage, // Store the image
      status: method
    };
    setHistory(prev => [newRecord, ...prev]);
    
    setView(AppState.CAMERA);
    setTimeout(() => {
      showToast(method === 'sent_gmail' ? "Email sent successfully!" : "Mail app opened & scan saved.", 'success');
    }, 300);
  };

  const handleRegenerate = async () => {
    if (!currentContact) return;
    setIsProcessing(true);
    try {
       const email = await generateFollowUpEmail(currentContact, {
        name: settings.userName,
        role: settings.userRole,
        company: settings.userCompany
      });
      setCurrentEmail(email);
      showToast("Email draft refreshed.", 'success');
    } catch (error) {
      console.error(error);
      showToast("Could not regenerate email.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative w-full h-screen max-w-md mx-auto bg-[#01161e] shadow-2xl overflow-hidden flex flex-col font-sans">
      
      {/* Toast Notification Layer */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Main View Switcher with Transitions */}
      <div className="flex-1 relative w-full h-full">
        {view === AppState.CAMERA && (
          <div className="absolute inset-0 animate-fade-in z-10">
            <CameraView onCapture={handleCapture} isProcessing={isProcessing} />
          </div>
        )}

        {view === AppState.REVIEW && currentContact && currentEmail && (
          <div className="absolute inset-0 z-20 bg-[#01161e] animate-slide-up">
            <ReviewScreen 
              contact={currentContact}
              emailDraft={currentEmail}
              settings={settings}
              onSend={handleSend}
              onBack={() => setView(AppState.CAMERA)}
              onRegenerate={handleRegenerate}
              onError={(msg) => showToast(msg, 'error')}
            />
          </div>
        )}
      </div>

      {/* Overlays (Modals) */}
      
      {/* History List */}
      {view === AppState.HISTORY && (
        <div className="absolute inset-0 z-30 animate-slide-in-right">
          <HistoryList 
            records={history} 
            onClose={() => setView(AppState.CAMERA)} 
            onSelectRecord={(r) => {
              setSelectedRecord(r);
              setView(AppState.HISTORY_DETAIL);
            }}
          />
        </div>
      )}

      {/* History Detail */}
      {view === AppState.HISTORY_DETAIL && selectedRecord && (
        <div className="absolute inset-0 z-40 animate-slide-up">
          <HistoryDetail 
            record={selectedRecord} 
            onClose={() => setView(AppState.HISTORY)} 
          />
        </div>
      )}

      {/* Settings */}
      {view === AppState.SETTINGS && (
        <div className="absolute inset-0 z-40 animate-scale-in">
          <SettingsPanel 
            settings={settings} 
            onSave={(s) => {
              setSettings(s);
              setView(AppState.CAMERA);
              showToast("Settings saved successfully.", 'success');
            }}
            onClose={() => setView(AppState.CAMERA)}
          />
        </div>
      )}

      {/* Floating Header Controls (Only on Camera) */}
      <div className={`absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-start z-20 pointer-events-none transition-opacity duration-300 ${view === AppState.CAMERA && !isProcessing ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={() => setView(AppState.HISTORY)}
          className="pointer-events-auto p-3 bg-[#01161e]/40 backdrop-blur-md rounded-full text-[#f7dba7] border border-[#f7dba7]/10 hover:bg-[#f7dba7]/10 active:scale-95 transition-all"
        >
          <HistoryIcon className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => setView(AppState.SETTINGS)}
          className="pointer-events-auto p-3 bg-[#01161e]/40 backdrop-blur-md rounded-full text-[#f7dba7] border border-[#f7dba7]/10 hover:bg-[#f7dba7]/10 active:scale-95 transition-all"
        >
          {settings.googleUser?.picture ? (
             <img src={settings.googleUser.picture} className="w-5 h-5 rounded-full" alt="Profile" />
          ) : (
             <Settings className="w-5 h-5" />
          )}
        </button>
      </div>

    </div>
  );
};

export default App;