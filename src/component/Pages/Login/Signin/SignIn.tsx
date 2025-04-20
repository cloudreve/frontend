import { ArrowBackIos } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, Button, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { send2FALogin, sendLogin, sendPrepareLogin, sendResetEmail } from "../../../../api/api.ts";
import { AppError, Code } from "../../../../api/request.ts";
import { PrepareLoginResponse } from "../../../../api/user.ts";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { refreshUserSession } from "../../../../redux/thunks/session.ts";
import PageTitle from "../../../../router/PageTitle.tsx";
import { useQuery } from "../../../../util";
import { CaptchaParams } from "../../../Common/Captcha/Captcha.tsx";
import { DefaultCloseAction } from "../../../Common/Snackbar/snackbar.tsx";
import Phase2FA from "../Phases/Phase2FA.tsx";
import PhaseCollectEmail from "../Phases/PhaseCollectEmail.tsx";
import PhaseCollectPassword from "../Phases/PhaseCollectPassword.tsx";
import PhaseForgetPassword from "../Phases/PhaseForgetPassword.tsx";
import PhaseSignupNeeded from "../Phases/PhaseSignupNeeded.tsx";
import "../SideTransition.css";

enum EmailLoginPhase {
  CollectEmail,
  CollectPassword,
  SignupNeeded,
  Collect2FA,
  ForgetPassword,
}

export interface Control {
  submit: JSX.Element;
  back: JSX.Element;
}

interface phaseSetting {
  title: string;
  nextButtonText: string;
  showBackButton: boolean;
  previous?: EmailLoginPhase;
  control?: Control;
}

