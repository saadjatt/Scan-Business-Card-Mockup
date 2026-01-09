import React from 'react';
import { ScanRecord } from '../types';
import { Clock, CheckCircle, Mail, ChevronRight, X, Phone } from 'lucide-react';

interface HistoryListProps {
  records: ScanRecord[];
  onClose: () => void;
  onSelectRecord: (record: ScanRecord) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ records, onClose, onSelectRecord }) => {
  return (
    <div className="h-full bg-[#01161e] flex flex-col shadow-2xl">
      <div className="p-6 flex items-center justify-between border-b border-[#f7dba7]/10 bg-[#01161e]">
        <h2 className="text-xl font-bold text-[#f7dba7]">Scan History</h2>
        <button onClick={onClose} className="p-2 hover:bg-[#f7dba7]/10 rounded-full text-[#247ba0] tap-active transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {records.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#f7dba7]/30">
            <Clock className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-medium">No scans yet.</p>
          </div>
        ) : (
          records.map((record, index) => (
            <button 
              key={record.id} 
              onClick={() => onSelectRecord(record)}
              className="w-full text-left bg-[#f7dba7]/5 rounded-xl p-4 flex items-center gap-4 border border-[#f7dba7]/5 active:scale-[0.99] transition-all hover:bg-[#f7dba7]/10 animate-fade-in group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-[#000] overflow-hidden shrink-0 border border-[#f7dba7]/20">
                {record.imageUri ? (
                  <img src={record.imageUri} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Scan" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#247ba0]/20">
                    <Mail className="w-5 h-5 text-[#247ba0]" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[#f7dba7] font-semibold text-base truncate">{record.contact.name || 'Unknown Person'}</h3>
                <p className="text-[#f7dba7]/60 text-xs truncate mb-1">{record.contact.company || 'Unknown Company'}</p>
                
                <div className="flex items-center gap-2">
                   {record.status.includes('sent') && (
                     <div className="flex items-center gap-1 text-[#247ba0]">
                       <CheckCircle className="w-3 h-3" />
                       <span className="text-[10px] uppercase font-bold tracking-wide">
                         {record.status === 'sent_gmail' ? 'Gmail' : 'Sent'}
                       </span>
                     </div>
                   )}
                   <span className="text-[10px] text-[#f7dba7]/40 border-l border-[#f7dba7]/20 pl-2">
                     {new Date(record.timestamp).toLocaleDateString()}
                   </span>
                </div>
              </div>

              <div className="text-[#f7dba7]/20 group-hover:text-[#f7dba7]/50 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};