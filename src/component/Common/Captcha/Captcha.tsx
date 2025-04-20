import { useAppSelector } from "../../../redux/hooks.ts";
import { CaptchaType } from "../../../api/site.ts";
import DefaultCaptcha from "./DefaultCaptcha.tsx";
import ReCaptchaV2 from "./ReCaptchaV2.tsx";
import TurnstileCaptcha from "./TurnstileCaptcha.tsx";

export interface CaptchaProps {
  onStateChange: (state: CaptchaParams) => void;
  generation: number;
  [x: string]: any;
}

export interface CaptchaParams {
  [x: string]: any;
}

export const Captcha = (props: CaptchaProps) => {
  const captchaType = useAppSelector(
    (state) => state.siteConfig.basic.config.captcha_type,
  );

  // const recaptcha = useRecaptcha(setCaptchaLoading);
  // const tcaptcha = useTCaptcha(setCaptchaLoading);

  switch (captchaType) {
    case CaptchaType.RECAPTCHA:
      return <ReCaptchaV2 {...props} />;
    case CaptchaType.TURNSTILE:
      return <TurnstileCaptcha {...props} />;
    // case "tcaptcha":
    //   return { ...tcaptcha, captchaRefreshRef, captchaLoading };
    default:
      return <DefaultCaptcha {...props} />;
  }
};
