import { useEffect, useState, useCallback } from "react";
import { useStorage } from "@thirdweb-dev/react";
import Button from "./components/Button";
import Header from "./components/Header";
import Loader from "./components/Loader";
import Modal from "./components/Modal";
import NoteType from "./types/NoteType";
import NoteCard from "./components/NoteCard";
import Background from "./components/Background";
import { useCookie } from "./contexts/CookieProvider";

const initNote = {
  cid: "",
  title: "",
  content: "",
  createdAt: "",
  updatedAt: "",
};

function Home() {
  const [noteData, setNoteData] = useState<NoteType>(initNote);
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [uris, setUris] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUri, setSelectedUri] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(true); // New state for explanation

  const storage = useStorage();
  const { getCookie, updateCookie } = useCookie();

  // Load cookies on initial mount
  useEffect(() => {
    const cookie = getCookie();
    if (cookie?.length) {
      setUris(cookie);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FIXED: Stable data-fetching function with proper loading state handling
  const retrieveData = useCallback(async () => {
    console.log("[DEBUG] retrieveData called. Storage exists?", !!storage, "URIs count:", uris.length);

    // CRITICAL FIX: Set loading to false if there's nothing to load
    if (!storage || uris.length === 0) {
      console.log("[DEBUG] No storage or URIs. Stopping.");
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotes([]); // Clear notes first

    try {
      // Download ALL notes in parallel (efficient)
      const notesPromises = uris.map(async (uri) => {
        console.log("[DEBUG] Downloading URI:", uri);
        const data = await storage.downloadJSON(uri);
        // Return a complete NoteType object
        return {
          ...data,
          cid: uri.replace('ipfs://', ''), // Extract CID from URI
        };
      });

      const downloadedNotes = await Promise.all(notesPromises);
      console.log("[DEBUG] Successfully downloaded notes:", downloadedNotes.length);
      setNotes(downloadedNotes);
    } catch (error) {
      console.error("[DEBUG] Failed to retrieve notes:", error);
      setNotes([]);
    } finally {
      console.log("[DEBUG] Setting loading to false");
      setLoading(false);
    }
  }, [storage, uris]); // Dependencies are now explicit

  // FIXED: Run data fetch only when URIs change
  useEffect(() => {
    console.log("[DEBUG useEffect] Running. URIs changed:", uris);
    updateCookie(uris);
    retrieveData();
  }, [uris, retrieveData, updateCookie]); // Added retrieveData and updateCookie

  const handleClose = () => {
    setNoteData(initNote);
    setModalOpen(false);
    setSelectedUri("");
  };

  const handleCreate = async () => {
    if (!noteData.title && !noteData.content) {
      handleClose();
      return;
    }

    setSaving(true);

    // Prepare data for upload: create a new object without the placeholder `cid`
    const { cid, ...uploadData } = noteData; // `cid` here is empty string ""
    const time = new Date().toISOString();
    uploadData.createdAt = time;
    uploadData.updatedAt = time;

    try {
      const _uris = await storage?.uploadBatch([uploadData]);
      if (_uris && _uris[0]) {
        // Add the new URI (which contains the new, real CID) to the list
        setUris((prev) => [...prev, _uris[0]]);
      }
    } catch (error) {
      console.error("[DEBUG] Upload failed:", error);
    } finally {
      handleClose();
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!noteData.title && !noteData.content || !selectedUri) {
      handleClose();
      return;
    }

    setSaving(true);

    // Prepare data: upload the new content
    const { cid, ...uploadData } = noteData; // `cid` here is the OLD CID (for display only)
    uploadData.updatedAt = new Date().toISOString();

    try {
      const _uris = await storage?.uploadBatch([uploadData]);
      if (_uris && _uris[0]) {
        // Replace the old URI with the new one in the list
        setUris((prev) =>
          prev.map((uri) => (uri === selectedUri ? _uris[0] : uri))
        );
      }
    } catch (error) {
      console.error("[DEBUG] Update failed:", error);
    } finally {
      handleClose();
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!selectedUri) return;
    setUris((prev) => prev.filter((uri) => uri !== selectedUri));
    handleClose();
  };

  return (
    <>
      {modalOpen && (
        <Modal
          isNew={!selectedUri}
          noteData={noteData}
          setNoteData={setNoteData}
          handleClose={handleClose}
          handleCreate={handleCreate}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
          saving={saving}
        />
      )}
      <Header
        items={
          <div className="flex gap-4">
            <Button
              props={{
                onClick: () => {
                  setSelectedUri("");
                  setModalOpen(true);
                },
              }}
            >
              New Note
            </Button>
            <Button
              props={{
                onClick: () => setShowExplanation(!showExplanation),
                className: "bg-gray-500 hover:bg-gray-600",
              }}
            >
              {showExplanation ? "Hide Info" : "How It Works"}
            </Button>
          </div>
        }
      />
      <main className="min-h-screen pt-24 transition-all p-7 bg-light-primary text-dark-primary dark:bg-dark-primary dark:text-light-primary">
        <div className="container mx-auto">
          <Background />
          
          {/* EXPLANATION SECTION - Simple language for public advisors */}
          {showExplanation && (
            <div className="p-6 mb-8 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-xl dark:border-blue-800">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                  📝 Welcome to NoteVisor - Your Public Ledger Tool
                </h2>
                <button 
                  onClick={() => setShowExplanation(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 mt-1 bg-blue-100 rounded-lg dark:bg-blue-800">
                      🔍
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">Transparent by Design</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        All notes are stored publicly on decentralized storage. Think of it like a public bulletin board - anyone with the link can view.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 mt-1 bg-green-100 rounded-lg dark:bg-green-800">
                      🔗
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Immutable Record</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        Once saved, notes cannot be secretly changed. Updates create new versions, maintaining a complete history.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 mt-1 bg-purple-100 rounded-lg dark:bg-purple-800">
                      👥
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">For Public Advisors</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        Perfect for meeting notes, public records, or shared documentation. Everything is visible and verifiable by all stakeholders.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 mt-1 rounded-lg bg-amber-100 dark:bg-amber-800">
                      ⚠️
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400">Privacy Note</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Do not store private/sensitive information.</strong> All content is publicly accessible via its unique link (CID).
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <h4 className="mb-2 font-bold text-gray-800 dark:text-gray-200">Quick Guide:</h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-500 rounded-full">1</span>
                      <span>Click "New Note" to create public documentation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-500 rounded-full">2</span>
                      <span>Share the note's link with stakeholders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-500 rounded-full">3</span>
                      <span>Updates preserve the entire history</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-500 rounded-full">4</span>
                      <span>All data is stored on decentralized networks</span>
                    </li>
                  </ul>
                  
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs italic text-gray-600 dark:text-gray-400">
                      Tip: Use for meeting minutes, public announcements, shared research, or transparent project documentation.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 mt-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-300">
                  <span className="text-lg">💡</span>
                  <strong>Best Practice:</strong> Treat every note as if it will be printed on a public notice board. This ensures transparency and builds trust with your audience.
                </p>
              </div>
            </div>
          )}
          
          {/* MAIN CONTENT AREA */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-72">
              <Loader />
              <p>Loading your public notes...</p>
            </div>
          ) : (
            <>
              {notes.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="mb-4 text-6xl">📝</div>
                    <h3 className="mb-4 text-2xl font-bold">No Public Notes Yet</h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                      Create your first note to start building transparent, publicly-accessible documentation.
                    </p>
                    <Button
                      props={{
                        onClick: () => {
                          setSelectedUri("");
                          setModalOpen(true);
                        },
                        className: "px-6 py-3 text-lg",
                      }}
                    >
                      Create Your First Public Note
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">
                      Your Public Notes ({notes.length})
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      All notes are publicly accessible and verifiable
                    </p>
                  </div>
                  
                  <div className="relative z-10 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {notes.map((note, i) => (
                      <NoteCard
                        key={i}
                        noteData={note}
                        setNoteData={setNoteData}
                        handleOpen={() => {
                          setSelectedUri(`ipfs://${note.cid}`);
                          setModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="mt-8 text-sm text-center text-gray-500 dark:text-gray-400">
                    <p>
                      ℹ️ Each note is stored on decentralized storage. Anyone with the link can view its content.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default Home;