import React, { useState } from 'react';
import { HiOutlineUserCircle, HiOutlinePhone, HiOutlineEnvelope, HiOutlineMapPin, HiOutlineChevronDown, HiOutlineClipboardDocument, HiOutlineBriefcase, HiOutlineTag } from 'react-icons/hi2';
import { Contact } from '../../types/people';

interface ContactListItemProps {
    contact: Contact;
    onShowToast: (message: string, type: 'success' | 'error') => void;
    onToggleDetails: (contactId: string) => void;
}

const ContactListItem: React.FC<ContactListItemProps> = ({ contact, onShowToast, onToggleDetails }) => {
    const [showCopyDropdown, setShowCopyDropdown] = useState(false);

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
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between hover:shadow-md transition-shadow duration-200 ease-in-out mb-3 cursor-pointer hover:bg-gray-50"
            onClick={() => onToggleDetails(contact.id)}
        >
            <div className="flex items-center">
                {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                ) : (
                    <HiOutlineUserCircle className="w-12 h-12 rounded-full mr-4 text-gray-400" />
                )}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{contact.name}</h3>
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
                    {contact.notes && <p className="text-sm text-gray-500 italic mt-1">{contact.notes}</p>}
                    <div className="mt-1 flex items-center space-x-3 text-xs text-gray-500">
                        {contact.company && (
                            <span className="flex items-center">
                                <HiOutlineBriefcase className="h-3 w-3 mr-1 text-gray-400" />
                                {contact.company}
                            </span>
                        )}
                        {contact.company && contact.location && <span className="text-gray-300">|</span>}
                        {contact.location && (
                            <span className="flex items-center">
                                <HiOutlineMapPin className="h-3 w-3 mr-1 text-gray-400" />
                                {contact.location}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2 relative" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                    <button
                        onClick={() => setShowCopyDropdown(!showCopyDropdown)}
                        className="p-2 bg-blue-500 text-black hover:bg-blue-600 rounded-md flex items-center text-sm"
                    >
                        <HiOutlineClipboardDocument className="mr-1 h-4 w-4" /> Copy <HiOutlineChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${showCopyDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showCopyDropdown && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <ul>
                                {contact.email && (
                                    <li
                                        onClick={() => handleCopyToClipboard(contact.email!, 'Email')}
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                                    >
                                        <HiOutlineEnvelope className="mr-2 h-4 w-4 text-gray-400" /> Copy Email
                                    </li>
                                )}
                                {contact.phone && (
                                    <li
                                        onClick={() => handleCopyToClipboard(contact.phone!, 'Phone')}
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                                    >
                                        <HiOutlinePhone className="mr-2 h-4 w-4 text-gray-400" /> Copy Phone
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactListItem; 