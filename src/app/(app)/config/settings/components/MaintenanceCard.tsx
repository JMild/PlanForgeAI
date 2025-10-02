import React from "react";
import { Trash2 } from "lucide-react";

interface MaintWin {
  machine_id: string;
  start_dt: string;
  end_dt: string;
  type: "PM" | "Unplanned";
  note: string;
}

interface Props {
  maint: MaintWin[];
  setMaint: (data: MaintWin[]) => void;
  isEditing: boolean;
}

/* ---- table styles (รองรับ light/dark) ---- */
const th =
  "px-4 py-2 text-left text-xs font-semibold " +
  "text-slate-700 border-b border-slate-200 " +
  "dark:text-slate-300 dark:border-slate-700";

const cell =
  "px-4 py-2 border-b border-slate-100 " +
  "dark:border-slate-700";

const rowBase =
  "transition hover:bg-blue-50 even:bg-white odd:bg-slate-50 " +
  "dark:hover:bg-slate-800/70 dark:even:bg-slate-900 dark:odd:bg-slate-800";

const inputBase =
  "w-full rounded-md border px-2 py-1 text-sm " +
  "bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 " +
  "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 " +
  "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-700 " +
  "dark:focus:ring-sky-500/40 dark:focus:border-sky-500";

const MaintenanceCard: React.FC<Props> = ({ maint, setMaint, isEditing }) => {
  const addEmptyRow = () => {
    setMaint([
      ...maint,
      { machine_id: "", start_dt: "", end_dt: "", type: "PM", note: "" },
    ]);
  };

  return (
    <section
      id="maint"
      className="scroll-mt-24 mt-4 rounded-2xl border p-4 shadow-sm
                 bg-white border-slate-200
                 dark:bg-slate-900 dark:border-slate-700"
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Maintenance Windows
      </h2>

      <fieldset
        disabled={!isEditing}
        className={!isEditing ? "select-none opacity-80" : ""}
      >
        <div className="overflow-auto rounded-md border border-slate-200 dark:border-slate-700">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className={`${th} w-32`}>Machine ID</th>
                <th className={`${th} w-56`}>Start</th>
                <th className={`${th} w-56`}>End</th>
                <th className={`${th} w-40`}>Type</th>
                <th className={th}>Note</th>
                {isEditing && <th className={`${th} w-10 text-center`} />}
              </tr>
            </thead>
            <tbody>
              {maint.map((m, i) => (
                <tr key={i} className={rowBase}>
                  <td className={cell}>
                    <input
                      className={inputBase}
                      placeholder="M1"
                      value={m.machine_id}
                      onChange={(e) =>
                        setMaint(
                          maint.map((x, j) =>
                            j === i ? { ...x, machine_id: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>

                  <td className={cell}>
                    <input
                      type="datetime-local"
                      className={inputBase}
                      value={m.start_dt}
                      onChange={(e) =>
                        setMaint(
                          maint.map((x, j) =>
                            j === i ? { ...x, start_dt: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>

                  <td className={cell}>
                    <input
                      type="datetime-local"
                      className={inputBase}
                      value={m.end_dt}
                      onChange={(e) =>
                        setMaint(
                          maint.map((x, j) =>
                            j === i ? { ...x, end_dt: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>

                  <td className={cell}>
                    <select
                      className={inputBase}
                      value={m.type}
                      onChange={(e) =>
                        setMaint(
                          maint.map((x, j) =>
                            j === i
                              ? { ...x, type: e.target.value as MaintWin["type"] }
                              : x
                          )
                        )
                      }
                    >
                      <option value="PM">PM</option>
                      <option value="Unplanned">Unplanned</option>
                    </select>
                  </td>

                  <td className={cell}>
                    <input
                      className={inputBase}
                      placeholder="note"
                      value={m.note}
                      onChange={(e) =>
                        setMaint(
                          maint.map((x, j) =>
                            j === i ? { ...x, note: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>

                  {isEditing && (
                    <td className={`${cell} text-center`}>
                      <button
                        onClick={() =>
                          setMaint(maint.filter((_, j) => j !== i))
                        }
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
                  <td colSpan={6} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={addEmptyRow}
                      className="inline-flex items-center gap-1 text-sm font-medium
                                 text-blue-600 hover:text-blue-700
                                 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      + Add Maintenance Window
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

export default MaintenanceCard;
