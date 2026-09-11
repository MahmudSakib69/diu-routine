/** URL-safe id for values like "1111(LAB)", "65A(SCM)" or "Dr. Al Amin". */
export function slug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
