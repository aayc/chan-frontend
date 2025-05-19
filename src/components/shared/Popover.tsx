import React, { useRef, useEffect } from 'react';

interface PopoverProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
    className?: string;
}

const Popover: React.FC<PopoverProps> = ({
    trigger,
    children,
    open,
    onOpenChange,
    align = 'end',
    sideOffset = 8,
    className,
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (open &&
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                onOpenChange(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, onOpenChange]);

    const getAlignmentClasses = () => {
        switch (align) {
            case 'start':
                return 'left-0';
            case 'center':
                return 'left-1/2 -translate-x-1/2';
            case 'end':
            default:
                return 'right-0';
        }
    };

    return (
        <div className={`relative inline-block ${className || ''}`.trim()}>
            <div ref={triggerRef} onClick={() => onOpenChange(!open)} className="cursor-pointer w-full h-full">
                {trigger}
            </div>
            <div
                ref={popoverRef}
                style={{ marginTop: `${sideOffset}px` }}
                className={`
            absolute z-50 min-w-[220px] p-4 bg-white border border-gray-200 rounded-md shadow-lg 
            dark:bg-gray-800 dark:border-gray-700
            transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] 
            ${getAlignmentClasses()} 
            ${align === 'end' || align === 'center' ? 'origin-top-right' : 'origin-top-left'} 
            ${open
                        ? 'opacity-100 scale-100 visible'
                        : 'opacity-0 scale-95 invisible pointer-events-none'
                    }
          `}
            >
                {children}
            </div>
        </div>
    );
};

export default Popover; 