import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCaptcha } from "../../../api/api.ts";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { Box, InputAdornment, Skeleton, TextField } from "@mui/material";
import { CaptchaParams } from "./Captcha.tsx";

export interface DefaultCaptchaProps {
  onStateChange: (state: CaptchaParams) => void;
  generation: number;
}

const DefaultCaptcha = ({ onStateChange, generation, ...rest }: DefaultCaptchaProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [captcha, setCaptcha] = useState("");
  const [sessionId, setSessionID] = useState("");
  const [captchaData, setCaptchaData] = useState<string>();

  const refreshCaptcha = async () => {
    setCaptchaData(undefined);
    const captchaResponse = await dispatch(getCaptcha());
    setCaptchaData(captchaResponse.image);
    setSessionID(captchaResponse.ticket);
  };

  useEffect(() => {
    refreshCaptcha();
  }, [generation]);

  useEffect(() => {
    onStateChange({ captcha, ticket: sessionId });
  }, [captcha, sessionId]);

  return (
    <TextField
      sx={{
        "& .MuiOutlinedInput-root": {
          pr: 0.5,
        },
      }}
      variant={"outlined"}
      label={t("login.captcha")}
      onChange={(e) => setCaptcha(e.target.value)}
      value={captcha}
      autoComplete={"true"}
      {...rest}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position={"end"}>
              <Box
                sx={{
                  cursor: "pointer",
                  height: 48,
                }}
                title={t("login.clickToRefresh")}
              >
                {!captchaData && (
                  <Skeleton
                    animation={"wave"}
                    sx={{
                      borderRadius: (theme) => `${theme.shape.borderRadius}px`,
                    }}
                    variant="rounded"
                    width={192}
                    height={48}
                  />
                )}
                {captchaData && (
                  <Box
                    component={"img"}
                    sx={{
                      borderRadius: (theme) => `${theme.shape.borderRadius}px`,
                      height: 48,
                    }}
                    src={captchaData}
                    alt="captcha"
                    onClick={refreshCaptcha}
                  />
                )}
              </Box>
            </InputAdornment>
          ),
        },

        htmlInput: {
          name: "captcha",
          id: "captcha",
        },
      }}
    />
  );
};

export default DefaultCaptcha;
