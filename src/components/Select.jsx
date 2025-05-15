import React from 'react';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';

export function SelectMenu({
  value,
  onValueChange,
  options = [],
  placeholder = "Select an option"
}) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="select-trigger">
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="select-icon">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="select-content" position="popper" sideOffset={5}>
          <Select.Viewport className="select-viewport">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="select-item"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="select-item-indicator">
                  <CheckIcon />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export const selectStyles = `
  .select-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 16px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    min-width: 120px;
    transition: all 0.2s ease;
  }

  .select-trigger:hover {
    border-color: #000;
  }

  .select-icon {
    color: #6b7280;
  }

  .select-content {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 5px;
    box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35),
                0 10px 20px -15px rgba(22, 23, 24, 0.2);
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
  }

  .select-content[data-state="open"] {
    animation-name: selectEnter;
  }

  .select-content[data-state="closed"] {
    animation-name: selectExit;
  }

  .select-viewport {
    padding: 5px;
  }

  .select-item {
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

  .select-item:hover {
    background: #f8f9fa;
  }

  .select-item-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #000;
  }

  @keyframes selectEnter {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes selectExit {
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