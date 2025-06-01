import React, { useState, useEffect } from 'react';
import { Contact, ChangelogEntry } from '../../types/people'; // Ensure ChangelogEntry is imported if needed, or rely on Contact type
import { HiOutlineXMark, HiOutlineUserPlus, HiOutlineCheckCircle } from 'react-icons/hi2';

interface CreateContactModalProps {
    onClose: () => void;
    onCreate: (contactData: Omit<Contact, 'id'>) => Promise<void>;
}

const ANIMATION_DURATION = 200;

// Helper to parse date input string and provide feedback
const parseDateInput = (dateString: string): { isValid: boolean; isoString?: string; displayDate?: string; error?: string; isEmpty: boolean } => {
    if (!dateString) {
        return { isValid: true, isEmpty: true }; // Empty is valid and optional
    }
    // The HTML input type="date" provides value in "YYYY-MM-DD" format.
    // Safari might be tricky with new Date() for "YYYY-MM-DD", so a more robust parse:
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(Date.UTC(year, month, day)); // Use UTC to avoid timezone issues with "YYYY-MM-DD"

        // Check if the constructed date matches the input parts, as Date constructor can be lenient
        if (dateObj.getUTCFullYear() === year && dateObj.getUTCMonth() === month && dateObj.getUTCDate() === day) {
            return {
                isValid: true,
                isoString: dateObj.toISOString(),
                displayDate: dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
                isEmpty: false,
            };
        }
    }
    return { isValid: false, error: "Invalid date. Use YYYY-MM-DD.", isEmpty: false };
};

// Initial empty contact state, matching Omit<Contact, 'id'> and including required changelog
const getInitialContactData = (): Omit<Contact, 'id'> => ({
    name: '',
    email: '',
    phone: '',
    location: '',
    avatar: '',
    categories: [],
    notes: '',
    company: '',
    birthday: '', // Store as string
    lastContact: '', // Store as string
    linkedin: '', // Changed to linkedin
    changelog: [], // Initialize with an empty changelog as it's required
});

interface DateValidationFeedback {
    message: string | null;
    color: 'text-green-600' | 'text-red-600' | 'text-gray-500';
}

const initialValidationFeedback: DateValidationFeedback = { message: null, color: 'text-gray-500' };

