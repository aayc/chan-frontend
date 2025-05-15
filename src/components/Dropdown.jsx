import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { HamburgerMenuIcon, ChevronRightIcon } from '@radix-ui/react-icons';

export function Dropdown({ items = [] }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="dropdown-trigger">
          <HamburgerMenuIcon />
          Open Menu
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="dropdown-content" sideOffset={5}>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.separator && <DropdownMenu.Separator className="dropdown-separator" />}
              <DropdownMenu.Item className="dropdown-item">
                {item.label}
                {item.icon && <ChevronRightIcon />}
              </DropdownMenu.Item>
            </React.Fragment>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export const dropdownStyles = `
  .dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #f3f4f6;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  }

  .dropdown-trigger:hover {
    background: #e5e7eb;
  }

  .dropdown-content {
    min-width: 220px;
    background: white;
    border-radius: 6px;
    padding: 5px;
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
    transition: background-color 0.2s ease;
  }

  .dropdown-item:hover {
    background: #f3f4f6;
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