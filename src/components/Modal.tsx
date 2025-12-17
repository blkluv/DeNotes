import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Button from "./Button";
import SimpleAdvisorNote from "../types/SimpleAdvisorNote";
import Input from "./Input";
import Textarea from "./Textarea";
import dateToString from "../utilities/DateToString";

interface Props {
  isNew: boolean;
  noteData: SimpleAdvisorNote;
  setNoteData: Dispatch<SetStateAction<SimpleAdvisorNote>>;
  handleClose: () => void;
  handleCreate: () => void;
  handleUpdate: () => void;
  handleDelete: () => void;
  saving: boolean;
}

function Modal({
  isNew,
  noteData,
  setNoteData,
  handleClose,
  handleCreate,
  handleUpdate,
  handleDelete,
  saving,
}: Props) {
  const [recommendationInput, setRecommendationInput] = useState("");
  const [disclosureInput, setDisclosureInput] = useState("");
  const [nextStepInput, setNextStepInput] = useState("");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    addEventListener("keydown", handleEsc);
    return () => {
      removeEventListener("keydown", handleEsc);
    };
  }, []);

  const addRecommendation = () => {
    if (recommendationInput.trim()) {
      setNoteData(prev => ({
        ...prev,
        recommendations: [...(prev.recommendations || []), recommendationInput.trim()]
      }));
      setRecommendationInput("");
    }
  };

  const addDisclosure = () => {
    if (disclosureInput.trim()) {
      setNoteData(prev => ({
        ...prev,
        disclosures: [...(prev.disclosures || []), disclosureInput.trim()]
      }));
      setDisclosureInput("");
    }
  };

  const addNextStep = () => {
    if (nextStepInput.trim()) {
      setNoteData(prev => ({
        ...prev,
        nextSteps: [...(prev.nextSteps || []), nextStepInput.trim()]
      }));
      setNextStepInput("");
    }
  };

  const removeItem = (array: "recommendations" | "disclosures" | "nextSteps", index: number) => {
    setNoteData(prev => ({
      ...prev,
      [array]: prev[array]?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <>
      <div
        className="fixed top-0 bottom-0 left-0 right-0 z-20 flex items-center justify-center bg-transparent backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        px-6 py-4 pb-6 w-11/12 md:w-9/12 max-h-[90vh] overflow-y-auto
        rounded-lg shadow-md z-20
        bg-light-notebg text-dark-primary dark:bg-dark-notebg dark:text-light-primary"
      >
        <div className="flex items-center justify-between gap-6 mb-4">
          <p className="text-xs break-all text-zinc-500 md:text-sm">
            CID: {noteData.cid || "Not assigned"}
          </p>
          <Button
            props={{
              onClick: handleDelete,
              disabled: isNew,
              className: "bg-red-600 hover:bg-red-700",
            }}
          >
            Delete
          </Button>
        </div>

        {/* Meeting Title */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Meeting Title *</label>
          <Input
            props={{
              type: "text",
              autoFocus: true,
              value: noteData.meetingTitle,
              onChange: (e: any) => {
                setNoteData(prev => ({
                  ...prev,
                  meetingTitle: e.target.value,
                }));
              },
              placeholder: "Annual Review, Portfolio Check-in, etc.",
              className: "text-xl w-full",
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
          {/* Client Name */}
          <div>
            <label className="block mb-1 text-sm font-medium">Client Name *</label>
            <Input
              props={{
                type: "text",
                value: noteData.clientName,
                onChange: (e: any) => {
                  setNoteData(prev => ({
                    ...prev,
                    clientName: e.target.value,
                  }));
                },
                placeholder: "Client's name",
                className: "w-full",
              }}
            />
          </div>

          {/* Meeting Date */}
          <div>
            <label className="block mb-1 text-sm font-medium">Meeting Date *</label>
            <Input
              props={{
                type: "date",
                value: noteData.meetingDate,
                onChange: (e: any) => {
                  setNoteData(prev => ({
                    ...prev,
                    meetingDate: e.target.value,
                  }));
                },
                className: "w-full",
              }}
            />
          </div>
        </div>

        {/* Advisor Name */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Advisor Name</label>
          <Input
            props={{
              type: "text",
              value: noteData.advisorName || "",
              onChange: (e: any) => {
                setNoteData(prev => ({
                  ...prev,
                  advisorName: e.target.value,
                }));
              },
              placeholder: "Your name",
              className: "w-full",
            }}
          />
        </div>

        {/* Summary */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Meeting Summary</label>
          <Textarea
            props={{
              value: noteData.summary || "",
              onChange: (e: any) => {
                setNoteData(prev => ({
                  ...prev,
                  summary: e.target.value,
                }));
              },
              placeholder: "Brief summary of the meeting...",
              rows: 4,
            }}
          />
        </div>

        {/* Recommendations */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Recommendations</label>
          <div className="flex gap-2 mb-2">
            <Input
              props={{
                type: "text",
                value: recommendationInput,
                onChange: (e: any) => setRecommendationInput(e.target.value),
                placeholder: "Add a recommendation...",
                className: "flex-1",
                onKeyDown: (e: any) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRecommendation();
                  }
                }
              }}
            />
            <Button
              props={{
                onClick: addRecommendation,
                className: "bg-green-600 hover:bg-green-700",
              }}
            >
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {noteData.recommendations?.map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded dark:bg-gray-800">
                <span className="flex-1">• {rec}</span>
                <button
                  onClick={() => removeItem("recommendations", index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Disclosures */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Disclosures</label>
          <div className="flex gap-2 mb-2">
            <Input
              props={{
                type: "text",
                value: disclosureInput,
                onChange: (e: any) => setDisclosureInput(e.target.value),
                placeholder: "Add a disclosure...",
                className: "flex-1",
                onKeyDown: (e: any) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDisclosure();
                  }
                }
              }}
            />
            <Button
              props={{
                onClick: addDisclosure,
                className: "bg-yellow-600 hover:bg-yellow-700",
              }}
            >
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {noteData.disclosures?.map((disclosure, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded bg-yellow-50 dark:bg-yellow-900/30">
                <span className="flex-1">⚠️ {disclosure}</span>
                <button
                  onClick={() => removeItem("disclosures", index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Next Steps</label>
          <div className="flex gap-2 mb-2">
            <Input
              props={{
                type: "text",
                value: nextStepInput,
                onChange: (e: any) => setNextStepInput(e.target.value),
                placeholder: "Add a next step...",
                className: "flex-1",
                onKeyDown: (e: any) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addNextStep();
                  }
                }
              }}
            />
            <Button
              props={{
                onClick: addNextStep,
                className: "bg-blue-600 hover:bg-blue-700",
              }}
            >
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {noteData.nextSteps?.map((step, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded bg-blue-50 dark:bg-blue-900/30">
                <span className="flex-1">→ {step}</span>
                <button
                  onClick={() => removeItem("nextSteps", index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Section */}
        <div className="p-4 mb-6 bg-gray-100 rounded-lg dark:bg-gray-800">
          <h3 className="flex items-center gap-2 mb-3 font-semibold">
            <span>⚖️</span>
            Compliance Settings
          </h3>
          
          <div className="mb-3">
            <label className="block mb-1 text-sm font-medium">Compliance Rule</label>
            <select
              value={noteData.complianceRule}
              onChange={(e: any) => {
                setNoteData(prev => ({
                  ...prev,
                  complianceRule: e.target.value,
                }));
              }}
              className="w-full p-2 bg-white border border-gray-300 rounded dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="FINRA_2111">FINRA 2111 - Suitability</option>
              <option value="SEC_REG_BI">SEC Regulation BI - Best Interest</option>
              <option value="FIDUCIARY">Fiduciary Duty</option>
              <option value="KYC">KYC - Know Your Client</option>
              <option value="AML">AML - Anti-Money Laundering</option>
              <option value="OTHER">Other Compliance Rule</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="complianceSatisfied"
              checked={noteData.complianceSatisfied}
              onChange={(e: any) => {
                setNoteData(prev => ({
                  ...prev,
                  complianceSatisfied: e.target.checked,
                }));
              }}
              className="mr-2"
            />
            <label htmlFor="complianceSatisfied" className="text-sm">
              Compliance requirement satisfied
            </label>
          </div>
          
          <div className="flex items-center mt-3">
            <input
              type="checkbox"
              id="advisorSigned"
              checked={noteData.advisorSigned}
              onChange={(e: any) => {
                setNoteData(prev => ({
                  ...prev,
                  advisorSigned: e.target.checked,
                }));
              }}
              className="mr-2"
            />
            <label htmlFor="advisorSigned" className="text-sm">
              Advisor has digitally signed this note
            </label>
          </div>
          
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="clientAcknowledged"
              checked={noteData.clientAcknowledged}
              onChange={(e: any) => {
                setNoteData(prev => ({
                  ...prev,
                  clientAcknowledged: e.target.checked,
                }));
              }}
              className="mr-2"
            />
            <label htmlFor="clientAcknowledged" className="text-sm">
              Client has acknowledged receipt
            </label>
          </div>
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium">Status</label>
          <div className="flex gap-2">
            <button
              onClick={() => setNoteData(prev => ({ ...prev, status: "draft" }))}
              className={`px-4 py-2 rounded ${noteData.status === "draft" ? "bg-yellow-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              Draft
            </button>
            <button
              onClick={() => setNoteData(prev => ({ ...prev, status: "signed" }))}
              className={`px-4 py-2 rounded ${noteData.status === "signed" ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              Signed
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-300 dark:border-gray-700">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Created: {isNew ? "Now" : dateToString(new Date(noteData.createdAt))}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last update: {isNew ? "Now" : dateToString(new Date(noteData.updatedAt))}
            </p>
          </div>

          <p className="hidden select-none text-zinc-500 md:block">
            esc to close
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button
              props={{
                onClick: handleClose,
                className: "bg-gray-500 hover:bg-gray-600",
              }}
            >
              Cancel
            </Button>
            <Button
              props={{
                onClick: isNew ? handleCreate : handleUpdate,
                disabled: saving || !noteData.meetingTitle || !noteData.clientName,
                className: "bg-blue-600 hover:bg-blue-700",
              }}
            >
              {isNew
                ? saving
                  ? "Creating..."
                  : "Save Meeting Note"
                : saving
                ? "Updating..."
                : "Update Meeting Note"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal;