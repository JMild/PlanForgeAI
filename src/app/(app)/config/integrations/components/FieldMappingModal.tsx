'use client';

import React, { useState } from 'react';
import BaseModal from '@/src/components/shared/modal/BaseModal';
import * as fuzz from 'fuzzball';

// ---------- TYPES ----------

type MappingDirection = 'in' | 'out' | 'bi';

type FieldMapping = {
  id: string;
  local: string;
  external: string;
  dir: MappingDirection;
};

type FieldMappingModalProps = {
  initialMapping?: FieldMapping[];
  onSave: (mapping: FieldMapping[]) => void;
  onClose: () => void;
  isOpen: boolean;
  title: string;
};

// ---------- COMPONENT ----------

const FieldMappingModal: React.FC<FieldMappingModalProps> = ({
  initialMapping = [],
  onSave,
  onClose,
  isOpen,
  title,
}) => {
  const [mapping, setMapping] = useState<FieldMapping[]>(initialMapping);

  const localFields = ['item_code', 'stock_qty', 'price'];
  const externalFields = ['sku', 'quantity_on_hand', 'cost', 'inventory', 'item_id', 'unit_price'];

  const handleAIGenerate = () => {
    const autoMapping: FieldMapping[] = localFields.map((local, index) => {
      const [bestMatch] = fuzz.extract(local, externalFields, {
        scorer: fuzz.ratio,
        returnObjects: true,
      });

      return {
        id: (index + 1).toString(),
        local,
        external: bestMatch?.choice || '',
        dir: 'in',
      };
    });

    setMapping(autoMapping);
  };

  const handleChangeMapping = (
    index: number,
    key: keyof FieldMapping,
    value: string
  ) => {
    const newMapping = [...mapping];

    if (key === 'dir') {
      newMapping[index][key] = value as MappingDirection; 
    } else {
      newMapping[index][key] = value;
    }
    setMapping(newMapping);
  };

  const addMappingRow = () => {
    setMapping([
      ...mapping,
      {
        id: Date.now().toString(),
        local: '',
        external: '',
        dir: 'in',
      },
    ]);
  };

  const removeMappingRow = (index: number) => {
    const newMapping = mapping.filter((_, i) => i !== index);
    setMapping(newMapping);
  };

  const handleSubmit = () => {
    onSave(mapping);
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
      <div className="mb-4">
        <button
          onClick={handleAIGenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          type="button"
        >
          Generate Mapping ด้วย AI
        </button>
      </div>

      <table className="w-full border border-gray-300 mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Local Field</th>
            <th className="p-2 border">External Field</th>
            <th className="p-2 border">Direction</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mapping.map((m, i) => {
            const localOptions = localFields
              .map((field) => ({
                field,
                score: m.external ? fuzz.ratio(field, m.external) : 0,
              }))
              .sort((a, b) => b.score - a.score);

            const externalOptions = externalFields
              .map((field) => ({
                field,
                score: m.local ? fuzz.ratio(field, m.local) : 0,
              }))
              .sort((a, b) => b.score - a.score);

            return (
              <tr key={m.id}>
                <td className="p-2 border">
                  <select
                    value={m.local}
                    onChange={(e) => handleChangeMapping(i, 'local', e.target.value)}
                    className="w-full border rounded px-1 py-1"
                  >
                    <option value="">-- เลือก Local Field --</option>
                    {localOptions.map(({ field }) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-2 border">
                  <select
                    value={m.external}
                    onChange={(e) => handleChangeMapping(i, 'external', e.target.value)}
                    className="w-full border rounded px-1 py-1"
                  >
                    <option value="">-- เลือก External Field --</option>
                    {externalOptions.map(({ field }) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-2 border">
                  <select
                    value={m.dir}
                    onChange={(e) => handleChangeMapping(i, 'dir', e.target.value)}
                    className="w-full border rounded px-1 py-1"
                  >
                    <option value="in">→ In</option>
                    <option value="out">← Out</option>
                    <option value="bi">↔ Bi-directional</option>
                  </select>
                </td>

                <td className="p-2 border text-center">
                  <button
                    type="button"
                    onClick={() => removeMappingRow(i)}
                    className="text-red-600 hover:underline"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        type="button"
        onClick={addMappingRow}
        className="mb-4 text-sm text-sky-600 hover:underline"
      >
        + เพิ่มแถวใหม่
      </button>
    </BaseModal>
  );
};

export default FieldMappingModal;