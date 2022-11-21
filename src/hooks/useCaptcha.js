import { useSelector } from "react-redux";
import { useRef, useState } from "react";
import { makeStyles } from "@material-ui/core";
import useNormalCaptcha from "./normal";
import useRecaptcha from "./recaptcha";
import useTCaptcha from "./tcaptcha";

export const useStyle = makeStyles((theme) => ({
    captchaContainer: {
        display: "flex",
        marginTop: "10px",
        alignItems: "center",
        [theme.breakpoints.down("sm")]: {
            marginTop: 0,
            display: "block",
        },
    },
    captchaInputContainer: {
        marginTop: 0,
    },
    captchaImageContainer: {
        cursor: "pointer",
        marginLeft: "1rem",
        [theme.breakpoints.down("sm")]: {
            marginLeft: 0,
        },
    },
    captchaImage: {
        borderRadius: theme.shape.borderRadius,
        height: 48,
        marginTop: 4,
    },
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
export const defaultValidate = (submit, setLoading) => {};

export const useCaptcha = () => {
    const captchaType = useSelector((state) => state.siteConfig.captcha_type);

    const [captchaLoading, setCaptchaLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const captchaRefreshRef = useRef(() => {});

    const normal = useNormalCaptcha(captchaRefreshRef, setCaptchaLoading);
    const recaptcha = useRecaptcha(setCaptchaLoading);
    const tcaptcha = useTCaptcha(setCaptchaLoading);

    switch (captchaType) {
        case "normal":
            return { ...normal, captchaRefreshRef, captchaLoading };
        case "recaptcha":
            return { ...recaptcha, captchaRefreshRef, captchaLoading };
        case "tcaptcha":
            return { ...tcaptcha, captchaRefreshRef, captchaLoading };
        default:
            return { ...normal, captchaRefreshRef, captchaLoading };
    }
};
