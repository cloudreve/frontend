import i18next from "i18next";
import { getUserInfo } from "../../api/api.ts";
import { LoginResponse, User } from "../../api/user.ts";
import { router } from "../../router";
import SessionManager, { UserSettings } from "../../session";
import { refreshTimeZone } from "../../util/datetime.ts";
import { clearSessionCache } from "../fileManagerSlice.ts";
import {
  setDarkMode,
  setDrawerWidth,
  setPolicyOptionCache,
  setPreferredTheme,
  setUserInfoCache,
} from "../globalStateSlice.ts";
import { AppThunk } from "../store.ts";
import { updateSiteConfig } from "./site.ts";

export function refreshUserSession(session: LoginResponse, redirect: string | null): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(setTargetSession(session));
    dispatch(updateSiteConfig());

    if (redirect) {
      router.navigate(redirect);
    } else {
      router.navigate("/home");
    }
  };
}

export function setTargetSession(session: LoginResponse): AppThunk {
  return async (dispatch, _getState) => {
    SessionManager.upsert(session);
    dispatch(setPreferredTheme(session.user.preferred_theme ?? ""));
    if (session.user.language) {
      i18next.changeLanguage(session.user.language);
    }
    dispatch(setDrawerWidth(SessionManager.getWithFallback(UserSettings.DrawerWidth)));
    dispatch(setDarkMode(SessionManager.get(UserSettings.PreferredDarkMode)));
    // TODO: clear fm cache
    dispatch(setPolicyOptionCache());
    dispatch(clearSessionCache({ index: 0, value: undefined }));
    refreshTimeZone();
  };
}

export function loadUserInfo(uid: string): AppThunk<Promise<User>> {
  return async (dispatch, getState) => {
    const userInfoCache = getState().globalState.userInfoCache;
    if (userInfoCache[uid]) {
      return userInfoCache[uid];
    }

    const user = await dispatch(getUserInfo(uid));
    dispatch(setUserInfoCache([uid, user]));
    return user;
  };
}
