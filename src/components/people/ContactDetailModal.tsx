import React, { useState, useEffect } from 'react';
import { Contact } from '../../types/people';
import { HiOutlineXMark, HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin, HiOutlineCalendarDays, HiOutlineBriefcase, HiOutlineUserCircle, HiOutlineClock, HiOutlineTag, HiOutlineCheckCircle } from 'react-icons/hi2';

interface ContactDetailModalProps {
    contact: Contact;
    onClose: () => void;
    onUpdate: (contactId: string, updates: Partial<Contact>) => void;
}

const ANIMATION_DURATION = 200; // ms, match with Tailwind duration class e.g., duration-200

const EditableDetailItem: React.FC<{
    icon: React.ElementType;
    label: string;
    field: keyof Contact;
    value?: string | string[];
    onLocalChange: (field: keyof Contact, value: any) => void;
    inputType?: 'text' | 'date' | 'textarea';
}> = ({ icon: Icon, label, field, value, onLocalChange, inputType = 'text' }) => {
    const [currentValue, setCurrentValue] = useState(value || (inputType === 'textarea' || inputType === 'text' ? '' : []));

    useEffect(() => {
        if (field === 'categories' && Array.isArray(value)) {
            setCurrentValue(value.join(', '));
        } else {
            setCurrentValue(value || '');
        }
    }, [value, field]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCurrentValue(e.target.value);
    };

    const triggerLocalChange = () => {
        if (field === 'birthday' || field === 'lastContact') {
            const dateString = currentValue as string;
            if (!dateString) { // Handles empty string
                onLocalChange(field, undefined);
            } else {
                const dateObj = new Date(dateString);
                // Check if the date object is valid
                if (!isNaN(dateObj.getTime())) {
                    onLocalChange(field, dateObj.toISOString());
                } else {
                    // If date string is invalid (e.g., partially typed or incorrect format)
                    // We might choose to pass undefined or the original invalid string depending on desired UX
                    // For now, let's pass undefined to clear it or prevent update with invalid data
                    onLocalChange(field, undefined);
                }
            }
        } else if (field === 'categories') {
            onLocalChange(field, (currentValue as string).split(',').map(s => s.trim()).filter(Boolean));
        } else {
            onLocalChange(field, currentValue);
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
                    value={currentValue as string}
                    onChange={handleInputChange}
                    onBlur={triggerLocalChange}
                    className="w-full text-sm text-gray-800 border border-gray-300 rounded-md p-1.5 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                />
            </div>
        );
    }

    const displayVal = (field === 'birthday' || field === 'lastContact')
        ? (currentValue && !isNaN(new Date(currentValue as string).getTime())
            ? new Date(currentValue as string).toISOString().split('T')[0]
            : '')
        : currentValue;

    return (
        <div className="flex items-start py-2">
            <Icon className="h-4 w-4 text-gray-500 mr-2 mt-2.5 flex-shrink-0" />
            <div className="w-full">
                <label htmlFor={`${field}-${label}`} className="text-xs text-gray-500">{label}</label>
                <input
                    type={inputType === 'date' ? 'date' : 'text'}
                    id={`${field}-${label}`}
                    value={displayVal as string}
                    onChange={handleInputChange}
                    onBlur={triggerLocalChange}
                    className="w-full text-sm text-gray-800 border border-gray-300 rounded-md p-1 focus:ring-blue-500 focus:border-blue-500 mt-0.5"
                />
            </div>
        </div>
    );
};

