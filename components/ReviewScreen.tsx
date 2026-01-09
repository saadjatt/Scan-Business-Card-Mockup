import React, { useState } from 'react';
import { ContactInfo, GeneratedEmail, AppSettings } from '../types';
import { Send, ArrowLeft, RefreshCw, Phone } from 'lucide-react';
import { sendGmail } from '../services/googleService';

interface ReviewScreenProps {
  contact: ContactInfo;
  emailDraft: GeneratedEmail;
  settings: AppSettings;
  onSend: (finalEmail: GeneratedEmail, finalContact: ContactInfo, method: 'sent_manual' | 'sent_gmail') => void;
  onBack: () => void;
  onRegenerate: () => void;
  onError: (msg: string) => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ contact, emailDraft, settings, onSend, onBack, onRegenerate, onError }) => {
  const [editedContact, setEditedContact] = useState<ContactInfo>(contact);
  const [editedEmail, setEditedEmail] = useState<GeneratedEmail>(emailDraft);
  const [activeTab, setActiveTab] = useState<'details' | 'email'>('email');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    setEditedContact(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailChange = (field: keyof GeneratedEmail, value: string) => {
    setEditedEmail(prev => ({ ...prev, [field]: value }));
  };

  const handleRegenerateClick = () => {
    setIsRegenerating(true);
    onRegenerate();
    setTimeout(() => setIsRegenerating(false), 500);
  };

  const handleManualSend = () => {
    // Construct mailto link
    const subject = encodeURIComponent(editedEmail.subject);
    const body = encodeURIComponent(editedEmail.body);
    const mailtoLink = `mailto:${editedContact.email}?subject=${subject}&body=${body}`;
    
    // Open system mail client
    window.location.href = mailtoLink;
    
    // Notify app of completion
    onSend(editedEmail, editedContact, 'sent_manual');
  };

  const handleGmailSend = async () => {
    if (!settings.googleUser?.accessToken) {
      onError("No Google Session found. Please log in settings.");
      return;
    }

    setIsSending(true);
    const success = await sendGmail(
      settings.googleUser.accessToken,
      editedContact.email,
      editedEmail.subject,
      editedEmail.body
    );

    if (success) {
      onSend(editedEmail, editedContact, 'sent_gmail');
    } else {
      onError("Failed to send via Gmail. Try manual send.");
    }
    setIsSending(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#01161e] text-[#f7dba7]">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-[#01161e] z-20 border-b border-[#f7dba7]/10">
        <button onClick={onBack} className="p-2 hover:bg-[#f7dba7]/10 rounded-full tap-active transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold tracking-wide">Review & Send</h2>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2 bg-[#01161e] shadow-sm z-10">
        <button 
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'details' 
              ? 'bg-[#247ba0] text-white shadow-lg shadow-[#247ba0]/20' 
              : 'bg-[#f7dba7]/5 text-[#f7dba7]/60 hover:bg-[#f7dba7]/10'
          }`}
        >
          Contact Details
        </button>
        <button 
          onClick={() => setActiveTab('email')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'email' 
              ? 'bg-[#247ba0] text-white shadow-lg shadow-[#247ba0]/20' 
              : 'bg-[#f7dba7]/5 text-[#f7dba7]/60 hover:bg-[#f7dba7]/10'
          }`}
        >
          Email Draft
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        
        {activeTab === 'details' && (
          <div className="space-y-4 animate-fade-in">
             <div className="bg-[#f7dba7]/5 rounded-xl p-4 border border-[#f7dba7]/10 input-transition focus-within:border-[#247ba0] focus-within:bg-[#f7dba7]/10">
                <label className="text-xs uppercase tracking-wider opacity-50 mb-1 block">Name</label>
                <input 
                  value={editedContact.name}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                  className="w-full bg-transparent text-lg font-medium focus:outline-none text-[#f7dba7] placeholder-[#f7dba7]/20"
                  placeholder="Unknown Name"
                />
             </div>
             <div className="bg-[#f7dba7]/5 rounded-xl p-4 border border-[#f7dba7]/10 input-transition focus-within:border-[#247ba0] focus-within:bg-[#f7dba7]/10">
                <label className="text-xs uppercase tracking-wider opacity-50 mb-1 block">Email</label>
                <input 
                  value={editedContact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className="w-full bg-transparent text-lg font-medium focus:outline-none text-[#f7dba7] placeholder-[#f7dba7]/20"
                  placeholder="email@example.com"
                />
             </div>
             <div className="bg-[#f7dba7]/5 rounded-xl p-4 border border-[#f7dba7]/10 input-transition focus-within:border-[#247ba0] focus-within:bg-[#f7dba7]/10">
                <label className="text-xs uppercase tracking-wider opacity-50 mb-1 block">Phone</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 opacity-50" />
                  <input 
                    value={editedContact.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    className="w-full bg-transparent text-lg font-medium focus:outline-none text-[#f7dba7] placeholder-[#f7dba7]/20"
                    placeholder="+1 555..."
                  />
                </div>
             </div>
             <div className="bg-[#f7dba7]/5 rounded-xl p-4 border border-[#f7dba7]/10 input-transition focus-within:border-[#247ba0] focus-within:bg-[#f7dba7]/10">
                <label className="text-xs uppercase tracking-wider opacity-50 mb-1 block">Role</label>
                <input 
                  value={editedContact.role}
                  onChange={(e) => handleContactChange('role', e.target.value)}
                  className="w-full bg-transparent text-lg font-medium focus:outline-none text-[#f7dba7] placeholder-[#f7dba7]/20"
                  placeholder="Job Title"
                />
             </div>
             <div className="bg-[#f7dba7]/5 rounded-xl p-4 border border-[#f7dba7]/10 input-transition focus-within:border-[#247ba0] focus-within:bg-[#f7dba7]/10">
                <label className="text-xs uppercase tracking-wider opacity-50 mb-1 block">Company</label>
                <input 
                  value={editedContact.company}
                  onChange={(e) => handleContactChange('company', e.target.value)}
                  className="w-full bg-transparent text-lg font-medium focus:outline-none text-[#f7dba7] placeholder-[#f7dba7]/20"
                  placeholder="Company Name"
                />
             </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-4 animate-fade-in h-full flex flex-col">
            <div className="bg-[#f7dba7]/5 rounded-xl p-4 border border-[#f7dba7]/10 input-transition focus-within:border-[#247ba0] focus-within:bg-[#f7dba7]/10">
              <label className="text-xs uppercase tracking-wider opacity-50 mb-1 block">Subject</label>
              <input 
                value={editedEmail.subject}
                onChange={(e) => handleEmailChange('subject', e.target.value)}
                className="w-full bg-transparent text-base font-semibold focus:outline-none text-[#f7dba7]"
              />
            </div>
            <div className="bg-[#f7dba7]/5 rounded-xl p-4 border border-[#f7dba7]/10 flex-1 min-h-[200px] input-transition focus-within:border-[#247ba0] focus-within:bg-[#f7dba7]/10">
              <label className="text-xs uppercase tracking-wider opacity-50 mb-2 block flex justify-between items-center">
                <span>Body</span>
                <button 
                  onClick={handleRegenerateClick} 
                  className={`flex items-center gap-1 text-[#247ba0] hover:text-[#fb3640] transition-colors bg-[#247ba0]/10 px-2 py-1 rounded-md active:scale-95 ${isRegenerating ? 'opacity-50' : ''}`}
                >
                  <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} /> 
                  <span className="text-[10px] font-bold uppercase tracking-wider">Regenerate</span>
                </button>
              </label>
              <textarea 
                value={editedEmail.body}
                onChange={(e) => handleEmailChange('body', e.target.value)}
                className="w-full h-full bg-transparent text-base leading-relaxed focus:outline-none resize-none min-h-[250px] text-[#f7dba7]/90"
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="p-6 bg-gradient-to-t from-[#01161e] via-[#01161e] to-transparent z-20 space-y-3">
        {/* Direct Send if Logged in */}
        {settings.googleUser ? (
          <button 
            onClick={handleGmailSend}
            disabled={isSending}
            className="w-full py-4 rounded-xl bg-[#247ba0] text-white font-bold text-lg shadow-xl shadow-[#247ba0]/30 hover:bg-[#247ba0]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:scale-100"
          >
            {isSending ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Send with Gmail</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        ) : (
          <button 
            onClick={handleManualSend}
            className="w-full py-4 rounded-xl bg-[#247ba0] text-white font-bold text-lg shadow-xl shadow-[#247ba0]/30 hover:bg-[#247ba0]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Open Mail App</span>
            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
        
        {settings.googleUser && (
           <button 
            onClick={handleManualSend}
            className="w-full py-2 text-sm text-[#f7dba7]/50 hover:text-[#f7dba7] transition-colors"
           >
             or open system mail app
           </button>
        )}
      </div>
    </div>
  );
};