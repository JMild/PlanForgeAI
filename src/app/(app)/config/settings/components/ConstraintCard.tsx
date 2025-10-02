import React from "react";

type Constraints = {
  enforce_maintenance: boolean;
  enforce_material_ready: boolean;
  material_ready_offset_min: number;
  freeze_window_min: number;
};

type Props = {
  constraints: Constraints | null;
  setConstraints: React.Dispatch<React.SetStateAction<Constraints | null>>;
  isEditing: boolean;
  toBool: (val: string) => boolean;
};

const inputBase =
  "rounded-md border px-3 py-1 text-sm w-40 " +
  "bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 " +
  "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 " +
  "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-700 " +
  "dark:focus:ring-sky-500/40 dark:focus:border-sky-500";

const numBase =
  "rounded-md border px-3 py-1 text-sm w-32 " +
  "bg-white text-slate-900 border-slate-300 " +
  "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 " +
  "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 " +
  "dark:focus:ring-sky-500/40 dark:focus:border-sky-500";

const ConstraintCard: React.FC<Props> = ({
  constraints,
  setConstraints,
  isEditing,
  toBool,
}) => {
  if (!constraints) {
    return <p>Loading constraints...</p>;
  }

  // ฟังก์ชันช่วยแปลงตัวเลขอย่างปลอดภัย
  const parseNumber = (value: string, fallback = 0) => {
    const n = Number(value);
    return isNaN(n) || n < 0 ? fallback : n;
  };

  return (
    <section
      id="constraints"
      className="scroll-mt-24 mt-4 rounded-2xl border p-4 shadow-sm
                 bg-white border-slate-200
                 dark:bg-slate-900 dark:border-slate-700"
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Constraints (Maintenance, Material Ready)
      </h2>

      <fieldset
        disabled={!isEditing}
        className={!isEditing ? "select-none opacity-80" : ""}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3">
            <span className="w-56 text-sm text-slate-700 dark:text-slate-300">
              Enforce Maintenance Windows
            </span>
            <select
              className={inputBase}
              value={String(constraints.enforce_maintenance)}
              onChange={(e) =>
                setConstraints({
                  ...constraints,
                  enforce_maintenance: toBool(e.target.value),
                })
              }
              disabled={!isEditing}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="flex items-center gap-3">
            <span className="w-56 text-sm text-slate-700 dark:text-slate-300">
              Enforce Material Ready
            </span>
            <select
              className={inputBase}
              value={String(constraints.enforce_material_ready)}
              onChange={(e) =>
                setConstraints({
                  ...constraints,
                  enforce_material_ready: toBool(e.target.value),
                })
              }
              disabled={!isEditing}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="flex items-center gap-3">
            <span className="w-56 text-sm text-slate-700 dark:text-slate-300">
              Material Ready Offset (min)
            </span>
            <input
              type="number"
              min={0}
              step={5}
              className={numBase}
              value={constraints.material_ready_offset_min}
              onChange={(e) =>
                setConstraints({
                  ...constraints,
                  material_ready_offset_min: parseNumber(e.target.value),
                })
              }
              disabled={!isEditing}
            />
          </label>

          <label className="flex items-center gap-3">
            <span className="w-56 text-sm text-slate-700 dark:text-slate-300">
              Freeze Window (min)
            </span>
            <input
              type="number"
              min={0}
              step={5}
              className={numBase}
              value={constraints.freeze_window_min}
              onChange={(e) =>
                setConstraints({
                  ...constraints,
                  freeze_window_min: parseNumber(e.target.value),
                })
              }
              disabled={!isEditing}
            />
          </label>
        </div>
      </fieldset>
    </section>
  );
};

export default ConstraintCard;
