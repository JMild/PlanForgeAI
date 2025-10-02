import { Trash2 } from "lucide-react";
import React, { useCallback } from "react";

type Shift = {
  shift_name: string;
  start_time: string;
  end_time: string;
};

type Break = {
  break_name: string;
  start_time: string;
  end_time: string;
};

type Props = {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  breaks: Break[];
  setBreaks: React.Dispatch<React.SetStateAction<Break[]>>;
  isEditing: boolean;
};

/* ----- table cell styles (รองรับ dark) ----- */
const th =
  "px-4 py-2 text-left text-xs font-semibold " +
  "text-slate-700 border-b border-slate-200 " +
  "dark:text-slate-300 dark:border-slate-700";

const cell =
  "px-4 py-2 border-b border-slate-100 " +
  "dark:border-slate-700";

const inputBase =
  "w-full rounded-md border px-2 py-1 text-sm " +
  "bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 " +
  "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 " +
  "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-700 " +
  "dark:focus:ring-sky-500/40 dark:focus:border-sky-500";

const rowBase =
  "transition hover:bg-blue-50 even:bg-white odd:bg-slate-50 " +
  "dark:hover:bg-slate-800/70 dark:even:bg-slate-900 dark:odd:bg-slate-800";

const ShiftBreakCard: React.FC<Props> = ({
  shifts,
  setShifts,
  breaks,
  setBreaks,
  isEditing,
}) => {
  // Shift handlers
  const addShiftRow = useCallback(() => {
    setShifts((prev) => [
      ...prev,
      { shift_name: "", start_time: "08:00", end_time: "17:00" },
    ]);
  }, [setShifts]);

  const removeShiftRow = useCallback(
    (index: number) => {
      setShifts((prev) => prev.filter((_, i) => i !== index));
    },
    [setShifts]
  );

  const updateShiftRow = useCallback(
    (index: number, updated: Partial<Shift>) => {
      setShifts((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...updated } : s))
      );
    },
    [setShifts]
  );

  // Break handlers
  const addBreakRow = useCallback(() => {
    setBreaks((prev) => [
      ...prev,
      { break_name: "", start_time: "12:00", end_time: "13:00" },
    ]);
  }, [setBreaks]);

  const removeBreakRow = useCallback(
    (index: number) => {
      setBreaks((prev) => prev.filter((_, i) => i !== index));
    },
    [setBreaks]
  );

  const updateBreakRow = useCallback(
    (index: number, updated: Partial<Break>) => {
      setBreaks((prev) =>
        prev.map((b, i) => (i === index ? { ...b, ...updated } : b))
      );
    },
    [setBreaks]
  );

  return (
    <section
      className="scroll-mt-24 mt-4 rounded-2xl border p-4 shadow-sm
                 bg-white border-slate-200
                 dark:bg-slate-900 dark:border-slate-700"
    >
      <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Shifts & Breaks
      </h2>

      <fieldset
        disabled={!isEditing}
        className={!isEditing ? "select-none opacity-80" : ""}
      >
        {/* Shifts Table */}
        <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Shifts
        </h3>
        <div className="overflow-auto rounded-md border border-slate-200 dark:border-slate-700">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 text-xs dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className={`${th} w-36`}>Shift Name</th>
                <th className={`${th} w-40`}>Start Time</th>
                <th className={`${th} w-40`}>End Time</th>
                {isEditing && (
                  <th className={`${th} w-10 text-center`}></th>
                )} 
              </tr>
            </thead>
            <tbody>
              {shifts.map((s, i) => (
                <tr key={i} className={rowBase}>
                  <td className={cell}>
                    <input
                      type="text"
                      className={inputBase}
                      placeholder="shifts name"
                      value={s.shift_name}
                      onChange={(e) => updateShiftRow(i, { shift_name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="time"
                      className={inputBase}
                      value={s.start_time}
                      onChange={(e) => updateShiftRow(i, { start_time: e.target.value })}
                      disabled={!isEditing}
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="time"
                      className={inputBase}
                      value={s.end_time}
                      onChange={(e) => updateShiftRow(i, { end_time: e.target.value })}
                      disabled={!isEditing}
                    />
                  </td>
                  {/* <td className={cell}>
                    <input
                      type="text"
                      className={inputBase}
                      placeholder="Assembly,Packing"
                      value={s.lines.join(",")}
                      onChange={(e) =>
                        updateShiftRow(i, {
                          lines: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      disabled={!isEditing}
                    />
                  </td> */}
                  {isEditing && (
                    <td className={`${cell} text-center`}>
                      <button
                        onClick={() => removeShiftRow(i)}
                        className="p-1 text-rose-600 hover:text-rose-700 focus:outline-none
                                   dark:text-rose-400 dark:hover:text-rose-300"
                        title="Remove"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {isEditing && (
                <tr className="dark:bg-slate-900">
                  <td colSpan={isEditing ? 5 : 4} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={addShiftRow}
                      className="inline-flex items-center gap-1 text-sm font-medium
                                 text-blue-600 hover:text-blue-700
                                 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      + Add Shift
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Breaks Table */}
        <h3 className="mt-6 mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Breaks
        </h3>
        <div
          className="overflow-auto rounded-md border
                     border-slate-200 dark:border-slate-700"
        >
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 text-xs dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className={`${th} w-36`}>Breaks Name</th>
                <th className={`${th} w-40`}>Start Time</th>
                <th className={`${th} w-40`}>End Time</th>
                {isEditing && (
                  <th className={`${th} w-10 text-center`}></th>
                )}
              </tr>
            </thead>
            <tbody>
              {breaks.map((b, i) => (
                <tr key={i} className={rowBase}>
                  <td className={cell}>
                    <input
                      type="text"
                      className={inputBase}
                      placeholder="breaks name"
                      value={b.break_name}
                      onChange={(e) =>
                        updateBreakRow(i, { break_name: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="time"
                      className={inputBase}
                      value={b.start_time}
                      onChange={(e) => updateBreakRow(i, { start_time: e.target.value })}
                      disabled={!isEditing}
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="time"
                      className={inputBase}
                      value={b.end_time}
                      onChange={(e) => updateBreakRow(i, { end_time: e.target.value })}
                      disabled={!isEditing}
                    />
                  </td>
                  {isEditing && (
                    <td className={`${cell} text-center`}>
                      <button
                        onClick={() => removeBreakRow(i)}
                        className="p-1 text-rose-600 hover:text-rose-700 focus:outline-none
                                   dark:text-rose-400 dark:hover:text-rose-300"
                        title="Remove"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {isEditing && (
                <tr className="dark:bg-slate-900">
                  <td colSpan={isEditing ? 4 : 3} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={addBreakRow}
                      className="inline-flex items-center gap-1 text-sm font-medium
                                 text-blue-600 hover:text-blue-700
                                 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      + Add Break
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

export default ShiftBreakCard;
