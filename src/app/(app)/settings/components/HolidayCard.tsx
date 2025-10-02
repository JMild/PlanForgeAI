import React from "react";
import { Trash2 } from "lucide-react";

type Holiday = {
  start_date: string;
  end_date: string;
  description: string;
  is_recurring: boolean;
};

type HolidayCardProps = {
  holidays: Holiday[];
  setHolidays: React.Dispatch<React.SetStateAction<Holiday[]>>;
  isEditing: boolean;
};

function toBool(value: string): boolean {
  return value === "true";
}

const HolidayCard: React.FC<HolidayCardProps> = ({
  holidays,
  setHolidays,
  isEditing,
}) => {
  const addEmptyRow = () => {
    setHolidays([
      ...holidays,
      { start_date: "", end_date: "", description: "", is_recurring: false },
    ]);
  };

  const removeRow = (index: number) => {
    setHolidays(holidays.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, updated: Partial<Holiday>) => {
    setHolidays(holidays.map((h, i) => (i === index ? { ...h, ...updated } : h)));
  };

  return (
    <section className="scroll-mt-24 rounded-2xl border p-4 shadow-sm
                        bg-white border-slate-200
                        dark:bg-slate-900 dark:border-slate-700">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Calendar / Holidays
        </h2>
        <span className="rounded-full border px-2 py-0.5 text-xs
                         bg-slate-50 text-slate-600 border-slate-200
                         dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          {isEditing ? "Editing" : "Read-only"}
        </span>
      </div>

      <fieldset
        disabled={!isEditing}
        className={!isEditing ? "select-none opacity-80" : ""}
      >
        <div className="overflow-auto rounded-md border
                        border-slate-200 dark:border-slate-700">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-xs text-slate-700
                               dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="w-40 border-b px-4 py-2
                               border-slate-200 dark:border-slate-700">
                  Holiday Name
                </th>
                <th className="w-40 border-b px-4 py-2
                               border-slate-200 dark:border-slate-700">
                  End Date
                </th>
                <th className="border-b px-4 py-2
                               border-slate-200 dark:border-slate-700">
                  Start Date
                </th>
                <th className="w-32 border-b px-4 py-2
                               border-slate-200 dark:border-slate-700">
                  Recurring
                </th>
                {isEditing && (
                  <th className="w-10 border-b px-4 py-2 text-center
                                 border-slate-200 dark:border-slate-700"></th>
                )}
              </tr>
            </thead>

            <tbody>
              {holidays.map((holiday, index) => (
                <tr
                  key={index}
                  className="transition
                             odd:bg-slate-50 even:bg-white hover:bg-blue-50
                             dark:odd:bg-slate-800 dark:even:bg-slate-900 dark:hover:bg-slate-800/70"
                >
                  <td className="border-b px-4 py-2
                                 border-slate-100 dark:border-slate-700">
                    <input
                      type="text"
                      value={holiday.description}
                      placeholder="holidays name"
                      onChange={(e) => updateRow(index, { description: e.target.value })}
                      className="w-full rounded-md border px-2 py-1 text-sm
                                 bg-white text-slate-900 placeholder:text-slate-400 border-slate-300
                                 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500
                                 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-700
                                 dark:focus:ring-sky-500/40 dark:focus:border-sky-500"
                    />
                  </td>
                  <td className="border-b px-4 py-2
                                 border-slate-100 dark:border-slate-700">
                    <input
                      type="date"
                      value={holiday.start_date}
                      onChange={(e) => updateRow(index, { start_date: e.target.value })}
                      className="w-full rounded-md border px-2 py-1 text-sm
                                 bg-white text-slate-900 border-slate-300
                                 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500
                                 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700
                                 dark:focus:ring-sky-500/40 dark:focus:border-sky-500"
                    />
                  </td>

                  <td className="border-b px-4 py-2
                                 border-slate-100 dark:border-slate-700">
                    <input
                      type="date"
                      value={holiday.end_date}
                      onChange={(e) => updateRow(index, { end_date: e.target.value })}
                      className="w-full rounded-md border px-2 py-1 text-sm
                                 bg-white text-slate-900 border-slate-300
                                 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500
                                 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700
                                 dark:focus:ring-sky-500/40 dark:focus:border-sky-500"
                    />
                  </td>

                  

                  <td className="border-b px-4 py-2
                                 border-slate-100 dark:border-slate-700">
                    <select
                      value={String(holiday.is_recurring)}
                      onChange={(e) =>
                        updateRow(index, { is_recurring: toBool(e.target.value) })
                      }
                      className="w-full rounded-md border px-2 py-1 text-sm
                                 bg-white text-slate-900 border-slate-300
                                 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500
                                 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700
                                 dark:focus:ring-sky-500/40 dark:focus:border-sky-500"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </td>

                  {isEditing && (
                    <td className="border-b px-2 py-2 text-center
                                   border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => removeRow(index)}
                        className="p-1 text-rose-600 hover:text-rose-700 focus:outline-none
                                   dark:text-rose-400 dark:hover:text-rose-300"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {isEditing && (
                <tr className="dark:bg-slate-900">
                  <td colSpan={5} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={addEmptyRow}
                      className="inline-flex items-center gap-1 text-sm font-medium
                                 text-blue-600 hover:text-blue-700
                                 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      + Add Holiday
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </fieldset>
    </section>
  );
};

export default HolidayCard;
