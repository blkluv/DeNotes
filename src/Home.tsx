import { useEffect, useState, useCallback } from "react";
import { useStorage } from "@thirdweb-dev/react"; // Removed useAddress
import Button from "./components/Button";
import Header from "./components/Header";
import Loader from "./components/Loader";
import Modal from "./components/Modal";
import SimpleAdvisorNote from "./types/SimpleAdvisorNote";
import NoteCard from "./components/NoteCard";
import Background from "./components/Background";
import { useCookie } from "./contexts/CookieProvider";

// Initial note aligned with SimpleAdvisorNote type
const initAdvisorNote: SimpleAdvisorNote = {
  cid: "",
  meetingTitle: "",
  meetingDate: new Date().toISOString().split('T')[0],
  clientName: "",
  advisorName: "",
  
  // Core content
  summary: "",
  recommendations: [],
  disclosures: [],
  nextSteps: [],
  
  // Compliance
  complianceRule: "FINRA_2111",
  complianceSatisfied: false,
  
  // Signatures
  advisorSigned: false,
  clientAcknowledged: false,
  
  // Timestamps
  createdAt: "",
  updatedAt: "",
  
  // Status
  status: "draft",
};

function Home() {
  const [noteData, setNoteData] = useState<SimpleAdvisorNote>(initAdvisorNote);
  const [notes, setNotes] = useState<SimpleAdvisorNote[]>([]);
  const [uris, setUris] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUri, setSelectedUri] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'all' | 'drafts' | 'signed'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const storage = useStorage();
  const { getCookie, updateCookie } = useCookie();

  // Load cookies on initial mount
  useEffect(() => {
    const cookie = getCookie();
    if (cookie?.length) {
      setUris(cookie);
    }
  }, [getCookie]);

  // Data fetching function
  const retrieveData = useCallback(async () => {
    if (!storage || uris.length === 0) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotes([]);

    try {
      const notesPromises = uris.map(async (uri) => {
        const data = await storage.downloadJSON(uri);
        return {
          ...data,
          cid: uri.replace('ipfs://', ''),
        } as SimpleAdvisorNote;
      });

      const downloadedNotes = await Promise.all(notesPromises);
      setNotes(downloadedNotes);
    } catch (error) {
      console.error("Failed to retrieve notes:", error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [storage, uris]);

  // Run data fetch when URIs change
  useEffect(() => {
    updateCookie(uris);
    retrieveData();
  }, [uris, retrieveData, updateCookie]);

  const handleClose = () => {
    setNoteData(initAdvisorNote);
    setModalOpen(false);
    setSelectedUri("");
  };

  // Create new advisor note
  const handleCreate = async () => {
    if (!noteData.meetingTitle || !noteData.clientName) {
      handleClose();
      return;
    }

    setSaving(true);

    // Prepare note with timestamps
    const time = new Date().toISOString();
    const noteToSave = {
      ...noteData,
      cid: "", // Will be set by IPFS
      createdAt: time,
      updatedAt: time,
      status: "draft",
      advisorSigned: false,
      clientAcknowledged: false,
    };

    try {
      const _uris = await storage?.uploadBatch([noteToSave]);
      if (_uris && _uris[0]) {
        setUris((prev) => [...prev, _uris[0]]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      handleClose();
      setSaving(false);
    }
  };

  // Update existing note
  const handleUpdate = async () => {
    if (!selectedUri) {
      handleClose();
      return;
    }

    setSaving(true);

    const noteToUpdate = {
      ...noteData,
      updatedAt: new Date().toISOString(),
    };

    try {
      const _uris = await storage?.uploadBatch([noteToUpdate]);
      if (_uris && _uris[0]) {
        setUris((prev) =>
          prev.map((uri) => (uri === selectedUri ? _uris[0] : uri))
        );
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      handleClose();
      setSaving(false);
    }
  };

  // DELETE function - FIXED: Added missing handleDelete
  const handleDelete = () => {
    if (!selectedUri) return;
    setUris((prev) => prev.filter((uri) => uri !== selectedUri));
    handleClose();
  };

  // Digital signature function
  const handleSignNote = async (note: SimpleAdvisorNote) => {
    const signedNote = {
      ...note,
      status: "signed" as const,
      advisorSigned: true,
      updatedAt: new Date().toISOString(),
    };

    // Upload signed version
    try {
      const _uris = await storage?.uploadBatch([signedNote]);
      if (_uris && _uris[0]) {
        setUris((prev) =>
          prev.map((uri) => (uri === `ipfs://${note.cid}` ? _uris[0] : uri))
        );
      }
    } catch (error) {
      console.error("Signing failed:", error);
    }
  };

  // Filter notes based on view - FIXED: Typo "metingTitle" → "meetingTitle"
  const filteredNotes = notes.filter((note) => {
    if (view === 'drafts') return note.status === 'draft';
    if (view === 'signed') return note.status === 'signed';
    return true;
  }).filter((note) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.clientName.toLowerCase().includes(query) ||
      note.meetingTitle.toLowerCase().includes(query) || // Fixed typo
      note.summary?.toLowerCase().includes(query) ||
      note.recommendations?.some(rec => rec.toLowerCase().includes(query))
    );
  });

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
          handleDelete={handleDelete} // ADDED: Missing prop
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
              New Meeting Note
            </Button>
          </div>
        }
      />
      
      <main className="min-h-screen pt-24 transition-all p-7 bg-light-primary text-dark-primary dark:bg-dark-primary dark:text-light-primary">
        <div className="container mx-auto">
          <Background />
          
          {/* Financial Advisor Dashboard Header */}
          <div className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              Financial Advisor Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Immutable, compliant meeting notes. Everything timestamped and verifiable on IPFS.
            </p>
            
            <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-4">
              <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {notes.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Notes
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {notes.filter(n => n.status === 'signed').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Signed Documents
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {notes.filter(n => n.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Drafts
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {new Set(notes.map(n => n.clientName)).size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Unique Clients
                </div>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col gap-4 mb-6 md:flex-row">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by client name, meeting title, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                props={{
                  onClick: () => setView('all'),
                  className: view === 'all' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800',
                }}
              >
                All Notes
              </Button>
              <Button
                props={{
                  onClick: () => setView('drafts'),
                  className: view === 'drafts' ? 'bg-yellow-600' : 'bg-gray-200 dark:bg-gray-800',
                }}
              >
                Drafts
              </Button>
              <Button
                props={{
                  onClick: () => setView('signed'),
                  className: view === 'signed' ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-800',
                }}
              >
                Signed
              </Button>
            </div>
          </div>
          
          {/* Notes Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-72">
              <Loader />
              <p>Loading advisor notes...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredNotes.length === 0 ? (
                <div className="py-12 text-center bg-white dark:bg-gray-800 rounded-xl">
                  <div className="mb-4 text-6xl">📊</div>
                  <h3 className="mb-4 text-2xl font-bold">No Meeting Notes Yet</h3>
                  <p className="mb-6 text-gray-600 dark:text-gray-400">
                    Create your first compliant meeting note to start building immutable records.
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
                    Create First Meeting Note
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredNotes.map((note, i) => (
                    <div key={i} className="relative">
                      <NoteCard
                        noteData={note}
                        setNoteData={setNoteData}
                        handleOpen={() => {
                          setSelectedUri(`ipfs://${note.cid}`);
                          setModalOpen(true);
                        }}
                        onSign={() => handleSignNote(note)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Compliance Footer Note */}
          <div className="p-4 mt-8 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
            <p className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-300">
              <span className="text-lg">⚖️</span>
              <strong>Compliance Ready:</strong> All notes are timestamped on IPFS and can be verified for FINRA/SEC compliance audits.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;