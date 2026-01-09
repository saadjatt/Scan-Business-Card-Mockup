import React from 'react';
import { ScanRecord } from '../types';
import { X, Calendar, Mail, Phone, Building, User, ExternalLink } from 'lucide-react';

interface HistoryDetailProps {
  record: ScanRecord;
  onClose: () => void;
}

export const HistoryDetail: React.FC<HistoryDetailProps> = ({ record, onClose }) => {
  return (
    <div className="h-full flex flex-col bg-[#01161e] text-[#f7dba7]">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-[#f7dba7]/10 bg-[#01161e]/95 backdrop-blur-md z-20">
        <h2 className="text-lg font-bold">Scan Details</h2>
        <button onClick={onClose} className="p-2 bg-[#f7dba7]/10 rounded-full text-[#f7dba7] hover:bg-[#f7dba7]/20 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        
        {/* Scanned Image (if available) */}
        {record.imageUri && (
          <div className="rounded-2xl overflow-hidden border-2 border-[#f7dba7]/20 shadow-2xl relative group">
            <img src={record.imageUri} alt="Business Card" className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
            <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded text-xs text-white">
              Original Scan
            </div>
          </div>
        )}

        {/* Contact Info Grid */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-[#247ba0] font-bold">Extracted Data</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-[#f7dba7]/5 p-4 rounded-xl flex items-center gap-3">
              <User className="w-5 h-5 text-[#vintage-lavender]" />
              <div>
                <p className="text-xs text-[#f7dba7]/50">Name</p>
                <p className="font-medium text-lg">{record.contact.name || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-[#f7dba7]/5 p-4 rounded-xl flex items-center gap-3">
              <Building className="w-5 h-5 text-[#vintage-lavender]" />
              <div>
                 <p className="text-xs text-[#f7dba7]/50">Role / Company</p>
                 <p className="font-medium">{record.contact.role} {record.contact.role && record.contact.company ? 'at' : ''} {record.contact.company}</p>
              </div>
            </div>

            <div className="bg-[#f7dba7]/5 p-4 rounded-xl flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#vintage-lavender]" />
              <div className="overflow-hidden">
                 <p className="text-xs text-[#f7dba7]/50">Email</p>
                 <p className="font-medium truncate">{record.contact.email}</p>
              </div>
            </div>

            {record.contact.phone && (
              <div className="bg-[#f7dba7]/5 p-4 rounded-xl flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#vintage-lavender]" />
                <div>
                  <p className="text-xs text-[#f7dba7]/50">Phone</p>
                  <p className="font-medium">{record.contact.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Sent Info */}
        {record.emailDraft && (
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-wider text-[#247ba0] font-bold">Email Content</h3>
                <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold ${
                  record.status === 'sent_gmail' ? 'bg-[#247ba0]/20 text-[#247ba0]' : 'bg-[#f7dba7]/10 text-[#f7dba7]/50'
                }`}>
                  {record.status === 'sent_gmail' ? 'Sent via API' : 'External App'}
                </span>
              </div>
              
              <div className="bg-[#f7dba7]/5 rounded-xl p-5 border border-[#f7dba7]/10 space-y-4">
                <div>
                   <span className="text-xs opacity-50 block mb-1">Subject</span>
                   <p className="font-medium">{record.emailDraft.subject}</p>
                </div>
                <hr className="border-[#f7dba7]/10" />
                <div>
                   <span className="text-xs opacity-50 block mb-1">Body</span>
                   <p className="text-sm whitespace-pre-wrap leading-relaxed opacity-90">{record.emailDraft.body}</p>
                </div>
              </div>
           </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-[#f7dba7]/30 pb-4">
           <Calendar className="w-3 h-3" />
           <span>Scanned on {new Date(record.timestamp).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};