const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ contact, onClose, onUpdate }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [editableContact, setEditableContact] = useState<Contact>(JSON.parse(JSON.stringify(contact)));

    useEffect(() => {
        setEditableContact(JSON.parse(JSON.stringify(contact)));
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
    }, [contact]);

    const handleLocalUpdate = (field: keyof Contact, value: any) => {
        setEditableContact(prev => ({ ...prev, [field]: value }));
    };

    const handleAnimatedClose = () => {
        setIsAnimatingOut(true);
        setIsMounted(false);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, ANIMATION_DURATION);
    };

    const handleSaveChanges = () => {
        const updates: Partial<Contact> = {};
        (Object.keys(editableContact) as Array<keyof Contact>).forEach(key => {
            if (editableContact[key] !== contact[key]) {
                if (key === 'categories') {
                    if (JSON.stringify(editableContact[key]) !== JSON.stringify(contact[key])) {
                        updates[key] = editableContact[key];
                    }
                } else {
                    updates[key] = editableContact[key];
                }
            }
        });

        if (Object.keys(updates).length > 0) {
            onUpdate(contact.id, updates);
        }
        handleAnimatedClose();
    };

    if (!contact) return null;

    const backdropOpacity = isMounted && !isAnimatingOut ? 'opacity-100' : 'opacity-0';
    const panelOpacity = isMounted && !isAnimatingOut ? 'opacity-100' : 'opacity-0';
    const panelScale = isMounted && !isAnimatingOut ? 'scale-100' : 'scale-95';

    return (
        <div
            className={`fixed inset-0 overflow-y-auto h-full w-full z-40 flex items-center justify-center p-4 transition-opacity duration-${ANIMATION_DURATION} ease-in-out ${backdropOpacity} bg-black/20 backdrop-blur-sm`}
            onClick={handleAnimatedClose}
        >
            <div
                className={`relative bg-white w-full max-w-lg mx-auto rounded-lg shadow-xl p-6 space-y-3 transition-all duration-${ANIMATION_DURATION} ease-in-out ${panelOpacity} ${panelScale}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                        {editableContact.avatar ? (
                            <img src={editableContact.avatar} alt={editableContact.name} className="w-12 h-12 rounded-full mr-3 object-cover" />
                        ) : (
                            <HiOutlineUserCircle className="w-12 h-12 rounded-full mr-3 text-gray-400" />
                        )}
                        <div className="w-full">
                            <input
                                type="text"
                                value={editableContact.name}
                                onChange={(e) => handleLocalUpdate('name', e.target.value)}
                                className="text-xl font-semibold text-gray-900 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded p-0.5 -ml-0.5 w-full"
                                placeholder="Name"
                            />
                            <input
                                type="text"
                                value={editableContact.company || ''}
                                placeholder="Company"
                                onChange={(e) => handleLocalUpdate('company', e.target.value)}
                                className="text-sm text-gray-500 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded p-0.5 -ml-0.5 w-full mt-0.5"
                            />
                        </div>
                    </div>
                    <button onClick={handleAnimatedClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 absolute top-3 right-3">
                        <HiOutlineXMark className="h-6 w-6" />
                    </button>
                </div>

                <EditableDetailItem icon={HiOutlineEnvelope} label="Email" field="email" value={editableContact.email} onLocalChange={handleLocalUpdate} />
                <EditableDetailItem icon={HiOutlinePhone} label="Phone" field="phone" value={editableContact.phone} onLocalChange={handleLocalUpdate} />
                <EditableDetailItem icon={HiOutlineMapPin} label="Location" field="location" value={editableContact.location} onLocalChange={handleLocalUpdate} />
                <EditableDetailItem icon={HiOutlineCalendarDays} label="Birthday" field="birthday" value={editableContact.birthday} onLocalChange={handleLocalUpdate} inputType="date" />
                <EditableDetailItem icon={HiOutlineClock} label="Last Contact" field="lastContact" value={editableContact.lastContact} onLocalChange={handleLocalUpdate} inputType="date" />
                <EditableDetailItem icon={HiOutlineTag} label="Categories (comma-separated)" field="categories" value={editableContact.categories} onLocalChange={handleLocalUpdate} />
                <EditableDetailItem icon={HiOutlineBriefcase} label="Notes" field="notes" value={editableContact.notes} onLocalChange={handleLocalUpdate} inputType="textarea" />

                <div className="pt-4">
                    <button
                        onClick={handleSaveChanges}
                        className="w-full !bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <HiOutlineCheckCircle className="h-5 w-5 mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactDetailModal; 