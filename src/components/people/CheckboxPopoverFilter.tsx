import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineChevronDown } from 'react-icons/hi2';

interface CheckboxPopoverFilterProps {
    label: string;
    options: string[];
    selectedOptions: string[];
    onChange: (selected: string[]) => void;
    buttonTextPrefix?: string;
}

const CheckboxPopoverFilter: React.FC<CheckboxPopoverFilterProps> = ({
    label,
    options,
    selectedOptions,
    onChange,
    buttonTextPrefix
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimatingIn, setIsAnimatingIn] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
                return;
            }
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            setSearchTerm('');
            requestAnimationFrame(() => {
                setIsAnimatingIn(true);
            });
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            setIsAnimatingIn(false);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleCheckboxChange = (option: string) => {
        const newSelectedOptions = selectedOptions.includes(option)
            ? selectedOptions.filter(item => item !== option)
            : [...selectedOptions, option];
        onChange(newSelectedOptions);
    };

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayLabel = buttonTextPrefix ?
        `${buttonTextPrefix} ${selectedOptions.length > 0 ? `(${selectedOptions.length})` : ''}` :
        label;

    return (
        <div className="relative w-full">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full pl-3 pr-10 py-2 text-sm text-black flex items-center justify-between text-left bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
                <span className="text-sm font-normal">{displayLabel}</span>
                <HiOutlineChevronDown className={`ml-2 h-3 w-3 text-black transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div
                    ref={popoverRef}
                    className={`absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-3 space-y-2 transition-all duration-200 ease-in-out ${isAnimatingIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
                >
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                        {filteredOptions.length > 0 ? filteredOptions.map(option => (
                            <label key={option} className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-md cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedOptions.includes(option)}
                                    onChange={() => handleCheckboxChange(option)}
                                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300"
                                />
                                <span className="text-sm text-gray-700">{option}</span>
                            </label>
                        )) : (
                            <p className="text-xs text-gray-500 text-center py-2">No companies match your search.</p>
                        )}
                    </div>
                    {options.length > filteredOptions.length && searchTerm && (
                        <p className="text-xs text-gray-400 text-center pt-1">Showing {filteredOptions.length} of {options.length} matching companies.</p>
                    )}
                    {filteredOptions.length === 0 && !searchTerm && (
                        <p className="text-xs text-gray-500 text-center py-2">No companies available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CheckboxPopoverFilter; 