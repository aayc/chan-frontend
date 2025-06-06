import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../AuthContext';
import { Sidebar } from '../components/shared/Sidebar';
import { HiOutlineUserGroup } from 'react-icons/hi2';
import { Contact, Interaction } from '../types/people';
import * as PeopleApi from '../lib/people/api';
import ContactList from '../components/people/ContactList';
import Toast from '../components/people/Toast';
import CheckboxPopoverFilter from '../components/people/CheckboxPopoverFilter';
import ContactDetailModal from '../components/people/ContactDetailModal';
import Interactions from '../components/people/Interactions';

export default function People() {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, currentUser } = useAuth();
    const [toastInfo, setToastInfo] = useState<{ message: string; type: 'success' | 'error'; key: number } | null>(null);
    const [detailedContactId, setDetailedContactId] = useState<string | null>(null);

    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [actionableInteractions, setActionableInteractions] = useState<Interaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [contacts, interactions] = await Promise.all([
                    PeopleApi.getContacts(),
                    PeopleApi.getInteractions(),
                ]);
                setAllContacts(contacts);
                setActionableInteractions(interactions);
            } catch (error) {
                console.error("Failed to fetch people data:", error);
                showToast('Failed to load data', 'error');
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    // State for sorting and filtering
    const [sortOption, setSortOption] = useState('name');
    const [filterCircle, setFilterCircle] = useState('');
    const [filterCompany, setFilterCompany] = useState<string[]>([]);
    const [displayedContacts, setDisplayedContacts] = useState<Contact[]>([]);

    const handleToggleContactDetails = (contactId: string) => {
        setDetailedContactId(prevId => (prevId === contactId ? null : contactId));
    };

    const handleUpdateContactDetail = async (contactId: string, updates: Partial<Contact>) => {
        try {
            const updatedContactFromApi = await PeopleApi.updateContact(contactId, updates);
            setAllContacts(prevContacts =>
                prevContacts.map(contact =>
                    contact.id === contactId ? updatedContactFromApi : contact
                )
            );
            showToast('Contact updated!', 'success');
        } catch (error) {
            console.error("Failed to update contact:", error);
            showToast('Failed to update contact', 'error');
        }
    };

    const handleUpdateInteraction = async (interactionId: string, updates: Partial<Pick<Interaction, 'status' | 'details' | 'changelog'>>) => {
        try {
            const updatedInteraction = await PeopleApi.updateInteraction(interactionId, updates);
            setActionableInteractions(prevInteractions =>
                prevInteractions.map(interaction =>
                    interaction.id === interactionId ? updatedInteraction : interaction
                )
            );
            showToast('Interaction updated!', 'success');
        } catch (error) {
            console.error("Failed to update interaction:", error);
            showToast('Failed to update interaction', 'error');
        }
    };

    const handleCreateInteraction = async (interactionData: Pick<Interaction, 'contactId' | 'contactName' | 'type' | 'dueDate' | 'details'>) => {
        try {
            const newInteraction = await PeopleApi.createInteraction(interactionData);
            setActionableInteractions(prevInteractions => [newInteraction, ...prevInteractions]);
            showToast('Interaction logged successfully!', 'success');
        } catch (error) {
            console.error("Failed to create interaction:", error);
            showToast('Failed to log interaction', 'error');
        }
    };

    const handleDeleteInteraction = async (interactionId: string) => {
        try {
            await PeopleApi.deleteInteraction(interactionId);
            setActionableInteractions(prevInteractions =>
                prevInteractions.filter(interaction => interaction.id !== interactionId)
            );
            showToast('Interaction deleted!', 'success');
        } catch (error) {
            console.error("Failed to delete interaction:", error);
            showToast('Failed to delete interaction', 'error');
        }
    };

    const handleCreateContact = async (contactData: Omit<Contact, 'id'>) => {
        try {
            const newContact = await PeopleApi.createContact(contactData);
            setAllContacts(prevContacts => [newContact, ...prevContacts]);
            showToast('Contact created successfully!', 'success');
        } catch (error) {
            console.error("Failed to create contact:", error);
            showToast('Failed to create contact', 'error');
        }
    };

    const stats = useMemo(() => [
        { title: "Total Contacts", value: allContacts.length.toString(), change: "", icon: "users" },
        {
            title: "Upcoming Birthdays",
            value: allContacts.filter(c => {
                if (!c.birthday) return false;
                const today = new Date();
                const birthDate = new Date(c.birthday);
                birthDate.setFullYear(today.getFullYear());
                if (birthDate < today) birthDate.setFullYear(today.getFullYear() + 1);
                const diffDays = Math.ceil((birthDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 30;
            }).length.toString(),
            change: "In the next 30 days",
            icon: "gift"
        },
        { title: "Pending Reminders", value: actionableInteractions.filter(i => i.status === 'Pending').length.toString(), change: `${actionableInteractions.filter(i => i.status === 'Pending' && new Date(i.dueDate).toDateString() === new Date().toDateString()).length} due today`, icon: "clock" },
    ], [allContacts, actionableInteractions]);

    const uniqueCircles = useMemo(() => {
        const allCategories = allContacts
            .flatMap(c => c.categories || [])
            .map(cat => cat.trim())
            .filter(Boolean);
        const circles = new Set(allCategories);
        return ['', ...Array.from(circles).sort()];
    }, [allContacts]);

    const uniqueCompanies = useMemo(() => {
        const companies = new Set(allContacts.map(c => c.company).filter(Boolean) as string[]);
        return Array.from(companies).sort();
    }, [allContacts]);

    useEffect(() => {
        let contactsToDisplay = [...allContacts];
        if (filterCircle) {
            contactsToDisplay = contactsToDisplay.filter(c => c.categories && c.categories.includes(filterCircle));
        }
        if (filterCompany.length > 0) {
            contactsToDisplay = contactsToDisplay.filter(c =>
                c.company && filterCompany.includes(c.company)
            );
        }
        if (sortOption === 'name') {
            contactsToDisplay.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'lastContact') {
            contactsToDisplay.sort((a, b) => {
                if (!a.lastContact && !b.lastContact) return 0;
                if (!a.lastContact) return 1;
                if (!b.lastContact) return -1;
                return new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime();
            });
        } else if (sortOption === 'upcomingInteraction') {
            contactsToDisplay.sort((a, b) => {
                const aInteraction = actionableInteractions.find(i => i.contactId === a.id && i.status === 'Pending');
                const bInteraction = actionableInteractions.find(i => i.contactId === b.id && i.status === 'Pending');
                if (aInteraction && bInteraction) {
                    return new Date(aInteraction.dueDate).getTime() - new Date(bInteraction.dueDate).getTime();
                }
                if (aInteraction) return -1;
                if (bInteraction) return 1;
                return a.name.localeCompare(b.name);
            });
        }
        setDisplayedContacts(contactsToDisplay);
    }, [allContacts, actionableInteractions, sortOption, filterCircle, filterCompany]);

    const activeContactForModal = useMemo(() => {
        return allContacts.find(contact => contact.id === detailedContactId);
    }, [allContacts, detailedContactId]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message, type, key: Date.now() });
    };

    const handleDismissToast = () => {
        setToastInfo(null);
    };

    const getActiveView = () => {
        const path = location.pathname;
        if (path.startsWith('/people')) return 'people';
        return null;
    };

    const activeView = getActiveView();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const handleNavigation = (view: string) => {
        if (['expenses', 'transactions', 'assets', 'income'].includes(view)) {
            navigate(`/ledger/${view}`);
        } else if (view === 'people') {
            navigate('/people');
        } else {
            navigate(`/${view}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-100 items-center justify-center">
                <p className="text-xl text-gray-500">Loading contacts...</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar
                    currentUser={currentUser}
                    activeView={activeView}
                    onSignOut={handleSignOut}
                    onNavigate={handleNavigation}
                    appName="People"
                    appIcon={<HiOutlineUserGroup className="text-3xl mr-2 text-blue-500" />}
                />
                <div className="flex-1 p-4 sm:p-6 lg:p-10 pt-16 lg:pt-10 flex flex-col overflow-hidden">
                    <Interactions
                        interactions={actionableInteractions}
                        onUpdateInteraction={handleUpdateInteraction}
                        onDeleteInteraction={handleDeleteInteraction}
                    />

                    {/* Filter and Sort Controls */}
                    <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-white rounded-lg shadow">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 items-end">
                            <div>
                                <label htmlFor="sortOption" className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                                <select
                                    id="sortOption"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="name">Name (A-Z)</option>
                                    <option value="lastContact">Most Recent Interaction</option>
                                    <option value="upcomingInteraction">Upcoming Interaction</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="filterCircle" className="block text-sm font-medium text-gray-700 mb-2">Filter by Circle</label>
                                <select
                                    id="filterCircle"
                                    value={filterCircle}
                                    onChange={(e) => setFilterCircle(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    {uniqueCircles.map(circle => (
                                        <option key={circle || 'all-circles'} value={circle}>{circle || 'All Circles'}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1">
                                <label htmlFor="filterCompanyPopover" className="block text-sm font-medium text-gray-700 mb-1">Filter by Company</label>
                                <CheckboxPopoverFilter
                                    label="Select Companies"
                                    buttonTextPrefix="Company"
                                    options={uniqueCompanies}
                                    selectedOptions={filterCompany}
                                    onChange={setFilterCompany}
                                />
                            </div>
                        </div>
                    </div>

                    <ContactList
                        contacts={displayedContacts}
                        onShowToast={showToast}
                        onToggleDetails={handleToggleContactDetails}
                        onCreateInteraction={handleCreateInteraction}
                        onCreateContact={handleCreateContact}
                    />
                </div>
            </div>
            {toastInfo && (
                <Toast
                    key={toastInfo.key}
                    message={toastInfo.message}
                    type={toastInfo.type}
                    onDismiss={handleDismissToast}
                />
            )}
            {activeContactForModal && (
                <ContactDetailModal
                    contact={activeContactForModal}
                    onClose={() => setDetailedContactId(null)}
                    onUpdate={(contactId, updates) => handleUpdateContactDetail(contactId, updates)}
                />
            )}
        </>
    );
} 