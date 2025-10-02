import React from "react";

type OTRules = {
  daily_cap_hours: number;
  allow_weekend_ot: boolean;
  default_setup_min: number;
  default_buffer_min: number;
};

type Props = {
  otRules: OTRules | null;
  setOTRules: React.Dispatch<React.SetStateAction<OTRules | null>>;
  isEditing: boolean;
  toBool: (val: string) => boolean;
};

/* ---- table styles (รองรับ dark) ---- */
const inputBase =
  "w-full rounded-md border px-2 py-1 text-sm " +
  "bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 " +
  "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 " +
  "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-700 " +
  "dark:focus:ring-sky-500/40 dark:focus:border-sky-500";

const OTCard: React.FC<Props> = ({
  otRules,
  setOTRules,
  isEditing,
  toBool,
}) => {
  // ป้องกัน otRules เป็น null
  if (!otRules) {
    return <p>Loading OT rules...</p>;
  }

  return (
    <section
      id="ot"
      className="scroll-mt-24 mt-4 rounded-2xl border p-4 shadow-sm
                 bg-white border-slate-200
                 dark:bg-slate-900 dark:border-slate-700"
    >
      <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        OT Rules / Setup Time / Buffer
      </h2>

      <fieldset
        disabled={!isEditing}
        className={!isEditing ? "select-none opacity-80" : ""}
      >
        {/* ---- Rules Form ---- */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3">
            <span className="w-48 text-sm text-slate-700 dark:text-slate-300">
              OT Daily Cap (hours)
            </span>
            <input
              type="number"
              min={0}
              step={0.5}
              className={`${inputBase} w-32`}
              value={otRules.daily_cap_hours}
              onChange={(e) =>
                setOTRules({
                  ...otRules,
                  daily_cap_hours: Number(e.target.value) || 0,
                })
              }
            />
          </label>

          <label className="flex items-center gap-3">
            <span className="w-48 text-sm text-slate-700 dark:text-slate-300">
              Allow Weekend OT
            </span>
            <select
              className={`${inputBase} w-40`}
              value={String(otRules.allow_weekend_ot)}
              onChange={(e) =>
                setOTRules({
                  ...otRules,
                  allow_weekend_ot: toBool(e.target.value),
                })
              }
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="flex items-center gap-3">
            <span className="w-48 text-sm text-slate-700 dark:text-slate-300">
              Default Setup (min)
            </span>
            <input
              type="number"
              min={0}
              step={1}
              className={`${inputBase} w-32`}
              value={otRules.default_setup_min}
              onChange={(e) =>
                setOTRules({
                  ...otRules,
                  default_setup_min: Number(e.target.value) || 0,
                })
              }
            />
          </label>

          <label className="flex items-center gap-3">
            <span className="w-48 text-sm text-slate-700 dark:text-slate-300">
              Default Buffer before Due (min)
            </span>
            <input
              type="number"
              min={0}
              step={5}
              className={`${inputBase} w-32`}
              value={otRules.default_buffer_min}
              onChange={(e) =>
                setOTRules({
                  ...otRules,
                  default_buffer_min: Number(e.target.value) || 0,
                })
              }
            />
          </label>
        </div>       
      </fieldset>
    </section>
  );
};

export default OTCard;
