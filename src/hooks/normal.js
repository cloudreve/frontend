import React, {
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useDispatch } from "react-redux";
import API from "../middleware/Api";
import {
    FormControl,
    Input,
    InputAdornment,
    InputLabel,
    makeStyles,
    TextField,
} from "@material-ui/core";
import Placeholder from "../component/Placeholder/Captcha";
import { defaultValidate, useStyle } from "./useCaptcha";
import { toggleSnackbar } from "../redux/explorer";
import { useTranslation } from "react-i18next";

const NormalCaptcha = forwardRef(function NormalCaptcha(
    { captchaRef, setLoading },
    ref
) {
    const { t } = useTranslation();
    const classes = useStyle();

    const [captcha, setCaptcha] = useState("");
    const [captchaData, setCaptchaData] = useState(null);

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const refreshCaptcha = () => {
        API.get("/site/captcha")
            .then((response) => {
                setCaptchaData(response.data);
                setLoading(false);
            })
            .catch((error) => {
                ToggleSnackbar(
                    "top",
                    "right",
                    t("login.captchaError", { message: error.message }),
                    "error"
                );
            });
    };

    useEffect(() => {
        ref.current = refreshCaptcha;
        refreshCaptcha();
    }, []);

    useEffect(() => {
        captchaRef.current.captchaCode = captcha;
    }, [captcha]);

    return (
        <div className={classes.captchaInputContainer}>
            <FormControl margin="normal" required fullWidth>
                <TextField
                    variant={"outlined"}
                    label={t("login.captcha")}
                    inputProps={{
                        name: "captcha",
                        id: "captcha",
                    }}
                    onChange={(e) => setCaptcha(e.target.value)}
                    value={captcha}
                    autoComplete
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position={"end"}>
                                <div
                                    className={classes.captchaImageContainer}
                                    title={t("login.clickToRefresh")}
                                >
                                    {captchaData === null && <Placeholder />}
                                    {captchaData !== null && (
                                        <img
                                            className={classes.captchaImage}
                                            src={captchaData}
                                            alt="captcha"
                                            onClick={refreshCaptcha}
                                        />
                                    )}
                                </div>
                            </InputAdornment>
                        ),
                    }}
                />
            </FormControl>{" "}
        </div>
    );
});

export default function useNormalCaptcha(captchaRefreshRef, setLoading) {
    const isValidate = useRef({
        isValidate: true,
    });

    const captchaParamsRef = useRef({
        captchaCode: "",
    });

    const CaptchaRender = useCallback(
        function Normal() {
            return (
                <NormalCaptcha
                    captchaRef={captchaParamsRef}
                    ref={captchaRefreshRef}
                    setLoading={setLoading}
                />
            );
        },
        [captchaParamsRef, captchaRefreshRef, setLoading]
    );

    return {
        isValidate,
        validate: defaultValidate,
        captchaParamsRef,
        CaptchaRender,
    };
}
