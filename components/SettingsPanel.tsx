import React, { useState } from 'react';
import { AppSettings } from '../types';
import { X, Save, User, Smartphone, LogOut } from 'lucide-react';
import { initGoogleAuth } from '../services/googleService';

interface SettingsPanelProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleChange = (field: keyof AppSettings, value: string | boolean) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    initGoogleAuth((googleUser) => {
      setLocalSettings(prev => ({
        ...prev,
        googleUser: googleUser,
        userName: googleUser.name, // Auto-fill name
      }));
      setIsLoggingIn(false);
    });
  };

  const handleLogout = () => {
    setLocalSettings(prev => ({
      ...prev,
      googleUser: undefined,
      userName: '', // Clear name on logout
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#01161e]/95 backdrop-blur-md flex items-center justify-center p-4 animate-scale-in">
      <div className="w-full max-w-md bg-[#01161e] border border-[#f7dba7]/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#f7dba7]/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#f7dba7]">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f7dba7]/10 rounded-full text-[#f7dba7] tap-active transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          
          {/* Google Auth Section */}
          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-[#vintage-lavender] font-bold flex items-center gap-2">
              <User className="w-4 h-4" /> Account
            </h3>
            
            {!localSettings.googleUser ? (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full py-3 bg-white hover:bg-gray-100 text-gray-800 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
              >
                {isLoggingIn ? (
                   <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>
            ) : (
              <div className="bg-[#f7dba7]/5 border border-[#f7dba7]/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {localSettings.googleUser.picture && (
                    <img src={localSettings.googleUser.picture} alt="Profile" className="w-10 h-10 rounded-full border border-[#f7dba7]/20" />
                  )}
                  <div>
                    <p className="text-[#f7dba7] font-semibold text-sm">{localSettings.googleUser.name}</p>
                    <p className="text-[#f7dba7]/60 text-xs">{localSettings.googleUser.email}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 bg-[#fb3640]/10 text-[#fb3640] rounded-lg hover:bg-[#fb3640]/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
            
            <p className="text-xs text-[#f7dba7]/40 leading-tight">
              Sign in to automatically fill your details and enable sending emails directly through your Gmail account.
            </p>
          </div>

          <div className="h-px bg-[#f7dba7]/10" />

          {/* User Profile Section */}
          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-[#vintage-lavender] font-bold flex items-center gap-2">
              <User className="w-4 h-4" /> Signature Details
            </h3>
            
            <div className="space-y-2 group">
              <label className="text-xs text-[#f7dba7]/70 block group-focus-within:text-[#247ba0] transition-colors">Your Name</label>
              <input 
                type="text"
                value={localSettings.userName}
                onChange={(e) => handleChange('userName', e.target.value)}
                className="w-full bg-[#f7dba7]/5 border border-[#f7dba7]/20 rounded-lg p-3 text-[#f7dba7] focus:border-[#vintage-lavender] focus:outline-none input-transition"
              />
            </div>
            
            <div className="space-y-2 group">
              <label className="text-xs text-[#f7dba7]/70 block group-focus-within:text-[#247ba0] transition-colors">Your Role</label>
              <input 
                type="text"
                value={localSettings.userRole}
                onChange={(e) => handleChange('userRole', e.target.value)}
                className="w-full bg-[#f7dba7]/5 border border-[#f7dba7]/20 rounded-lg p-3 text-[#f7dba7] focus:border-[#vintage-lavender] focus:outline-none input-transition"
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-xs text-[#f7dba7]/70 block group-focus-within:text-[#247ba0] transition-colors">Your Company</label>
              <input 
                type="text"
                value={localSettings.userCompany}
                onChange={(e) => handleChange('userCompany', e.target.value)}
                className="w-full bg-[#f7dba7]/5 border border-[#f7dba7]/20 rounded-lg p-3 text-[#f7dba7] focus:border-[#vintage-lavender] focus:outline-none input-transition"
              />
            </div>
          </div>

          <div className="h-px bg-[#f7dba7]/10" />
          
          <div className="space-y-3 bg-[#247ba0]/10 p-4 rounded-xl border border-[#247ba0]/20">
             <h3 className="text-sm uppercase tracking-wider text-[#247ba0] font-bold flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Private Processing
             </h3>
             <p className="text-xs text-[#f7dba7]/80 leading-relaxed">
               Optical Character Recognition (OCR) is performed entirely on this device using open source libraries. Images are saved locally.
             </p>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-[#f7dba7]/10 bg-[#01161e]">
          <button 
            type="submit"
            onClick={handleSubmit}
            className="w-full py-3 bg-[#247ba0] hover:bg-[#247ba0]/90 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all tap-active shadow-lg shadow-[#247ba0]/20"
          >
            <Save className="w-5 h-5" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};