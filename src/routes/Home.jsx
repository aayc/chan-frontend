import React, { useState } from 'react';
import { Link } from 'react-router';
import { Dropdown } from '../components/Dropdown';
import { Modal } from '../components/Dialog';
import { UserAvatar } from '../components/Avatar';
import { ToastNotification } from '../components/Toast';
import { SelectMenu } from '../components/Select';

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
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900">Radix UI Components Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {/* Ledger Link */}
        <section className="p-6 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Finance</h2>
          <Link
            to="/ledger"
            className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 font-medium hover:border-gray-900 transition-colors duration-200"
          >
            <span className="text-xl">📊</span>
            <span>Open Finance Dashboard</span>
          </Link>
        </section>

        {/* Billing Period Select */}
        <section className="p-6 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Period</h2>
          <SelectMenu
            value={billingPeriod}
            onValueChange={setBillingPeriod}
            options={billingOptions}
            placeholder="Select billing period"
          />
        </section>

        {/* Dropdown Menu Demo */}
        <section className="p-6 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dropdown Menu</h2>
          <Dropdown items={dropdownItems} />
        </section>

        {/* Dialog Demo */}
        <section className="p-6 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dialog</h2>
          <Modal
            trigger={
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 hover:border-gray-900 transition-colors duration-200">
                Open Dialog
              </button>
            }
            title="Edit Profile"
            description="Make changes to your profile here. Click save when you're done."
            primaryAction={
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 hover:border-gray-900 transition-colors duration-200">
                Save changes
              </button>
            }
            secondaryAction={
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 hover:border-gray-900 transition-colors duration-200">
                Cancel
              </button>
            }
          >
            <fieldset className="flex gap-5 items-center mb-4">
              <label htmlFor="name" className="text-gray-700">Name</label>
              <input
                id="name"
                defaultValue="Pedro Duarte"
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
              />
            </fieldset>
          </Modal>
        </section>

        {/* Avatar Demo */}
        <section className="p-6 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Avatar</h2>
          <UserAvatar
            src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
            alt="Colm Tuite"
            fallback="CT"
          />
        </section>

        {/* Toast Demo */}
        <section className="p-6 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Toast</h2>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 hover:border-gray-900 transition-colors duration-200"
            onClick={() => setShowToast(true)}
          >
            Show Toast
          </button>

          <ToastNotification
            open={showToast}
            onOpenChange={setShowToast}
            title="Scheduled: Catch up"
            description="Wednesday, January 3rd at 9:00 AM"
            action={
              <button className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:border-gray-900 transition-colors duration-200">
                Undo
              </button>
            }
          />
        </section>
      </div>
    </div>
  );
} 