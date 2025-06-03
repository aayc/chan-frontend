import React from 'react';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, Cross2Icon } from '@radix-ui/react-icons';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectMenuProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

interface MultiSelectMenuProps {
  values: string[];
  onValuesChange: (values: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
}

export const SelectMenu: React.FC<SelectMenuProps> = ({
  value,
  onValueChange,
  options = [],
  placeholder = "Select an option"
}) => {
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

export const MultiSelectMenu: React.FC<MultiSelectMenuProps> = ({
  values,
  onValuesChange,
  options = [],
  placeholder = "Select years"
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleOption = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onValuesChange(values.filter(v => v !== optionValue));
    } else {
      onValuesChange([...values, optionValue]);
    }
  };

  const removeValue = (valueToRemove: string) => {
    onValuesChange(values.filter(v => v !== valueToRemove));
  };

  const getDisplayText = () => {
    if (values.length === 0) return placeholder;
    if (values.length === 1) return values[0];
    return `${values.length} years selected`;
  };

  return (
    <div className="multi-select-container">
      <div className="multi-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className="multi-select-text">{getDisplayText()}</span>
        <ChevronDownIcon className="multi-select-icon" />
      </div>

      {values.length > 0 && (
        <div className="multi-select-chips">
          {values.map(value => (
            <div key={value} className="multi-select-chip">
              <span>{value}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeValue(value);
                }}
                className="multi-select-chip-remove"
              >
                <Cross2Icon />
              </button>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="multi-select-dropdown">
          {options.map((option) => (
            <div
              key={option.value}
              className="multi-select-option"
              onClick={() => toggleOption(option.value)}
            >
              <input
                type="checkbox"
                checked={values.includes(option.value)}
                onChange={() => { }} // Handled by onClick
                className="multi-select-checkbox"
              />
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="multi-select-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

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

  /* Multi-select styles */
  .multi-select-container {
    position: relative;
    width: 100%;
  }

  .multi-select-trigger {
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
    min-width: 200px;
    width: 100%;
    transition: all 0.2s ease;
  }

  .multi-select-trigger:hover {
    border-color: #000;
  }

  .multi-select-text {
    flex: 1;
    text-align: left;
    color: #374151;
  }

  .multi-select-icon {
    color: #6b7280;
    flex-shrink: 0;
  }

  .multi-select-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
  }

  .multi-select-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 16px;
    padding: 4px 8px;
    font-size: 12px;
    color: #374151;
  }

  .multi-select-chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    color: #6b7280;
    transition: all 0.2s ease;
  }

  .multi-select-chip-remove:hover {
    background: #e5e7eb;
    color: #374151;
  }

  .multi-select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 8px;
    box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35),
                0 10px 20px -15px rgba(22, 23, 24, 0.2);
    z-index: 50;
    max-height: 200px;
    overflow-y: auto;
  }

  .multi-select-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .multi-select-option:hover {
    background: #f8f9fa;
  }

  .multi-select-checkbox {
    width: 16px;
    height: 16px;
    accent-color: #3b82f6;
  }

  .multi-select-backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
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