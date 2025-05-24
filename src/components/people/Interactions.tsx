import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineBellAlert, HiCheckCircle, HiPencil, HiTrash, HiXCircle } from 'react-icons/hi2';
import { Interaction, ChangelogEntry } from '../../types/people';
import InteractionDetailModal from './InteractionDetailModal';

type FilterOption = 'Actionable' | 'Upcoming' | 'Historical';

interface InteractionsProps {
    interactions: Interaction[];
    onUpdateInteraction: (interactionId: string, updates: Partial<Pick<Interaction, 'status' | 'details' | 'changelog'>>) => Promise<void>;
    onDeleteInteraction: (interactionId: string) => Promise<void>;
}

const Interactions: React.FC<InteractionsProps> = ({ interactions, onUpdateInteraction, onDeleteInteraction }) => {
    const [editingInteractionId, setEditingInteractionId] = useState<string | null>(null);
    const [editText, setEditText] = useState<string>('');
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<FilterOption>('Actionable');
    const [selectedInteractionForModal, setSelectedInteractionForModal] = useState<Interaction | null>(null);
    const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Clear timeout on component unmount to prevent memory leaks
        return () => {
            if (undoTimeoutRef.current) {
                clearTimeout(undoTimeoutRef.current);
            }
        };
    }, []);

    const handleToggleEdit = (interaction: Interaction) => {
        if (editingInteractionId === interaction.id) {
            setEditingInteractionId(null);
            setEditText('');
        } else {
            setEditingInteractionId(interaction.id);
            setEditText(interaction.details || '');
        }
    };

    const handleSaveDetails = async (interactionId: string) => {
        const interaction = interactions.find(i => i.id === interactionId);
        if (!interaction) return;

        const oldDetails = interaction.details || '';
        const newChangelogEntry: ChangelogEntry = {
            timestamp: new Date().toISOString(),
            updateDetails: { details: [oldDetails, editText] }
        };
        const updatedChangelog = [...(interaction.changelog || []), newChangelogEntry];

        await onUpdateInteraction(interactionId, { details: editText, changelog: updatedChangelog });
        setEditingInteractionId(null);
        setEditText('');
    };

    const handleToggleStatus = async (interaction: Interaction) => {
        const oldStatus = interaction.status;
        const newStatus = interaction.status === 'Completed' ? 'Pending' : 'Completed';

        const newChangelogEntry: ChangelogEntry = {
            timestamp: new Date().toISOString(),
            updateDetails: { status: [oldStatus, newStatus] }
        };
        const updatedChangelog = [...(interaction.changelog || []), newChangelogEntry];

        await onUpdateInteraction(interaction.id, { status: newStatus, changelog: updatedChangelog });
    };

    const startPendingDelete = (interactionId: string) => {
        // If another interaction delete is already pending, execute it immediately.
        if (pendingDeleteId && pendingDeleteId !== interactionId && undoTimeoutRef.current) {
            clearTimeout(undoTimeoutRef.current);
            onDeleteInteraction(pendingDeleteId); // This calls the original prop
        }

        setPendingDeleteId(interactionId);

        // Clear any existing timer for this specific item if its delete icon is clicked again
        if (undoTimeoutRef.current && pendingDeleteId === interactionId) {
            clearTimeout(undoTimeoutRef.current);
        }

        undoTimeoutRef.current = setTimeout(() => {
            onDeleteInteraction(interactionId); // Call the original prop
            setPendingDeleteId(null);
            undoTimeoutRef.current = null;
        }, 5000); // 5 seconds to undo
    };

    const cancelPendingDelete = () => {
        if (undoTimeoutRef.current) {
            clearTimeout(undoTimeoutRef.current);
            undoTimeoutRef.current = null;
        }
        setPendingDeleteId(null);
    };

    const handleOpenInteractionModal = (interaction: Interaction) => {
        setSelectedInteractionForModal(interaction);
    };

    const handleCloseInteractionModal = () => {
        setSelectedInteractionForModal(null);
    };

    const now = new Date().getTime();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
    const seventyTwoHoursInMs = 72 * 60 * 60 * 1000;
    const twentyFourHoursFromNow = now + twentyFourHoursInMs;
    const seventyTwoHoursFromNow = now + seventyTwoHoursInMs;

    const displayedInteractions = interactions.filter(interaction => {
        const dueDateMs = new Date(interaction.dueDate).getTime();
        switch (selectedFilter) {
            case 'Actionable':
                // Overdue items OR Pending items due within the next 24 hours (including past pending).
                return interaction.status === 'Overdue' ||
                    (interaction.status === 'Pending' && dueDateMs <= twentyFourHoursFromNow);
            case 'Upcoming':
                // Pending items due after 24 hours from now but within 72 hours from now.
                return interaction.status === 'Pending' &&
                    dueDateMs > twentyFourHoursFromNow &&
                    dueDateMs <= seventyTwoHoursFromNow;
            case 'Historical':
                // Interactions whose due date has passed OR are completed.
                return interaction.status === 'Completed' || dueDateMs < now;
            default:
                return true;
        }
    });

    if (!displayedInteractions.length) {
        return (
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                        <HiOutlineBellAlert className="mr-2 h-6 w-6 text-yellow-500" />
                        {selectedFilter} Interactions
                    </h2>
                    <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value as FilterOption)}
                        className="p-2 border rounded-md text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="Actionable">Actionable</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Historical">Historical</option>
                    </select>
                </div>
                <p className="text-gray-500">No {selectedFilter.toLowerCase()} interactions to display.</p>
            </div>
        );
    }

    // Helper function for dynamic class names
    const getLiClassName = (status: Interaction['status']) => {
        let baseClass = "p-3 rounded-md border hover:shadow-md transition-shadow duration-150 ease-in-out";
        if (status === 'Completed') return `${baseClass} bg-green-50 border-green-200`;
        if (status === 'Overdue') return `${baseClass} bg-red-50 border-red-200`;
        return `${baseClass} bg-yellow-50 border-yellow-200`;
    };

    const getSpanClassName = (status: Interaction['status']) => {
        let baseClass = "font-medium";
        if (status === 'Completed') return `${baseClass} text-green-700`;
        if (status === 'Overdue') return `${baseClass} text-red-700`;
        return `${baseClass} text-yellow-700`;
    };

    const getPClassName = (status: Interaction['status']) => {
        let baseClass = "text-sm";
        if (status === 'Completed') return `${baseClass} text-green-600 italic line-through`;
        if (status === 'Overdue') return `${baseClass} text-red-600`;
        return `${baseClass} text-yellow-600`;
    };

    const getDivClassName = (status: Interaction['status']) => {
        let baseClass = "text-xs mt-1";
        if (status === 'Completed') return `${baseClass} text-green-500`;
        if (status === 'Overdue') return `${baseClass} text-red-500`;
        return `${baseClass} text-gray-500`;
    };

    const getButtonHoverBgClass = (status: Interaction['status']) => {
        if (status === 'Completed') return 'hover:bg-green-200';
        if (status === 'Overdue') return 'hover:bg-red-200';
        return 'hover:bg-yellow-200'; // For Pending status
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                    <HiOutlineBellAlert className="mr-2 h-6 w-6 text-yellow-500" />
                    Interactions
                </h2>
                <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value as FilterOption)}
                    className="p-2 border rounded-md text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                    <option value="Actionable">Actionable</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Historical">Historical</option>
                </select>
            </div>
            <ul className="space-y-3">
                {displayedInteractions.map(interaction => (
                    <li
                        key={interaction.id}
                        className={`${getLiClassName(interaction.status)} ${pendingDeleteId === interaction.id ? 'opacity-60' : ''} cursor-pointer`}
                        onClick={() => handleOpenInteractionModal(interaction)}
                    >
                        {pendingDeleteId === interaction.id ? (
                            <div className="flex justify-between items-center p-3" onClick={(e) => e.stopPropagation()}>
                                <span className="text-gray-600 italic">
                                    Deleting {interaction.type} with {interaction.contactName}...
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); cancelPendingDelete(); }}
                                    className="px-3 py-1 !bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
                                >
                                    Undo
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        <span className={getSpanClassName(interaction.status)}>
                                            {interaction.type} with {interaction.contactName}
                                        </span>
                                        {editingInteractionId === interaction.id ? (
                                            <div className="mt-2">
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="w-full p-2 border rounded-md text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                                                    rows={3}
                                                />
                                                <div className="mt-2 space-x-2">
                                                    <div className="flex justify-end">
                                                        <span
                                                            onClick={(e) => { e.stopPropagation(); handleSaveDetails(interaction.id); }}
                                                            className="text-blue-500 hover:text-blue-700 text-xs cursor-pointer mr-3"
                                                        >
                                                            Save
                                                        </span>
                                                        <span
                                                            onClick={(e) => { e.stopPropagation(); handleToggleEdit(interaction); }}
                                                            className="text-gray-500 hover:text-gray-700 text-xs cursor-pointer"
                                                        >
                                                            Cancel
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className={getPClassName(interaction.status)}>
                                                {interaction.details || `Scheduled for ${new Date(interaction.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${new Date(interaction.dueDate).toLocaleDateString()}`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                                        {interaction.status === 'Completed' ? (
                                            <HiXCircle
                                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(interaction); }}
                                                title="Mark Pending"
                                                className={`h-10 w-10 p-2 rounded cursor-pointer ${getButtonHoverBgClass(interaction.status)} text-yellow-500`}
                                            />
                                        ) : (
                                            <HiCheckCircle
                                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(interaction); }}
                                                title="Mark Completed"
                                                className={`h-10 w-10 p-2 rounded cursor-pointer ${getButtonHoverBgClass(interaction.status)} text-green-500`}
                                            />
                                        )}
                                        <HiPencil
                                            onClick={(e) => { e.stopPropagation(); handleToggleEdit(interaction); }}
                                            title="Edit Details"
                                            className={`h-10 w-10 p-2 rounded cursor-pointer text-blue-500 ${getButtonHoverBgClass(interaction.status)}`}
                                        />
                                        <HiTrash
                                            onClick={(e) => { e.stopPropagation(); startPendingDelete(interaction.id); }}
                                            title="Delete Interaction"
                                            className={`h-10 w-10 p-2 rounded cursor-pointer text-red-500 ${getButtonHoverBgClass(interaction.status)}`}
                                        />
                                    </div>
                                </div>
                                <div className={getDivClassName(interaction.status)}>
                                    Due: {new Date(interaction.dueDate).toLocaleDateString()} - Status: {interaction.status}
                                    {selectedFilter === 'Historical' && interaction.changelog && interaction.changelog.length > 0 && (
                                        <div className="mt-1 text-xs text-gray-400">
                                            Last updated: {new Date(interaction.changelog[interaction.changelog.length - 1].timestamp).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
            {selectedInteractionForModal && (
                <InteractionDetailModal
                    interaction={selectedInteractionForModal}
                    onClose={handleCloseInteractionModal}
                />
            )}
        </div>
    );
};

export default Interactions; 