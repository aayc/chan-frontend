import React, { useState, useEffect } from 'react';
import { Contact } from '../../types/people';
import { HiOutlineXMark, HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin, HiOutlineCalendarDays, HiOutlineBriefcase, HiOutlineUserCircle, HiOutlineClock, HiOutlineTag } from 'react-icons/hi2';

interface ContactDetailModalProps {
    contact: Contact;
    onClose: () => void;
    onUpdate: (field: keyof Contact, value: any) => void;
}

const ANIMATION_DURATION = 200; // ms, match with Tailwind duration class e.g., duration-200

const EditableDetailItem: React.FC<{
    icon: React.ElementType;
    label: string;
    field: keyof Contact;
    value?: string;
    onUpdate: (field: keyof Contact, value: any) => void;
    inputType?: 'text' | 'date' | 'textarea';
}> = ({ icon: Icon, label, field, value, onUpdate, inputType = 'text' }) => {
    const [currentValue, setCurrentValue] = useState(value || '');

    useEffect(() => {
        setCurrentValue(value || '');
    }, [value]);

    const handleBlur = () => {
        if (field === 'birthday' || field === 'lastContact') {
            onUpdate(field, currentValue ? new Date(currentValue).toISOString() : undefined);
        } else if (field === 'categories') {
            onUpdate(field, currentValue.split(',').map(s => s.trim()).filter(Boolean));
        } else {
            onUpdate(field, currentValue);
        }
    };

    if (inputType === 'textarea') {
        return (
            <div className="py-2">
                <label htmlFor={`${field}-${label}`} className="text-xs text-gray-500 flex items-center mb-0.5">
                    <Icon className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                    {label}
                </label>
                <textarea
                    id={`${field}-${label}`}
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onBlur={handleBlur}
                    className="w-full text-sm text-gray-800 border border-gray-300 rounded-md p-1.5 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                />
            </div>
        );
    }

    const displayValue = (field === 'birthday' || field === 'lastContact') && currentValue
        ? new Date(currentValue).toISOString().split('T')[0]
        : (field === 'categories' && Array.isArray(currentValue))
            ? currentValue.join(', ')
            : currentValue;

    return (
        <div className="flex items-start py-2">
            <Icon className="h-4 w-4 text-gray-500 mr-2 mt-2.5 flex-shrink-0" />
            <div className="w-full">
                <label htmlFor={`${field}-${label}`} className="text-xs text-gray-500">{label}</label>
                <input
                    type={inputType === 'date' ? 'date' : 'text'}
                    id={`${field}-${label}`}
                    value={displayValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onBlur={handleBlur}
                    className="w-full text-sm text-gray-800 border border-gray-300 rounded-md p-1 focus:ring-blue-500 focus:border-blue-500 mt-0.5"
                />
            </div>
        </div>
    );
};

const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ contact, onClose, onUpdate }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        // Trigger mount animation
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 10); // Small delay to allow initial paint

        // Handle Escape key to close modal
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('keydown', handleEsc);
            // Reset mounted state if component unmounts, for next time it's opened
            // This is important if the modal component itself stays in the DOM but is hidden by parent
            // However, in our case People.tsx unmounts it, so this is mostly for robustness.
            setIsMounted(false);
        };
    }, []); // Run once on mount

    const handleClose = () => {
        setIsAnimatingOut(true);
        setIsMounted(false); // Start transition out
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false); // Reset for next open
        }, ANIMATION_DURATION);
    };

    if (!contact) return null;

    // Determine current opacity and scale based on state
    const backdropOpacity = isMounted && !isAnimatingOut ? 'opacity-100' : 'opacity-0';
    const panelOpacity = isMounted && !isAnimatingOut ? 'opacity-100' : 'opacity-0';
    const panelScale = isMounted && !isAnimatingOut ? 'scale-100' : 'scale-95';

    return (
        <div
            className={`fixed inset-0 overflow-y-auto h-full w-full z-40 flex items-center justify-center p-4 transition-opacity duration-${ANIMATION_DURATION} ease-in-out ${backdropOpacity} bg-black/20 backdrop-blur-sm`}
            onClick={handleClose}
        >
            <div
                className={`relative bg-white w-full max-w-lg mx-auto rounded-lg shadow-xl p-6 space-y-3 transition-all duration-${ANIMATION_DURATION} ease-in-out ${panelOpacity} ${panelScale}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                        {contact.avatar ? (
                            <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full mr-3 object-cover" />
                        ) : (
                            <HiOutlineUserCircle className="w-12 h-12 rounded-full mr-3 text-gray-400" />
                        )}
                        <div className="w-full">
                            <input
                                type="text"
                                value={contact.name}
                                onChange={(e) => onUpdate('name', e.target.value)}
                                className="text-xl font-semibold text-gray-900 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded p-0.5 -ml-0.5 w-full"
                                placeholder="Name"
                            />
                            <input
                                type="text"
                                value={contact.company || ''}
                                placeholder="Company"
                                onChange={(e) => onUpdate('company', e.target.value)}
                                className="text-sm text-gray-500 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded p-0.5 -ml-0.5 w-full mt-0.5"
                            />
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 absolute top-3 right-3">
                        <HiOutlineXMark className="h-6 w-6" />
                    </button>
                </div>

                <EditableDetailItem icon={HiOutlineEnvelope} label="Email" field="email" value={contact.email} onUpdate={onUpdate} />
                <EditableDetailItem icon={HiOutlinePhone} label="Phone" field="phone" value={contact.phone} onUpdate={onUpdate} />
                <EditableDetailItem icon={HiOutlineMapPin} label="Location" field="location" value={contact.location} onUpdate={onUpdate} />
                <EditableDetailItem icon={HiOutlineCalendarDays} label="Birthday" field="birthday" value={contact.birthday} onUpdate={onUpdate} inputType="date" />
                <EditableDetailItem icon={HiOutlineClock} label="Last Contact" field="lastContact" value={contact.lastContact} onUpdate={onUpdate} inputType="date" />
                <EditableDetailItem icon={HiOutlineTag} label="Categories (comma-separated)" field="categories" value={Array.isArray(contact.categories) ? contact.categories.join(', ') : ''} onUpdate={onUpdate} />
                <EditableDetailItem icon={HiOutlineBriefcase} label="Notes" field="notes" value={contact.notes} onUpdate={onUpdate} inputType="textarea" />
            </div>
        </div>
    );
};

export default ContactDetailModal; 