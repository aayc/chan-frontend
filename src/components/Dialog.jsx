import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

export function Modal({
  trigger,
  title,
  description,
  children,
  primaryAction,
  secondaryAction
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">{title}</Dialog.Title>
          {description && (
            <Dialog.Description className="dialog-description">
              {description}
            </Dialog.Description>
          )}
          {children}
          <div className="dialog-buttons">
            {primaryAction && (
              <Dialog.Close asChild>
                {primaryAction}
              </Dialog.Close>
            )}
            {secondaryAction && (
              <Dialog.Close asChild>
                {secondaryAction}
              </Dialog.Close>
            )}
          </div>
          <Dialog.Close asChild>
            <button className="icon-button" aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const dialogStyles = `
  .dialog-overlay {
    background: rgba(0, 0, 0, 0.5);
    position: fixed;
    inset: 0;
    animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .dialog-overlay[data-state="closed"] {
    animation: overlayHide 150ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .dialog-content {
    background: white;
    border-radius: 6px;
    box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35),
                0 10px 20px -15px rgba(22, 23, 24, 0.2);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 450px;
    max-height: 85vh;
    padding: 25px;
    animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .dialog-content[data-state="closed"] {
    animation: contentHide 150ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .dialog-title {
    margin: 0;
    font-weight: 500;
    font-size: 17px;
  }

  .dialog-description {
    margin: 10px 0 20px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.5;
  }

  .dialog-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }

  .icon-button {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 4px;
    border-radius: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .icon-button:hover {
    background-color: #f3f4f6;
  }

  @keyframes overlayShow {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes overlayHide {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes contentShow {
    from { 
      opacity: 0; 
      transform: translate(-50%, -48%) scale(0.96); 
    }
    to { 
      opacity: 1; 
      transform: translate(-50%, -50%) scale(1); 
    }
  }

  @keyframes contentHide {
    from { 
      opacity: 1; 
      transform: translate(-50%, -50%) scale(1); 
    }
    to { 
      opacity: 0; 
      transform: translate(-50%, -48%) scale(0.96); 
    }
  }
`; 