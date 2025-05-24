import React, { useState, useMemo } from 'react';
import { Contact, Interaction } from '../../types/people';
import ContactListItem from './ContactListItem';
import { HiOutlineSearch } from 'react-icons/hi';

interface ContactListProps {
    contacts: Contact[];
    onShowToast: (message: string, type: 'success' | 'error') => void;
    onToggleDetails: (contactId: string) => void;
    onCreateInteraction: (interactionData: Pick<Interaction, 'contactId' | 'contactName' | 'type' | 'dueDate' | 'details'>) => Promise<void>;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, onShowToast, onToggleDetails, onCreateInteraction }) => {
    const [searchTerm, setSearchTerm] = useState('');

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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    All Contacts ({filteredContacts.length})
                </h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
                    />
                    <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
        </div>
    );
};

export default ContactList; 