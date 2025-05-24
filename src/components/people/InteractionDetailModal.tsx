import React, { useState, useEffect } from 'react';
import { Interaction, ChangelogEntry } from '../../types/people';
import { HiOutlineXMark, HiOutlineCalendarDays, HiOutlineInformationCircle, HiOutlineClipboardDocumentList, HiOutlineUser, HiOutlineClock, HiOutlinePencil } from 'react-icons/hi2';

interface InteractionDetailModalProps {
    interaction: Interaction;
    onClose: () => void;
}

const ANIMATION_DURATION = 200; // ms, match with Tailwind duration class e.g., duration-200

const InteractionDetailModal: React.FC<InteractionDetailModalProps> = ({ interaction, onClose }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 10);
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleAnimatedClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('keydown', handleEsc);
            setIsMounted(false); // Reset mount state on close
        };
    }, []); // Empty dependency array ensures this runs only once on mount and cleanup on unmount

    const handleAnimatedClose = () => {
        setIsAnimatingOut(true);
        setIsMounted(false);
        setTimeout(() => {
            onClose();
            // No need to set isAnimatingOut to false here as component will unmount
        }, ANIMATION_DURATION);
    };

    if (!interaction) return null;

    const backdropOpacity = isMounted && !isAnimatingOut ? 'opacity-100' : 'opacity-0';
    const panelOpacity = isMounted && !isAnimatingOut ? 'opacity-100' : 'opacity-0';
    const panelScale = isMounted && !isAnimatingOut ? 'scale-100' : 'scale-95';

    const renderChangeDetail = (key: string, before: any, after: any) => {
        const formatValue = (value: any) => {
            if (typeof value === 'undefined' || value === null || value === '') return <span className="italic text-gray-400">empty</span>;
            if (typeof value === 'boolean') return value ? 'True' : 'False';
            if (value instanceof Date) return value.toLocaleString();
            if (Array.isArray(value)) return value.join(', ');
            return String(value);
        };

        return (
            <li key={key} className="text-sm">
                <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> changed from {' '} {formatValue(before)} {' '}
                to {formatValue(after)}
            </li>
        );
    };

    return (
        <div
            className={`fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 transition-opacity duration-${ANIMATION_DURATION} ease-in-out ${backdropOpacity} bg-black/30 backdrop-blur-sm`}
            onClick={handleAnimatedClose}
        >
            <div
                className={`relative bg-white w-full max-w-lg mx-auto rounded-lg shadow-xl p-6 space-y-4 transition-all duration-${ANIMATION_DURATION} ease-in-out ${panelOpacity} ${panelScale}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <HiOutlineInformationCircle className="h-6 w-6 mr-2 text-blue-500" />
                        Interaction Details
                    </h3>
                    <button onClick={handleAnimatedClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <HiOutlineXMark className="h-6 w-6" />
                    </button>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <div className="flex items-center">
                            <HiOutlineClipboardDocumentList className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-500 mr-1">Type:</span>
                            <span className="text-gray-800 font-medium">{interaction.type}</span>
                        </div>
                        <div className="flex items-center">
                            <HiOutlineUser className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-500 mr-1">Contact:</span>
                            <span className="text-gray-800 font-medium">{interaction.contactName}</span>
                        </div>
                        <div className="flex items-center">
                            <HiOutlineCalendarDays className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-500 mr-1">Due:</span>
                            <span className="text-gray-800 font-medium">{new Date(interaction.dueDate).toLocaleDateString()} {new Date(interaction.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center">
                            <HiOutlinePencil className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-500 mr-1">Status:</span>
                            <span className={`font-medium px-2 py-0.5 rounded-full text-xs 
                                ${interaction.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                    interaction.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'}`
                            }>
                                {interaction.status}
                            </span>
                        </div>
                    </div>
                    {interaction.details && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-start">
                                <HiOutlinePencil className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-gray-500 text-sm">Details:</span>
                                    <p className="text-gray-800 text-sm whitespace-pre-wrap">{interaction.details}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {interaction.changelog && interaction.changelog.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                            <HiOutlineClock className="h-5 w-5 mr-2 text-gray-500" />
                            Change History
                        </h4>
                        <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-2 simple-scrollbar">
                            {interaction.changelog.slice().reverse().map(entry => (
                                <li key={entry.timestamp} className="p-2 rounded-md bg-gray-50 border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-0.5">{new Date(entry.timestamp).toLocaleString()}</div>
                                    <ul className="list-disc list-inside pl-1 space-y-0.5">
                                        {Object.entries(entry.updateDetails).map(([key, [before, after]]) => renderChangeDetail(key, before, after))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {(!interaction.changelog || interaction.changelog.length === 0) && (
                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                            <HiOutlineClock className="h-5 w-5 mr-2 text-gray-500" />
                            Change History
                        </h4>
                        <p className="text-sm text-gray-500 italic">No changes recorded for this interaction yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InteractionDetailModal;

// Minimalistic scrollbar styling (add to your global CSS if preferred)
const style = document.createElement('style');
style.innerHTML = `
  .simple-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .simple-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1; /* cool-gray-300 */
    border-radius: 10px;
  }
  .simple-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
`;
document.head.appendChild(style); 