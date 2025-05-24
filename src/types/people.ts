export interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    lastContact?: string; // ISO Date string for sortability
    avatar?: string;
    categories?: string[];
    notes?: string;
    company?: string; // Added company field
    birthday?: string; // Added birthday field (ISO Date string)
}

export interface Interaction {
    id: string;
    contactName: string;
    contactId: string;
    type: 'Call' | 'Email' | 'Meeting' | 'Follow-up';
    dueDate: string; // e.g., "2024-07-28T10:00:00Z"
    status: 'Pending' | 'Completed' | 'Overdue';
    details?: string;
} 