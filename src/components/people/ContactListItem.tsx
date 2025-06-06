import React, { useState } from 'react';
import { HiOutlineUserCircle, HiOutlinePhone, HiOutlineEnvelope, HiOutlineMapPin, HiOutlineChevronDown, HiOutlineClipboardDocument, HiOutlineBriefcase, HiOutlineTag, HiOutlineChatBubbleLeftRight, HiOutlineClipboard } from 'react-icons/hi2';
import { Contact, Interaction } from '../../types/people';
import CreateInteractionModal from './CreateInteractionModal';

interface ContactListItemProps {
    contact: Contact;
    onShowToast: (message: string, type: 'success' | 'error') => void;
    onToggleDetails: (contactId: string) => void;
    onCreateInteraction: (interactionData: Pick<Interaction, 'contactId' | 'contactName' | 'type' | 'dueDate' | 'details'>) => Promise<void>;
}

const ContactListItem: React.FC<ContactListItemProps> = ({ contact, onShowToast, onToggleDetails, onCreateInteraction }) => {
    const [showCopyDropdown, setShowCopyDropdown] = useState(false);
    const [isCreateInteractionModalOpen, setIsCreateInteractionModalOpen] = useState(false);

    const handleCopyToClipboard = (text: string, copyType: string) => {
        navigator.clipboard.writeText(text).then(() => {
            onShowToast(`${copyType} copied to clipboard!`, 'success');
            setShowCopyDropdown(false);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            onShowToast(`Failed to copy ${copyType}`, 'error');
        });
    };

    return (
        <div
            className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 ease-in-out mb-3 cursor-pointer hover:bg-gray-50"
            onClick={() => onToggleDetails(contact.id)}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center flex-grow min-w-0 mb-3 sm:mb-0">
                    {contact.avatar ? (
                        <img src={contact.avatar} alt={contact.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4 object-cover flex-shrink-0" />
                    ) : (
                        <HiOutlineUserCircle className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-grow min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{contact.name}</h3>
                        {contact.categories && contact.categories.length > 0 && (
                            <div className="mt-1 flex items-center flex-wrap text-xs text-gray-500">
                                <HiOutlineTag className="h-3 w-3 mr-1.5 text-gray-400 flex-shrink-0" />
                                {contact.categories.map((category, index) => (
                                    <span key={index} className="mr-1.5 mb-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                        {category}
                                    </span>
                                ))}
                            </div>
                        )}
                        <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                            {contact.company || contact.email || contact.phone || 'No additional info'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setIsCreateInteractionModalOpen(true)}
                        title="Log Interaction"
                        className="p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors duration-150"
                    >
                        <HiOutlineChatBubbleLeftRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowCopyDropdown(!showCopyDropdown)}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors duration-150 flex items-center"
                        >
                            <HiOutlineClipboard className="h-4 w-4 sm:h-5 sm:w-5" />
                            <HiOutlineChevronDown className={`ml-1 h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 ${showCopyDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showCopyDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                                <ul>
                                    <li
                                        onClick={() => handleCopyToClipboard(contact.name, 'Name')}
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                                    >
                                        <HiOutlineUserCircle className="mr-2 h-4 w-4 text-gray-400" /> Copy Name
                                    </li>
                                    {contact.email && (
                                        <li
                                            onClick={() => handleCopyToClipboard(contact.email, 'Email')}
                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                                        >
                                            <HiOutlineEnvelope className="mr-2 h-4 w-4 text-gray-400" /> Copy Email
                                        </li>
                                    )}
                                    {contact.phone && (
                                        <li
                                            onClick={() => handleCopyToClipboard(contact.phone, 'Phone')}
                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                                        >
                                            <HiOutlinePhone className="mr-2 h-4 w-4 text-gray-400" /> Copy Phone
                                        </li>
                                    )}
                                    <li
                                        onClick={() => handleCopyToClipboard(`${contact.name}\n${contact.email || ''}\n${contact.phone || ''}`, 'All Info')}
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center border-t border-gray-100"
                                    >
                                        <HiOutlineClipboardDocument className="mr-2 h-4 w-4 text-gray-400" /> Copy All
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isCreateInteractionModalOpen && (
                <CreateInteractionModal
                    contactId={contact.id}
                    contactName={contact.name}
                    onClose={() => setIsCreateInteractionModalOpen(false)}
                    onCreate={async (interactionData) => {
                        await onCreateInteraction(interactionData);
                        setIsCreateInteractionModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default ContactListItem; 