// ... imports and types same as above

function NoteCard({ noteData, setNoteData, handleOpen }: NoteProps) {
  const [copied, setCopied] = useState(false);
  const ipfsLink = `https://ipfs.io/ipfs/${noteData.cid}`;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: noteData.title || 'Shared Note',
        text: noteData.content?.substring(0, 100) || 'Check out this note',
        url: ipfsLink,
      });
    } else {
      navigator.clipboard.writeText(ipfsLink)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
    }
  };

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
        <p className="mb-3 text-gray-700 dark:text-gray-300 line-clamp-3">
          {noteData.content || <>&nbsp;</>}
        </p>
        
        {/* Compact Share Section */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-600 dark:text-blue-400">🌐</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Public</span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-3 py-1 text-xs text-blue-700 transition-colors bg-blue-100 rounded-full hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300"
            title={copied ? "Copied to clipboard!" : "Copy public link"}
          >
            {copied ? (
              <span className="text-green-600">✓ Copied</span>
            ) : (
              <>
                <span>🔗</span>
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
        
        {/* Timestamps */}
        <div className="pt-2 border-t border-gray-300 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-[10px]">📅</span>
              {createdDate.toLocaleDateString()}
            </span>
            {wasUpdated && (
              <span className="flex items-center gap-1">
                <span className="text-[10px]">✏️</span>
                Updated
              </span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

export default NoteCard;