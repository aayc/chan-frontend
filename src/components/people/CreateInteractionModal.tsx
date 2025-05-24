import React, { useState, useEffect } from 'react';
import { Interaction } from '../../types/people';
import { HiOutlineXMark, HiOutlineCalendarDays, HiOutlineChatBubbleLeftRight, HiOutlinePencil, HiOutlinePaperAirplane } from 'react-icons/hi2';

interface CreateInteractionModalProps {
    contactId: string;
    contactName: string;
    onClose: () => void;
    onCreate: (interactionData: Pick<Interaction, 'contactId' | 'contactName' | 'type' | 'dueDate' | 'details'>) => Promise<void>;
}

const ANIMATION_DURATION = 200; // ms

const CreateInteractionModal: React.FC<CreateInteractionModalProps> = ({ contactId, contactName, onClose, onCreate }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    const [type, setType] = useState<Interaction['type']>('Call');
    const [dueDate, setDueDate] = useState(new Date().toISOString().substring(0, 16)); // For datetime-local format YYYY-MM-DDTHH:mm
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 10);
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleAnimatedClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('keydown', handleEsc);
            setIsMounted(false);
        };
    }, []);

    const handleAnimatedClose = () => {
        if (isSubmitting) return;
        setIsAnimatingOut(true);
        setIsMounted(false);
        setTimeout(() => {
            onClose();
        }, ANIMATION_DURATION);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!type || !dueDate) {
            alert('Please select a type and due date.'); // Simple validation
            return;
        }
        setIsSubmitting(true);
        try {
            await onCreate({
                contactId,
                contactName,
                type,
                dueDate: new Date(dueDate).toISOString(), // Convert to full ISO string
                details,
            });
            handleAnimatedClose();
        } catch (error) {
            console.error("Failed to create interaction:", error);
            alert("Failed to create interaction. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const backdropOpacity = isMounted && !isAnimatingOut ? 'opacity-100' : 'opacity-0';
    const panelOpacity = isMounted && !isAnimatingOut ? 'opacity-100' : 'opacity-0';
    const panelScale = isMounted && !isAnimatingOut ? 'scale-100' : 'scale-95';

    return (
        <div
            className={`fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 transition-opacity duration-${ANIMATION_DURATION} ease-in-out ${backdropOpacity} bg-black/30 backdrop-blur-sm`}
            onClick={handleAnimatedClose}
        >
            <div
                className={`relative bg-white w-full max-w-md mx-auto rounded-lg shadow-xl p-6 transition-all duration-${ANIMATION_DURATION} ease-in-out ${panelOpacity} ${panelScale}`}
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                            <HiOutlineChatBubbleLeftRight className="h-6 w-6 mr-2 text-blue-500" />
                            New Interaction with {contactName}
                        </h3>
                        <button type="button" onClick={handleAnimatedClose} disabled={isSubmitting} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 disabled:opacity-50">
                            <HiOutlineXMark className="h-6 w-6" />
                        </button>
                    </div>

                    <div>
                        <label htmlFor="interaction-type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            id="interaction-type"
                            value={type}
                            onChange={(e) => setType(e.target.value as Interaction['type'])}
                            disabled={isSubmitting}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="Call">Call</option>
                            <option value="Email">Email</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Follow-up">Follow-up</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="interaction-duedate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <HiOutlineCalendarDays className="h-4 w-4 mr-1.5 text-gray-500" />Due Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            id="interaction-duedate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            disabled={isSubmitting}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="interaction-details" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <HiOutlinePencil className="h-4 w-4 mr-1.5 text-gray-500" /> Details (Optional)
                        </label>
                        <textarea
                            id="interaction-details"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            rows={4}
                            disabled={isSubmitting}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
                            placeholder="Add notes or agenda..."
                        />
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white !bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <HiOutlinePaperAirplane className={`h-5 w-5 mr-2 ${isSubmitting ? 'animate-spin' : ''}`} />
                            {isSubmitting ? 'Creating...' : 'Create Interaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInteractionModal; 