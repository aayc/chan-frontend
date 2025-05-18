import React from 'react';

interface TagProps {
    label: string;
    // Future props like color, icon, etc. could be added here
}

const Tag: React.FC<TagProps> = ({ label }) => {
    if (!label) {
        return null;
    }

    return (
        <span
            className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-blue-200 dark:text-blue-800"
        >
            {label}
        </span>
    );
};

export default Tag; 