// components/SettingsModal.tsx
"use client";

import React, { useState } from 'react';
import BaseModal from '@/src/components/shared/modal/BaseModal';

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  config?: {
    type: string;
    url: string;
    auth: {
      type: string;
      key?: string;
      user?: string;
      pass?: string;
      cid?: string;
      csecret?: string;
    };
  };
  title?: string;
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  config,
  title = 'Settings',
}) => {
  const [connType, setConnType] = useState(config?.type || 'rest');
  const [baseUrl, setBaseUrl] = useState(config?.url || '');
  const [authType, setAuthType] = useState(config?.auth?.type || 'apikey');
  const [apiKey, setApiKey] = useState(config?.auth?.key || '');
  const [testResult, setTestResult] = useState('');

  const handleTestConnection = () => {
    setTestResult('Testing...');
    setTimeout(() => {
      setTestResult('✅ Connection successful');
    }, 1000);
  };

  const handleSubmit = () => {
    const payload = {
      type: connType,
      url: baseUrl,
      auth: {
        type: authType,
        key: apiKey,
      },
    };
    onSave(payload);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSubmit}
      title={title}
      footer
      size="md"
    >
      <div className="grid gap-4">
        {/* Connection Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Connection Type</label>
          <select
            value={connType}
            onChange={(e) => setConnType(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="rest">REST API</option>
            <option value="soap">SOAP</option>
            <option value="webhook">Webhook</option>
          </select>
        </div>

        {/* Base URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Base URL / Endpoint</label>
          <input
            type="text"
            placeholder="https://api.vendor.com/v1"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Authentication Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Authentication Method</label>
          <select
            value={authType}
            onChange={(e) => setAuthType(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="apikey">API Key</option>
            <option value="basic">Basic Auth</option>
            <option value="oauth2">OAuth2</option>
          </select>
        </div>

        {/* Auth Details */}
        {authType === 'apikey' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">API Key</label>
            <input
              type="text"
              placeholder="x-api-key: ..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}

        {/* Test Connection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Test Connection</label>
          <div className="flex gap-2 items-center mt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              className="px-3 py-1.5 bg-gray-200 rounded-md text-sm"
            >
              Test
            </button>
            <span className="text-sm text-gray-600">{testResult}</span>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default SettingsModal;
