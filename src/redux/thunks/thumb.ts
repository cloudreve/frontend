import { AppThunk } from "../store.ts";
import { getThumbExts } from "../../api/api.ts";

// --- Cached supported thumbnail extensions helpers ---
let __thumbExtsCache: Set<string> | null | undefined = undefined; // undefined: not fetched, null: unknown/fallback

// Get supported thumbnail file extensions by reading enabled generators' settings
export function getSupportedThumbExts(): AppThunk<Promise<string[]>> {
  return async (dispatch, _getState) => {
    // Read from new site config endpoint; fallback to empty list.
    try {
      const remote = await dispatch(getThumbExts());
      const list = remote?.thumb_exts ?? [];
      return Array.isArray(list) ? list : [];
    } catch (_e) {
      // Treat as unsupported when not available
      return [];
    }
  };
}

// Prime cache once per page. Safe to call multiple times.
export function primeThumbExtsCache(): AppThunk<Promise<void>> {
  return async (dispatch, _getState) => {
    if (__thumbExtsCache !== undefined) return;
    try {
      const exts = await dispatch(getSupportedThumbExts());
      __thumbExtsCache = new Set(exts.map((e) => e.toLowerCase()));
    } catch (_e) {
      // Mark as unknown to fall back to legacy behavior
      __thumbExtsCache = null;
    }
  };
}

export function getCachedThumbExts(): Set<string> | null | undefined {
  return __thumbExtsCache;
}

// Check if a file name is likely supported based on cached exts
// Returns undefined if cache is not ready (treat as supported by caller).
export function isThumbExtSupportedSync(fileName: string): boolean | undefined {
  const cache = __thumbExtsCache;
  if (cache === undefined) return undefined;
  if (cache === null) return true; // unknown => allow
  const idx = fileName.lastIndexOf(".");
  const ext = idx >= 0 ? fileName.substring(idx + 1).toLowerCase() : "";
  if (!ext) return false;
  return cache.has(ext);
}
