import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronRightIcon, CheckIcon } from '@radix-ui/react-icons';

export interface DropdownItem {
    label?: string;
    icon?: boolean;
    separator?: boolean;
    action?: () => void; // Optional action for the item
}

interface DropdownProps {
    items: DropdownItem[];
    triggerLabel?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ items = [], triggerLabel = 'Options' }) => {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="dropdown-trigger">
                    {triggerLabel}
                    <ChevronRightIcon className="dropdown-icon" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content className="dropdown-content" sideOffset={5}>
                    {items.map((item, index) => (
                        item.separator ? (
                            <DropdownMenu.Separator key={index} className="dropdown-separator" />
                        ) : (
                            <DropdownMenu.Item key={index} className="dropdown-item" onSelect={item.action}>
                                {item.label}
                                {item.icon && <ChevronRightIcon className="dropdown-item-icon" />}
                            </DropdownMenu.Item>
                        )
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export const dropdownStyles = `
  .dropdown-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .dropdown-trigger:hover {
    border-color: #000;
  }

  .dropdown-icon {
    color: #6b7280;
  }

  .dropdown-content {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 5px;
    min-width: 180px;
    box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35),
                0 10px 20px -15px rgba(22, 23, 24, 0.2);
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
  }

  .dropdown-content[data-state="open"] {
    animation-name: dropdownEnter;
  }

  .dropdown-content[data-state="closed"] {
    animation-name: dropdownExit;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 4px;
    cursor: pointer;
    outline: none;
    user-select: none;
    transition: background-color 0.2s ease;
  }

  .dropdown-item:hover {
    background: #f8f9fa;
  }

  .dropdown-item-icon {
    color: #6b7280;
  }

  .dropdown-separator {
    height: 1px;
    background: #e5e7eb;
    margin: 5px 0;
  }

  @keyframes dropdownEnter {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes dropdownExit {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }
`; 