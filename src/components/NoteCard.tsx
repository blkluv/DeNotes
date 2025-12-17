import { Dispatch, SetStateAction, useState } from "react";
import SimpleAdvisorNote from "../types/SimpleAdvisorNote";

type NoteProps = {
  noteData: SimpleAdvisorNote;
  setNoteData: Dispatch<SetStateAction<SimpleAdvisorNote>>;
  handleOpen: () => void;
  onSign: () => void;
};

function NoteCard({ noteData, setNoteData, handleOpen, onSign }: NoteProps) {
  const [copied, setCopied] = useState(false);
  
  const ipfsLink = `https://ipfs.io/ipfs/${noteData.cid}`;
  const shortCid = noteData.cid.substring(0, 8) + '...' + noteData.cid.substring(noteData.cid.length - 4);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ipfsLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'signed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getComplianceRuleText = (rule: string) => {
    switch (rule) {
      case 'FINRA_2111': return 'FINRA 2111';
      case 'SEC_REG_BI': return 'SEC Reg BI';
      case 'FIDUCIARY': return 'Fiduciary';
      case 'KYC': return 'KYC';
      case 'AML': return 'AML';
      default: return 'Compliance';
    }
  };

  return (
    <div className="overflow-hidden transition-shadow bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-xl hover:shadow-xl dark:border-gray-700">
      {/* Header with status */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(noteData.status)}`}>
              {noteData.status.toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(noteData.meetingDate).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div 
        className="p-6 cursor-pointer"
        onClick={() => {
          setNoteData(noteData);
          handleOpen();
        }}
      >
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {noteData.meetingTitle}
        </h3>
        
        <div className="mb-4">
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Client: <span className="font-medium text-gray-900 dark:text-white">{noteData.clientName}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Advisor: <span className="font-medium text-gray-900 dark:text-white">{noteData.advisorName || "Not assigned"}</span>
          </p>
        </div>
        
        {/* Quick summary */}
        <p className="mb-4 text-gray-700 dark:text-gray-300 line-clamp-2">
          {noteData.summary || "Meeting notes..."}
        </p>
        
        {/* Compliance indicator */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">COMPLIANCE</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span 
              className={`px-2 py-1 rounded text-xs ${
                noteData.complianceSatisfied 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}
            >
              {getComplianceRuleText(noteData.complianceRule)}
              {noteData.complianceSatisfied ? ' ✓' : ' ⚠️'}
            </span>
            
            {/* Signature status */}
            {noteData.advisorSigned && (
              <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-300">
                Advisor Signed
              </span>
            )}
            {noteData.clientAcknowledged && (
              <span className="px-2 py-1 text-xs text-purple-800 bg-purple-100 rounded dark:bg-purple-900 dark:text-purple-300">
                Client Ack
              </span>
            )}
          </div>
        </div>
        
        {/* Recommendations count */}
        {noteData.recommendations && noteData.recommendations.length > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {noteData.recommendations.length} recommendation(s)
          </div>
        )}
      </div>
      
      {/* Footer with actions */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {/* IPFS link */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Copy IPFS link"
          >
            <span>🔗</span>
            <span className="font-mono text-xs">{shortCid}</span>
          </button>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {noteData.status === 'draft' && !noteData.advisorSigned && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSign();
                }}
                className="px-3 py-1 text-sm text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
              >
                Sign Note
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNoteData(noteData);
                handleOpen();
              }}
              className="px-3 py-1 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              View
            </button>
          </div>
        </div>
        
        {/* Copy feedback */}
        {copied && (
          <div className="mt-2 text-xs text-green-600 dark:text-green-400">
            ✓ IPFS link copied to clipboard
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteCard;