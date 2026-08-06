/**
 * Slugify a project name for use in filenames and URLs.
 *
 * - Lowercase
 * - Replace whitespace runs with a single dash
 * - Strip characters unsafe in filenames or URLs
 * - Collapse consecutive dashes
 * - Trim leading/trailing dashes
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
