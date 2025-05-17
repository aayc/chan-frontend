import React, { ReactNode } from 'react';
import * as Toast from '@radix-ui/react-toast';
import { Cross1Icon } from '@radix-ui/react-icons';

interface ToastNotificationProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    action?: ReactNode;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
    open,
    onOpenChange,
    title,
    description,
    action
}) => {
    return (
        <Toast.Provider>
            <Toast.Root
                className="toast-root"
                open={open}
                onOpenChange={onOpenChange}
            >
                <Toast.Title className="toast-title">
                    {title}
                </Toast.Title>
                <Toast.Description className="toast-description">
                    {description}
                </Toast.Description>
                {action && (
                    <Toast.Action asChild altText="Action">
                        {action}
                    </Toast.Action>
                )}
                <Toast.Close className="toast-close" aria-label="Close">
                    <Cross1Icon />
                </Toast.Close>
            </Toast.Root>
            <Toast.Viewport className="toast-viewport" />
        </Toast.Provider>
    );
}

export const toastStyles = `
  .toast-root {
    background: white;
    border-radius: 6px;
    box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35),
                0 10px 20px -15px rgba(22, 23, 24, 0.2);
    padding: 15px;
    display: grid;
    grid-template-areas: "title action" "description action";
    grid-template-columns: auto max-content;
    column-gap: 15px;
    align-items: center;
  }

  .toast-viewport {
    position: fixed;
    bottom: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    padding: 25px;
    gap: 10px;
    width: 390px;
    max-width: 100vw;
    margin: 0;
    list-style: none;
    z-index: 2147483647;
    outline: none;
  }

  .toast-title {
    grid-area: title;
    font-weight: 500;
    color: #000;
    font-size: 15px;
  }

  .toast-description {
    grid-area: description;
    margin: 0;
    color: #6b7280;
    font-size: 13px;
    line-height: 1.3;
  }

  .toast-close {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px;
    background: transparent;
    border: none;
    cursor: pointer;
  }
`; 