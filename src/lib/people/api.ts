import { Contact, Interaction } from '../../types/people';
import { auth } from '../../firebase';
import type { User } from 'firebase/auth';
import { API_BASE_URL } from '../utils/shared';

// --- Data Store Interface ---
export interface ContactsAPI {
    getContacts(): Promise<Contact[]>;
    getInteractions(): Promise<Interaction[]>;
    updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact>;
    createContact(contactData: Omit<Contact, 'id'>): Promise<Contact>;
    deleteContact(contactId: string): Promise<void>;
    updateInteraction(interactionId: string, updates: Partial<Pick<Interaction, 'status' | 'details' | 'changelog'>>): Promise<Interaction>;
    createInteraction(interactionData: Pick<Interaction, 'contactId' | 'contactName' | 'type' | 'dueDate' | 'details'>): Promise<Interaction>;
    deleteInteraction(interactionId: string): Promise<void>;
}

// --- Mock Implementation ---
class MockPeopleAPI implements ContactsAPI {
    private mockContactsData: Contact[] = [
        { id: "c1", name: "Alex Thompson", email: "alex@example.com", phone: "(555) 123-4567", location: "San Francisco, CA", lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), avatar: "https://randomuser.me/api/portraits/men/32.jpg", categories: ["Work"], notes: "Interested in SaaS solutions.", company: "Innovatech", birthday: "1985-07-15", linkedin: "https://linkedin.com/in/alexthompson", changelog: [] },
        { id: "c2", name: "Jessica Lee", email: "jessica@example.com", phone: "(555) 987-6543", location: "New York, NY", lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), avatar: "https://randomuser.me/api/portraits/women/44.jpg", categories: ["Friend"], company: "Self-Employed", birthday: "1993-02-20", linkedin: "https://linkedin.com/in/jessicalee", changelog: [] },
        { id: "c3", name: "Marcus Johnson", email: "marcus@example.com", phone: "(555) 456-7890", location: "Chicago, IL", lastContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), avatar: "https://randomuser.me/api/portraits/men/34.jpg", categories: ["Work"], notes: "Key decision maker at Globex.", company: "Globex Corp", birthday: "1990-11-22", changelog: [] },
        { id: "c4", name: "Samantha Green", email: "sam@example.com", phone: "(555) 234-5678", location: "Austin, TX", lastContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), avatar: "https://randomuser.me/api/portraits/women/35.jpg", categories: ["Networking"], company: "Tech Solutions", birthday: "1982-06-05", changelog: [] },
        { id: "c5", name: "Maria Rodriguez", email: "maria@example.com", phone: "(555) 876-5432", location: "Miami, FL", avatar: "https://randomuser.me/api/portraits/women/36.jpg", categories: ["Family"], notes: "Birthday next month!", birthday: "1978-05-25", changelog: [] },
        { id: "c6", name: "David Kim", email: "david@example.com", phone: "(555) 345-6789", location: "Seattle, WA", categories: ["Work"], company: "Innovatech", birthday: "1992-03-10", changelog: [] },
        { id: "c7", name: "Linda Smith", email: "linda@example.com", phone: "(555) 654-3210", location: "Boston, MA", avatar: "https://randomuser.me/api/portraits/women/37.jpg", categories: ["Friend"], lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), company: "HealthFirst", birthday: "1989-08-17", changelog: [] },
        { id: "c8", name: "Robert Brown", email: "robert@example.com", phone: "(555) 111-2222", location: "Denver, CO", categories: ["Networking"], notes: "Met at the conference.", company: "Globex Corp", changelog: [] },
        { id: "c9", name: "Emily White", email: "emily@example.com", phone: "(555) 444-5555", location: "Los Angeles, CA", avatar: "https://randomuser.me/api/portraits/women/38.jpg", categories: ["Work"], lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), company: "Innovatech", birthday: "1988-09-01", changelog: [] },
        { id: "c10", name: "Kevin Davis", email: "kevin@example.com", phone: "(555) 777-8888", location: "Phoenix, AZ", avatar: "https://randomuser.me/api/portraits/men/39.jpg", categories: ["Friend"], company: "Self-Employed", birthday: "1995-12-30", changelog: [] },
    ];

    private mockInteractionsData: Interaction[] = [
        { id: "int1", contactName: "Alex Thompson", contactId: "c1", type: "Follow-up", dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), status: "Pending", details: "Discuss new proposal.", changelog: [] },
        { id: "int2", contactName: "Jessica Lee", contactId: "c2", type: "Call", dueDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString(), status: "Pending", details: "Check in on project status.", changelog: [] },
        { id: "int3", contactName: "Maria Rodriguez", contactId: "c5", type: "Email", dueDate: new Date().toISOString(), status: "Pending", details: "Send Q3 report link.", changelog: [] },
    ];

    private nextContactId: number = this.mockContactsData.length + 1;
    private nextInteractionId: number = this.mockInteractionsData.length + 1;

    private async simulateDelay(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    async getContacts(): Promise<Contact[]> {
        await this.simulateDelay();
        return JSON.parse(JSON.stringify(this.mockContactsData));
    }

    async getInteractions(): Promise<Interaction[]> {
        await this.simulateDelay();
        return JSON.parse(JSON.stringify(this.mockInteractionsData));
    }

    async updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact> {
        await this.simulateDelay();
        const contactIndex = this.mockContactsData.findIndex(c => c.id === contactId);
        if (contactIndex === -1) {
            throw new Error('Contact not found');
        }
        this.mockContactsData[contactIndex] = { ...this.mockContactsData[contactIndex], ...updates };
        return JSON.parse(JSON.stringify(this.mockContactsData[contactIndex]));
    }

    async createContact(contactData: Omit<Contact, 'id'>): Promise<Contact> {
        await this.simulateDelay();
        const newContact: Contact = {
            id: `c${this.nextContactId++}`,
            ...contactData,
        };
        this.mockContactsData.push(newContact);
        return JSON.parse(JSON.stringify(newContact));
    }

    async deleteContact(contactId: string): Promise<void> {
        await this.simulateDelay();
        const initialLength = this.mockContactsData.length;
        this.mockContactsData = this.mockContactsData.filter(c => c.id !== contactId);
        if (this.mockContactsData.length === initialLength) {
            throw new Error('Contact not found for deletion');
        }
        return Promise.resolve();
    }

    async updateInteraction(interactionId: string, updates: Partial<Pick<Interaction, 'status' | 'details' | 'changelog'>>): Promise<Interaction> {
        await this.simulateDelay();
        const interactionIndex = this.mockInteractionsData.findIndex(i => i.id === interactionId);
        if (interactionIndex === -1) {
            throw new Error('Interaction not found');
        }
        const currentInteraction = this.mockInteractionsData[interactionIndex];

        // Now we allow status, details, and changelog to be updated.
        // We can directly spread the updates if we trust the incoming structure
        // or be more explicit if needed.
        this.mockInteractionsData[interactionIndex] = { ...currentInteraction, ...updates };
        return JSON.parse(JSON.stringify(this.mockInteractionsData[interactionIndex]));
    }

    async createInteraction(interactionData: Pick<Interaction, 'contactId' | 'contactName' | 'type' | 'dueDate' | 'details'>): Promise<Interaction> {
        await this.simulateDelay();
        const newInteraction: Interaction = {
            id: `int${this.nextInteractionId++}`,
            contactId: interactionData.contactId,
            contactName: interactionData.contactName,
            type: interactionData.type,
            dueDate: interactionData.dueDate,
            details: interactionData.details,
            status: 'Pending',
            changelog: [],
        };
        this.mockInteractionsData.push(newInteraction);
        return JSON.parse(JSON.stringify(newInteraction));
    }

    async deleteInteraction(interactionId: string): Promise<void> {
        await this.simulateDelay();
        const initialLength = this.mockInteractionsData.length;
        this.mockInteractionsData = this.mockInteractionsData.filter(i => i.id !== interactionId);
        if (this.mockInteractionsData.length === initialLength) {
            throw new Error('Interaction not found for deletion');
        }
        return Promise.resolve();
    }
}