const CreateContactModal: React.FC<CreateContactModalProps> = ({ onClose, onCreate }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [newContact, setNewContact] = useState<Omit<Contact, 'id'>>(getInitialContactData());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [birthdayValidation, setBirthdayValidation] = useState<DateValidationFeedback>(initialValidationFeedback);
    const [lastContactValidation, setLastContactValidation] = useState<DateValidationFeedback>(initialValidationFeedback);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

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

    const handleLocalUpdate = (field: keyof Omit<Contact, 'id'>, value: any) => {
        setNewContact(prev => ({ ...prev, [field]: value }));
        setSubmissionError(null); // Clear submission error on new input

        if (field === 'birthday' || field === 'lastContact') {
            const validationResult = parseDateInput(value as string);
            const setValidation = field === 'birthday' ? setBirthdayValidation : setLastContactValidation;

            if (validationResult.isEmpty) {
                setValidation({ message: "Optional", color: 'text-gray-500' });
            } else if (validationResult.isValid && validationResult.displayDate) {
                setValidation({ message: validationResult.displayDate, color: 'text-green-600' });
            } else if (!validationResult.isValid && validationResult.error) {
                setValidation({ message: validationResult.error, color: 'text-red-600' });
            } else {
                setValidation(initialValidationFeedback); // Should not happen with current logic
            }
        } else if (field === 'categories') {
            // Categories handled differently if it's not a simple string field
            setNewContact(prev => ({ ...prev, categories: (value as string).split(',').map(s => s.trim()).filter(Boolean) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError(null); // Clear previous submission errors

        if (!newContact.name) {
            alert('Contact name is required.');
            return;
        }

        const birthdayParsed = parseDateInput(newContact.birthday as string);
        const lastContactParsed = parseDateInput(newContact.lastContact as string);

        if ((!birthdayParsed.isValid && !birthdayParsed.isEmpty)) {
            alert(`Invalid birthday: ${birthdayParsed.error || 'Please correct the date.'}`);
            setBirthdayValidation({ message: birthdayParsed.error || "Invalid date.", color: 'text-red-600' });
            return;
        }
        if ((!lastContactParsed.isValid && !lastContactParsed.isEmpty)) {
            alert(`Invalid last contact date: ${lastContactParsed.error || 'Please correct the date.'}`);
            setLastContactValidation({ message: lastContactParsed.error || "Invalid date.", color: 'text-red-600' });
            return;
        }

        setIsSubmitting(true);
        try {
            const contactToCreate: Omit<Contact, 'id'> = {
                ...newContact,
                birthday: birthdayParsed.isoString, // Will be undefined if empty or invalid (but we check invalid above)
                lastContact: lastContactParsed.isoString, // Will be undefined if empty or invalid
                changelog: [],
                // Ensure categories are in the correct format if they were string-handled in form
                categories: Array.isArray(newContact.categories) ? newContact.categories : (newContact.categories as unknown as string).split(',').map(s => s.trim()).filter(Boolean),
            };
            await onCreate(contactToCreate);
            handleAnimatedClose();
        } catch (error) {
            console.error("Failed to create contact:", error);
            // Instead of alert, set submission error state
            setSubmissionError("Failed to create contact. Please check your details and try again.");
            // Do not close the modal, allow user to correct
        } finally {
            setIsSubmitting(false);
        }
    };

    const backdropOpacity = isMounted && !isAnimatingOut ? 'opacity-100' : 'opacity-0';
    const panelOpacity = isMounted && !isAnimatingOut ? 'opacity-100' : 'opacity-0';
    const panelScale = isMounted && !isAnimatingOut ? 'scale-100' : 'scale-95';

    // Simplified input fields for creation. Reusing EditableDetailItem might be too complex for a blank form.
    const renderInputField = (label: string, field: keyof Omit<Contact, 'id'>, type: string = 'text', placeholder?: string) => {
        const isDateField = type === 'date';
        const validationState = field === 'birthday' ? birthdayValidation : (field === 'lastContact' ? lastContactValidation : null);

        return (
            <div>
                <label htmlFor={`create-${field}`} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                    type={type}
                    id={`create-${field}`}
                    value={(newContact[field] as string | undefined) || ''}
                    onChange={(e) => handleLocalUpdate(field, e.target.value)}
                    disabled={isSubmitting}
                    placeholder={placeholder || label}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {isDateField && validationState && validationState.message && (
                    <p className={`text-xs mt-1 ${validationState.color}`}>{validationState.message}</p>
                )}
            </div>
        );
    };

    const renderTextareaField = (label: string, field: keyof Omit<Contact, 'id'>, placeholder?: string) => (
        <div>
            <label htmlFor={`create-${field}`} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
                id={`create-${field}`}
                value={(newContact[field] as string | undefined) || ''}
                onChange={(e) => handleLocalUpdate(field, e.target.value)}
                rows={3}
                disabled={isSubmitting}
                placeholder={placeholder || label}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
            />
        </div>
    );

    return (
        <div
            className={`fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 transition-opacity duration-${ANIMATION_DURATION} ease-in-out ${backdropOpacity} bg-black/30 backdrop-blur-sm`}
            onClick={handleAnimatedClose}
        >
            <div
                className={`relative bg-white w-full max-w-lg mx-auto rounded-lg shadow-xl p-6 transition-all duration-${ANIMATION_DURATION} ease-in-out ${panelOpacity} ${panelScale} overflow-y-auto max-h-[90vh]`}
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                            <HiOutlineUserPlus className="h-6 w-6 mr-2 text-blue-500" />
                            Create New Contact
                        </h3>
                        <button type="button" onClick={handleAnimatedClose} disabled={isSubmitting} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 disabled:opacity-50">
                            <HiOutlineXMark className="h-6 w-6" />
                        </button>
                    </div>

                    {submissionError && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                            <p>{submissionError}</p>
                        </div>
                    )}

                    {renderInputField('Name*', 'name', 'text', 'Full Name')}
                    {renderInputField('Email', 'email', 'email', 'example@domain.com')}
                    {renderInputField('Phone', 'phone', 'tel', '(555) 123-4567')}
                    {renderInputField('Company', 'company', 'text', 'Company Name')}
                    {renderInputField('Location', 'location', 'text', 'City, State')}
                    {renderInputField('Avatar URL', 'avatar', 'url', 'https://example.com/avatar.jpg')}
                    {renderInputField('LinkedIn Profile URL', 'linkedin', 'url', 'https://linkedin.com/in/username')}
                    {renderInputField('Categories (comma-separated)', 'categories', 'text', 'Friend, Work')}
                    {renderInputField('Birthday', 'birthday', 'date')}
                    {renderInputField('Last Contacted', 'lastContact', 'date')}
                    {renderTextareaField('Notes', 'notes', 'Additional information...')}

                    <div className="pt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={handleAnimatedClose}
                            disabled={isSubmitting}
                            className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !newContact.name} // Disable if submitting or name is empty
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white !bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <HiOutlineCheckCircle className={`h-5 w-5 mr-2 ${isSubmitting ? 'animate-spin' : ''}`} />
                            {isSubmitting ? 'Creating...' : 'Create Contact'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateContactModal; 