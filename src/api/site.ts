import { ViewerGroup } from "./explorer.ts";
import { User } from "./user.ts";

export enum CaptchaType {
  NORMAL = "normal",
  RECAPTCHA = "recaptcha",
  // Deprecated
  TCAPTCHA = "tcaptcha",
  TURNSTILE = "turnstile",
  CAP = "cap",
}

export interface SiteConfig {
  instance_id?: string;
  title?: string;
  login_captcha?: boolean;
  reg_captcha?: boolean;
  forget_captcha?: boolean;
  themes?: string;
  default_theme?: string;
  authn?: boolean;
  user?: User;
  captcha_ReCaptchaKey?: string;
  captcha_type?: CaptchaType;
  turnstile_site_id?: string;
  captcha_cap_instance_url?: string;
  captcha_cap_key_id?: string;
  captcha_cap_key_secret?: string;
  register_enabled?: boolean;
  logo?: string;
  logo_light?: string;
  tos_url?: string;
  privacy_policy_url?: string;
  icons?: string;
  emoji_preset?: string;
  map_provider?: string;
  google_map_tile_type?: string;
  file_viewers?: ViewerGroup[];
  max_batch_size?: number;
  app_promotion?: boolean;
  thumbnail_width?: number;
  thumbnail_height?: number;
}

export interface CaptchaResponse {
  ticket: string;
  image: string;
}
