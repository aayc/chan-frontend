import React from 'react';
import { Contact } from '../../types/people';
import ContactListItem from './ContactListItem';

interface ContactListProps {
    contacts: Contact[];
    onShowToast: (message: string, type: 'success' | 'error') => void;
    onToggleDetails: (contactId: string) => void;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, onShowToast, onToggleDetails }) => (
    <div className="flex flex-col flex-grow min-h-0">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Contacts ({contacts.length})</h2>
        <div className="overflow-y-auto pr-2">
            {contacts.map(contact => (
                <ContactListItem
                    key={contact.id}
                    contact={contact}
                    onShowToast={onShowToast}
                    onToggleDetails={() => onToggleDetails(contact.id)}
                />
            ))}
            {contacts.length === 0 && <p className="text-gray-500 text-center py-4">No contacts found.</p>}
        </div>
    </div>
);

export default ContactList; 