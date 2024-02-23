import React, { useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    makeStyles,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import Auth from "../../middleware/Auth";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    widthAnimation: {},
    content: {
        overflowWrap: "break-word",
    },
}));

export default function SiteNotice() {
    const { t } = useTranslation();
    const content = useSelector((state) => state.siteConfig.site_notice);
    const classes = useStyles();
    const [show, setShow] = useState(false);
    const setRead = () => {
        setShow(false);
        Auth.SetPreference("notice_read", content);
    };
    useEffect(() => {
        const newNotice = Auth.GetPreference("notice_read");
        if (content !== "" && newNotice !== content) {
            setShow(true);
        }
    }, [content]);
    return (
        <Dialog
            open={show}
            onClose={() => setShow(false)}
            aria-labelledby="form-dialog-title"
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle id="form-dialog-title">
                {t("vas.announcement")}
            </DialogTitle>
            <DialogContent
                className={classes.content}
                dangerouslySetInnerHTML={{ __html: content }}
            />

            <DialogActions>
                <Button onClick={() => setRead()} color="primary">
                    {t("vas.dontShowAgain")}
                </Button>
                <Button onClick={() => setShow(false)}>
                    {t("close", { ns: "common" })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
