export const cn = (...a: Array<string | false | undefined>) => a.filter(Boolean).join(" ");

export const cls = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");