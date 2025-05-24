import { Contact, Interaction } from '../src/types/people';

// Mock data store
let mockContactsData: Contact[] = [
    { id: "c1", name: "Alex Thompson", email: "alex@example.com", phone: "(555) 123-4567", location: "San Francisco, CA", lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), avatar: "https://randomuser.me/api/portraits/men/32.jpg", categories: ["Work"], notes: "Interested in SaaS solutions.", company: "Innovatech", birthday: "1985-07-15" },
    { id: "c2", name: "Jessica Lee", email: "jessica@example.com", phone: "(555) 987-6543", location: "New York, NY", lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), avatar: "https://randomuser.me/api/portraits/women/44.jpg", categories: ["Friend"], company: "Self-Employed", birthday: "1993-02-20" },
    { id: "c3", name: "Marcus Johnson", email: "marcus@example.com", phone: "(555) 456-7890", location: "Chicago, IL", lastContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), avatar: "https://randomuser.me/api/portraits/men/34.jpg", categories: ["Work"], notes: "Key decision maker at Globex.", company: "Globex Corp", birthday: "1990-11-22" },
    { id: "c4", name: "Samantha Green", email: "sam@example.com", phone: "(555) 234-5678", location: "Austin, TX", lastContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), avatar: "https://randomuser.me/api/portraits/women/35.jpg", categories: ["Networking"], company: "Tech Solutions", birthday: "1982-06-05" },
    { id: "c5", name: "Maria Rodriguez", email: "maria@example.com", phone: "(555) 876-5432", location: "Miami, FL", avatar: "https://randomuser.me/api/portraits/women/36.jpg", categories: ["Family"], notes: "Birthday next month!", birthday: "1978-05-25" },
    { id: "c6", name: "David Kim", email: "david@example.com", phone: "(555) 345-6789", location: "Seattle, WA", categories: ["Work"], company: "Innovatech", birthday: "1992-03-10" },
    { id: "c7", name: "Linda Smith", email: "linda@example.com", phone: "(555) 654-3210", location: "Boston, MA", avatar: "https://randomuser.me/api/portraits/women/37.jpg", categories: ["Friend"], lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), company: "HealthFirst", birthday: "1989-08-17" },
    { id: "c8", name: "Robert Brown", email: "robert@example.com", phone: "(555) 111-2222", location: "Denver, CO", categories: ["Networking"], notes: "Met at the conference.", company: "Globex Corp" },
    { id: "c9", name: "Emily White", email: "emily@example.com", phone: "(555) 444-5555", location: "Los Angeles, CA", avatar: "https://randomuser.me/api/portraits/women/38.jpg", categories: ["Work"], lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), company: "Innovatech", birthday: "1988-09-01" },
    { id: "c10", name: "Kevin Davis", email: "kevin@example.com", phone: "(555) 777-8888", location: "Phoenix, AZ", avatar: "https://randomuser.me/api/portraits/men/39.jpg", categories: ["Friend"], company: "Self-Employed", birthday: "1995-12-30" },
];

let mockInteractionsData: Interaction[] = [
    { id: "int1", contactName: "Alex Thompson", contactId: "c1", type: "Follow-up", dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), status: "Pending", details: "Discuss new proposal." },
    { id: "int2", contactName: "Jessica Lee", contactId: "c2", type: "Call", dueDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString(), status: "Pending", details: "Check in on project status." },
    { id: "int3", contactName: "Maria Rodriguez", contactId: "c5", type: "Email", dueDate: new Date().toISOString(), status: "Pending", details: "Send Q3 report link." },
];

// API Functions
export const getContacts = async (): Promise<Contact[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return JSON.parse(JSON.stringify(mockContactsData)); // Return a deep copy
};

export const getInteractions = async (): Promise<Interaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return JSON.parse(JSON.stringify(mockInteractionsData)); // Return a deep copy
};

export const updateContact = async (contactId: string, updates: Partial<Contact>): Promise<Contact> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const contactIndex = mockContactsData.findIndex(c => c.id === contactId);
    if (contactIndex === -1) {
        throw new Error('Contact not found');
    }
    mockContactsData[contactIndex] = { ...mockContactsData[contactIndex], ...updates };
    return JSON.parse(JSON.stringify(mockContactsData[contactIndex]));
};

let nextContactId = mockContactsData.length + 1;
export const createContact = async (contactData: Omit<Contact, 'id'>): Promise<Contact> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newContact: Contact = {
        id: `c${nextContactId++}`,
        ...contactData,
    };
    mockContactsData.push(newContact);
    return JSON.parse(JSON.stringify(newContact));
};

export const deleteContact = async (contactId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const initialLength = mockContactsData.length;
    mockContactsData = mockContactsData.filter(c => c.id !== contactId);
    if (mockContactsData.length === initialLength) {
        throw new Error('Contact not found for deletion');
    }
    return Promise.resolve();
}; 