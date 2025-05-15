import React, { useState } from 'react';
import { Dropdown } from '../components/Dropdown';
import { Modal } from '../components/Dialog';
import { UserAvatar } from '../components/Avatar';
import { ToastNotification } from '../components/Toast';
import { SelectMenu } from '../components/Select';
import { componentStyles } from '../components/styles';

export default function Home() {
    const [showToast, setShowToast] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState('annual');

    const dropdownItems = [
        { label: 'New Tab', icon: true },
        { label: 'New Window' },
        { separator: true },
        { label: 'Share' }
    ];

    const billingOptions = [
        { value: 'annual', label: 'Annual' },
        { value: 'monthly', label: 'Monthly' }
    ];

    return (
        <div className="home">
            <h1>Radix UI Components Demo</h1>

            <div className="components-grid">
                {/* Billing Period Select */}
                <section className="component-demo">
                    <h2>Billing Period</h2>
                    <SelectMenu
                        value={billingPeriod}
                        onValueChange={setBillingPeriod}
                        options={billingOptions}
                        placeholder="Select billing period"
                    />
                </section>

                {/* Dropdown Menu Demo */}
                <section className="component-demo">
                    <h2>Dropdown Menu</h2>
                    <Dropdown items={dropdownItems} />
                </section>

                {/* Dialog Demo */}
                <section className="component-demo">
                    <h2>Dialog</h2>
                    <Modal
                        trigger={<button className="button">Open Dialog</button>}
                        title="Edit Profile"
                        description="Make changes to your profile here. Click save when you're done."
                        primaryAction={<button className="button">Save changes</button>}
                        secondaryAction={<button className="button secondary">Cancel</button>}
                    >
                        <fieldset className="dialog-fieldset">
                            <label htmlFor="name">Name</label>
                            <input id="name" defaultValue="Pedro Duarte" />
                        </fieldset>
                    </Modal>
                </section>

                {/* Avatar Demo */}
                <section className="component-demo">
                    <h2>Avatar</h2>
                    <UserAvatar
                        src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                        alt="Colm Tuite"
                        fallback="CT"
                    />
                </section>

                {/* Toast Demo */}
                <section className="component-demo">
                    <h2>Toast</h2>
                    <button
                        className="button"
                        onClick={() => setShowToast(true)}
                    >
                        Show Toast
                    </button>

                    <ToastNotification
                        open={showToast}
                        onOpenChange={setShowToast}
                        title="Scheduled: Catch up"
                        description="Wednesday, January 3rd at 9:00 AM"
                        action={<button className="toast-action">Undo</button>}
                    />
                </section>
            </div>

            <style>{`
        ${componentStyles}

        .home {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .components-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .component-demo {
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
        }

        .component-demo h2 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .button {
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

        .button:hover {
          border-color: #000;
        }

        .button.secondary {
          background: white;
          border-color: #e5e7eb;
        }

        .button.secondary:hover {
          border-color: #000;
        }

        .dialog-fieldset {
          display: flex;
          gap: 20px;
          align-items: center;
          margin-bottom: 15px;
        }

        .toast-action {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toast-action:hover {
          border-color: #000;
        }
      `}</style>
        </div>
    );
} 