const EmailLogin = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const query = useQuery();

  const [phase, setPhase] = useState<EmailLoginPhase>(EmailLoginPhase.CollectEmail);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [otp, setOTP] = useState("");
  const [captchaGen, setCaptchaGen] = useState(0);
  const [loading, setLoading] = useState(false);
  const captchaState = useRef<CaptchaParams>();
  const twoFaSession = useRef<string>("");
  const [direction, setDirection] = useState<"left" | "right" | "up" | "down">("right");
  const [loginOptions, setLoginOptions] = useState<PrepareLoginResponse>();

  const prepareLogin = useCallback(async () => {
    try {
      setLoading(true);
      const opts = await dispatch(sendPrepareLogin(email));
      setLoginOptions(opts);
      setPhase(EmailLoginPhase.CollectPassword);
    } catch (e) {
      if (e instanceof AppError && e.code === Code.NodeFound) {
        // User not registered yet, guided to register
        setPhase(EmailLoginPhase.SignupNeeded);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, email, setPhase]);

  const passwordLogin = useCallback(
    async (email: string, password: string, captcha?: CaptchaParams) => {
      try {
        setLoading(true);
        const loginRes = await dispatch(sendLogin({ email, password, ...captcha }));
        dispatch(refreshUserSession(loginRes, query.get("redirect")));
      } catch (e) {
        if (e instanceof AppError && e.code === Code.Continue) {
          twoFaSession.current = e.response.data;
          // User not registered yet, guided to register
          setPhase(EmailLoginPhase.Collect2FA);
        } else {
          setCaptchaGen((g) => g + 1);
        }
      } finally {
        setLoading(false);
      }
    },
    [dispatch, setPhase, setCaptchaGen, setLoading],
  );

  const finish2FA = useCallback(async (otp: string, ticket: string) => {
    try {
      setLoading(true);
      const loginRes = await dispatch(send2FALogin({ otp, session_id: ticket }));
      dispatch(refreshUserSession(loginRes, query.get("redirect")));
    } finally {
      setOTP("");
      setLoading(false);
    }
  }, []);

  const submitSendResetEmail = useCallback(
    async (email: string, captcha?: CaptchaParams) => {
      try {
        setLoading(true);
        await dispatch(sendResetEmail({ email, ...captcha }));
        setPhase(EmailLoginPhase.CollectEmail);
        enqueueSnackbar({
          message: t("login.resetEmailSent"),
          variant: "success",
          action: DefaultCloseAction,
        });
      } catch (e) {
        setCaptchaGen((g) => g + 1);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, setPhase, setCaptchaGen, setLoading],
  );

  const submit = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    switch (phase) {
      case EmailLoginPhase.CollectEmail:
        prepareLogin();
        break;
      case EmailLoginPhase.SignupNeeded:
        navigate(`/session/signup?email=${email}`);
        break;
      case EmailLoginPhase.CollectPassword:
        passwordLogin(email, pwd, captchaState.current);
        break;
      case EmailLoginPhase.Collect2FA:
        finish2FA(otp, twoFaSession.current);
        break;
      case EmailLoginPhase.ForgetPassword:
        submitSendResetEmail(email, captchaState.current);
        break;
    }
  };

  useEffect(() => {
    if (otp.length === 6) {
      submit();
    }
  }, [otp]);

  const phaseConfig = useMemo((): phaseSetting => {
    var phaseSetting: phaseSetting = {
      title: t("login.siginToYourAccount"),
      nextButtonText: t("login.continue"),
      showBackButton: false,
    };
    switch (phase) {
      case EmailLoginPhase.CollectEmail:
        phaseSetting = {
          title: t("login.siginToYourAccount"),
          nextButtonText: t("login.continue"),
          showBackButton: false,
        };
        break;
      case EmailLoginPhase.SignupNeeded:
        phaseSetting = {
          title: t("login.siginToYourAccount"),
          nextButtonText: t("login.signUpAccount"),
          showBackButton: true,
          previous: EmailLoginPhase.CollectEmail,
        };
        break;
      case EmailLoginPhase.CollectPassword:
        phaseSetting = {
          title: t("login.enterPassword"),
          nextButtonText: t("login.signIn"),
          showBackButton: true,
          previous: EmailLoginPhase.CollectEmail,
        };
        break;
      case EmailLoginPhase.Collect2FA:
        phaseSetting = {
          title: t("login.2FA"),
          nextButtonText: t("login.signIn"),
          showBackButton: true,
          previous: EmailLoginPhase.CollectPassword,
        };
        break;
      case EmailLoginPhase.ForgetPassword:
        phaseSetting = {
          title: t("login.resetPassword"),
          nextButtonText: t("login.sendMeAnEmail"),
          showBackButton: true,
          previous: EmailLoginPhase.CollectPassword,
        };
        break;
      default:
        break;
    }
    phaseSetting.control = {
      submit: (
        <LoadingButton sx={{ mt: 2 }} type="submit" fullWidth variant="contained" color="primary" loading={loading}>
          <span>{phaseSetting.nextButtonText}</span>
        </LoadingButton>
      ),
      back: (
        <>
          {phaseSetting.showBackButton && (
            <Button
              startIcon={<ArrowBackIos />}
              size={"small"}
              sx={{ mt: 2 }}
              variant="text"
              disabled={loading}
              color="primary"
              onClick={() => {
                phaseSetting.previous != undefined && setPhase(phaseSetting.previous);
              }}
            >
              {t("login.back")}
            </Button>
          )}
        </>
      ),
    };
    return phaseSetting;
  }, [phase, t, loading]);

  return (
    <Box sx={{ overflow: "hidden" }}>
      <Typography variant={"h6"}>{phaseConfig.title}</Typography>
      <Box component={"form"} sx={{ mt: 1 }} onSubmit={submit}>
        <SwitchTransition>
          <CSSTransition
            addEndListener={(node, done) => node.addEventListener("transitionend", done, false)}
            classNames="side"
            key={phase}
          >
            <Box>
              {phase === EmailLoginPhase.CollectPassword && (
                <PhaseCollectPassword
                  email={email}
                  pwd={pwd}
                  onForget={() => setPhase(EmailLoginPhase.ForgetPassword)}
                  setPwd={setPwd}
                  control={phaseConfig.control}
                  loginOptions={loginOptions}
                  captchaGen={captchaGen}
                  setCaptchaState={(s) => (captchaState.current = s)}
                />
              )}
              {phase === EmailLoginPhase.SignupNeeded && (
                <PhaseSignupNeeded email={email} control={phaseConfig.control} />
              )}
              {phase === EmailLoginPhase.Collect2FA && (
                <Phase2FA
                  loading={loading}
                  otp={otp}
                  onOtpChange={(t: string) => setOTP(t)}
                  control={phaseConfig.control}
                />
              )}
              {phase === EmailLoginPhase.CollectEmail && (
                <PhaseCollectEmail email={email} setEmail={setEmail} control={phaseConfig.control} />
              )}
              {phase === EmailLoginPhase.ForgetPassword && (
                <PhaseForgetPassword
                  email={email}
                  captchaGen={captchaGen}
                  setCaptchaState={(s) => (captchaState.current = s)}
                  control={phaseConfig.control}
                />
              )}
            </Box>
          </CSSTransition>
        </SwitchTransition>
      </Box>
    </Box>
  );
};

const SignIn = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <PageTitle title={t("login.signIn")} />
      <EmailLogin />
    </Box>
  );
};

export default SignIn;
