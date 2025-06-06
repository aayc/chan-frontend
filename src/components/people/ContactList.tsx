import React, { useState, useMemo } from 'react';
import { Contact, Interaction } from '../../types/people';
import ContactListItem from './ContactListItem';
import { HiOutlineSearch } from 'react-icons/hi';
import { HiOutlineUserPlus } from 'react-icons/hi2';
import CreateContactModal from './CreateContactModal';

interface ContactListProps {
    contacts: Contact[];
    onShowToast: (message: string, type: 'success' | 'error') => void;
    onToggleDetails: (contactId: string) => void;
    onCreateInteraction: (interactionData: Pick<Interaction, 'contactId' | 'contactName' | 'type' | 'dueDate' | 'details'>) => Promise<void>;
    onCreateContact: (contactData: Omit<Contact, 'id'>) => Promise<void>;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, onShowToast, onToggleDetails, onCreateInteraction, onCreateContact }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateContactModalOpen, setIsCreateContactModalOpen] = useState(false);

    const filteredContacts = useMemo(() => {
        if (!searchTerm) {
            return contacts;
        }
        return contacts.filter(contact =>
            contact.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [contacts, searchTerm]);

    return (
        <div className="flex flex-col flex-grow min-h-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 gap-3 sm:gap-0">
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">
                    All Contacts ({filteredContacts.length})
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-3">
                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-64"
                        />
                        <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <button
                        onClick={() => setIsCreateContactModalOpen(true)}
                        title="Add New Contact"
                        className="p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors duration-150 flex items-center justify-center self-end sm:self-auto"
                    >
                        <HiOutlineUserPlus className="h-6 w-6" />
                    </button>
                </div>
            </div>
            <div className="overflow-y-auto pr-2">
                {filteredContacts.map(contact => (
                    <ContactListItem
                        key={contact.id}
                        contact={contact}
                        onShowToast={onShowToast}
                        onToggleDetails={() => onToggleDetails(contact.id)}
                        onCreateInteraction={onCreateInteraction}
                    />
                ))}
                {filteredContacts.length === 0 && <p className="text-gray-500 text-center py-4">No contacts found{searchTerm ? ' matching your search' : ''}.</p>}
            </div>
            {isCreateContactModalOpen && (
                <CreateContactModal
                    onClose={() => setIsCreateContactModalOpen(false)}
                    onCreate={async (contactData) => {
                        await onCreateContact(contactData);
                        setIsCreateContactModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default ContactList; 