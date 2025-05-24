import React from 'react';
import { HiOutlineBellAlert } from 'react-icons/hi2';
import { Interaction } from '../../types/people';

interface ActionableInteractionsProps {
    interactions: Interaction[];
}

const ActionableInteractions: React.FC<ActionableInteractionsProps> = ({ interactions }) => {
    if (!interactions.length) {
        return (
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <HiOutlineBellAlert className="mr-2 h-6 w-6 text-yellow-500" />
                    Actionable Interactions
                </h2>
                <p className="text-gray-500">No immediate actions due.</p>
            </div>
        );
    }
    return (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <HiOutlineBellAlert className="mr-2 h-6 w-6 text-yellow-500" />
                Actionable (Next 48 Hours)
            </h2>
            <ul className="space-y-3">
                {interactions.map(interaction => (
                    <li key={interaction.id} className="p-3 bg-yellow-50 rounded-md border border-yellow-200 hover:bg-yellow-100">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="font-medium text-yellow-700">{interaction.type} with {interaction.contactName}</span>
                                <p className="text-sm text-yellow-600">{interaction.details || `Scheduled for ${new Date(interaction.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${new Date(interaction.dueDate).toLocaleDateString()}`}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${interaction.status === 'Pending' ? 'bg-orange-200 text-orange-800' : 'bg-red-200 text-red-800'}`}>
                                {interaction.status}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActionableInteractions; 