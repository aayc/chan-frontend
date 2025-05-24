import React, { useState, useEffect } from 'react';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
    const [isVisibleForAnimation, setIsVisibleForAnimation] = useState(false);
    const ANIMATION_DURATION_MS = 300; // Corresponds to Tailwind's duration-300

    useEffect(() => {
        const entryTimeout = setTimeout(() => {
            setIsVisibleForAnimation(true);
        }, 50);

        const exitTimeout = setTimeout(() => {
            setIsVisibleForAnimation(false);
            setTimeout(() => {
                onDismiss();
            }, ANIMATION_DURATION_MS);
        }, 3000);

        return () => {
            clearTimeout(entryTimeout);
            clearTimeout(exitTimeout);
        };
    }, [onDismiss, message]);

    let toastBgColor, mainIconColor, MainIconComponent;

    if (type === 'success') {
        toastBgColor = 'bg-green-100';
        mainIconColor = 'text-green-500';
        MainIconComponent = HiOutlineCheckCircle;
    } else { // error
        toastBgColor = 'bg-red-100';
        mainIconColor = 'text-red-500';
        MainIconComponent = HiOutlineXCircle;
    }

    return (
        <div
            className={`
                fixed bottom-5 right-5 p-3 rounded-lg shadow-lg flex items-center justify-between 
                ${toastBgColor} z-50 max-w-sm 
                transition-all ease-in-out duration-${ANIMATION_DURATION_MS} 
                ${isVisibleForAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}
        >
            <div className="flex items-center">
                <MainIconComponent className={`h-6 w-6 ${mainIconColor} mr-2 flex-shrink-0`} />
                <span className="text-gray-800 text-sm">{message}</span>
            </div>
        </div>
    );
};

export default Toast; 