// IMPORTANT: Replace this with your actual Firebase authentication token provider
async function getAuthToken(): Promise<string | null> {
    if (!auth) { // Check if auth is defined
        console.warn("getAuthToken: Firebase auth module is not available.");
        return null;
    }

    const user: User | null = auth.currentUser;
    if (user) {
        try {
            return await user.getIdToken();
        } catch (error) {
            console.error('Error getting Firebase ID token:', error);
            return null;
        }
    }
    console.warn("getAuthToken: No current user. User might not be logged in.");
    return null;
}

class ServerContactsAPI implements ContactsAPI {
    private baseUrl: string;
    private tokenProvider: () => Promise<string | null>;

    constructor(baseUrl: string, tokenProvider: () => Promise<string | null>) {
        this.baseUrl = baseUrl;
        this.tokenProvider = tokenProvider;
    }

    private async _fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
        const token = await this.tokenProvider();
        if (!token) {
            throw new Error('Authentication token not available. User might not be logged in.');
        }

        const headers: HeadersInit = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        } as Record<string, string>;

        // Only add Content-Type if there's a body (common for POST, PUT, PATCH)
        if (options.body) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                // Not a JSON error response, or empty body
                const errorText = await response.text(); // Attempt to get text for more context
                throw new Error(`HTTP error ${response.status}: ${response.statusText}. ${errorText || ''}`.trim());
            }
            // FastAPI often returns errors with a 'detail' field
            const message = errorData?.detail || `HTTP error ${response.status}`;
            throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
        }

        if (response.status === 204) { // No Content
            return undefined;
        }
        return response.json();
    }

    async getContacts(): Promise<Contact[]> {
        return this._fetchWithAuth('/contacts');
    }

    async getInteractions(): Promise<Interaction[]> {
        // Assuming the backend /interactions route can filter by contactId or return all
        // The provided FastAPI backend get_interactions_endpoint supports an optional contact_id query param
        return this._fetchWithAuth('/interactions');
    }

    async createContact(contactData: Omit<Contact, 'id'>): Promise<Contact> {
        return this._fetchWithAuth('/contacts', {
            method: 'POST',
            body: JSON.stringify(contactData),
        });
    }

    async updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact> {
        return this._fetchWithAuth(`/contacts/${contactId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async deleteContact(contactId: string): Promise<void> {
        await this._fetchWithAuth(`/contacts/${contactId}`, {
            method: 'DELETE',
        });
    }

    async createInteraction(interactionData: Pick<Interaction, 'contactId' | 'contactName' | 'type' | 'dueDate' | 'details'>): Promise<Interaction> {
        return this._fetchWithAuth('/interactions', {
            method: 'POST',
            body: JSON.stringify(interactionData),
        });
    }

    async updateInteraction(interactionId: string, updates: Partial<Pick<Interaction, 'status' | 'details' | 'changelog'>>): Promise<Interaction> {
        return this._fetchWithAuth(`/interactions/${interactionId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async deleteInteraction(interactionId: string): Promise<void> {
        await this._fetchWithAuth(`/interactions/${interactionId}`, {
            method: 'DELETE',
        });
    }
}

// --- API Service Configuration ---
// For now, we directly use MockPeopleStorage.
// Later, this could be decided by environment variables or other configurations.
// const peopleStorageService: PeopleAPI = new MockPeopleAPI();
const peopleStorageService: ContactsAPI = new ServerContactsAPI(API_BASE_URL, getAuthToken);

// --- Exported API Functions (using the configured service) ---
export const getContacts = async (): Promise<Contact[]> => {
    return peopleStorageService.getContacts();
};

export const getInteractions = async (): Promise<Interaction[]> => {
    return peopleStorageService.getInteractions();
};

export const updateContact = async (contactId: string, updates: Partial<Contact>): Promise<Contact> => {
    return peopleStorageService.updateContact(contactId, updates);
};

export const createContact = async (contactData: Omit<Contact, 'id'>): Promise<Contact> => {
    return peopleStorageService.createContact(contactData);
};

export const deleteContact = async (contactId: string): Promise<void> => {
    return peopleStorageService.deleteContact(contactId);
};

export const updateInteraction = async (interactionId: string, updates: Partial<Pick<Interaction, 'status' | 'details' | 'changelog'>>): Promise<Interaction> => {
    return peopleStorageService.updateInteraction(interactionId, updates);
};

export const createInteraction = async (interactionData: Pick<Interaction, 'contactId' | 'contactName' | 'type' | 'dueDate' | 'details'>): Promise<Interaction> => {
    return peopleStorageService.createInteraction(interactionData);
};

export const deleteInteraction = async (interactionId: string): Promise<void> => {
    return peopleStorageService.deleteInteraction(interactionId);
}; 