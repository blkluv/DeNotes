import { Dispatch, SetStateAction, useState } from "react";
import NoteType from "../types/NoteType";

// Define the NoteProps type at the top
type NoteProps = {
  noteData: NoteType;
  setNoteData: Dispatch<SetStateAction<NoteType>>;
  handleOpen: () => void;
};

function NoteCard({ noteData, setNoteData, handleOpen }: NoteProps) {
  const [copied, setCopied] = useState(false);
  
  // Create the shareable link
  const ipfsLink = `https://ipfs.io/ipfs/${noteData.cid}`;
  // Shortened version for display
  const shortCid = noteData.cid.substring(0, 8) + '...' + noteData.cid.substring(noteData.cid.length - 4);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the note
    
    // Try to use Web Share API first (mobile/desktop)
    if (navigator.share) {
      navigator.share({
        title: noteData.title || 'Shared Note',
        text: noteData.content?.substring(0, 100) || 'Check out this note',
        url: ipfsLink,
      });
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(ipfsLink)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = ipfsLink;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
    }
  };

  // Format dates
  const createdDate = new Date(noteData.createdAt);
  const updatedDate = new Date(noteData.updatedAt);
  const wasUpdated = createdDate.getTime() !== updatedDate.getTime();

  return (
    <div className="relative group">
      <button
        className="w-full px-5 py-3 text-left transition-all rounded-md shadow-md outline-none cursor-pointer bg-light-notebg text-dark-primary dark:bg-dark-notebg dark:text-light-primary hover:-translate-y-1 hover:shadow-lg focus:-translate-y-1 focus:shadow-lg"
        onClick={() => {
          setNoteData(noteData);
          handleOpen();
        }}
      >
        <h1 className="mb-2 text-3xl">{noteData.title || <>&nbsp;</>}</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300 line-clamp-3">
          {noteData.content || <>&nbsp;</>}
        </p>
        
        {/* PERMANENT SHARE LINK SECTION - ALWAYS VISIBLE */}
        <div className="p-2 mb-3 bg-gray-100 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">🔗</span>
              <span className="font-mono text-xs text-gray-700 truncate dark:text-gray-300">
                {shortCid}
              </span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-700 transition-colors bg-blue-100 rounded hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300"
              title="Copy public link"
            >
              {copied ? (
                <>
                  <span className="text-green-600">✓</span>
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            Permanent public link • Anyone can view
          </p>
        </div>
        
        {/* Timestamps */}
        <div className="pt-2 border-t border-gray-300 dark:border-gray-700">
          <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <span className="text-[10px]">📅</span>
              <span>Created: {createdDate.toLocaleDateString()}</span>
            </div>
            
            {wasUpdated && (
              <div className="flex items-center gap-1">
                <span className="text-[10px]">✏️</span>
                <span>Updated: {updatedDate.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

export default NoteCard;