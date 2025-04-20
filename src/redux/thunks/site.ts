import { AppThunk } from "../store.ts";
import { getSiteConfig } from "../../api/api.ts";
import { applySetting } from "../siteConfigSlice.ts";
import SessionManager from "../../session";

export function loadSiteConfig(section: string): AppThunk {
  return async (dispatch, _getState) => {
    const siteConfig = await dispatch(getSiteConfig(section));
    dispatch(
      applySetting({
        section: section,
        config: siteConfig,
      }),
    );
    localStorage.setItem(
      `siteConfigCache_${section}`,
      JSON.stringify(siteConfig),
    );
  };
}

export function updateSiteConfig(): AppThunk {
  return async (dispatch, getState) => {
    await dispatch(loadSiteConfig("basic"));
    const {
      siteConfig: { basic },
    } = getState();
    if (basic.config.user) {
      SessionManager.updateUserIfExist(basic.config.user);
    }
  };
}
