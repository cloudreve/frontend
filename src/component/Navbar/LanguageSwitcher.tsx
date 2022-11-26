import React, { useCallback } from "react";
import { IconButton, makeStyles } from "@material-ui/core";
import { Translate } from "@material-ui/icons";
import { useDispatch } from "react-redux";
import Tooltip from "@material-ui/core/Tooltip";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { selectLanguage } from "../../redux/viewUpdate/action";

const useStyles = makeStyles({
    icon: {
        color: "rgb(255, 255, 255)",
        opacity: "0.54",
    },
});

const LanguageSwitcher = ({ position }: { position: "left" | "bottom" }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const SelectLanguage = useCallback(
        () => dispatch(selectLanguage()),
        [dispatch]
    );

    const classes = useStyles();
    return (
        <Tooltip title={t("navbar.language")!!} placement="bottom">
            <IconButton
                className={classNames({
                    [classes.icon]: "left" === position,
                })}
                onClick={SelectLanguage}
                color="inherit"
            >
                <Translate />
            </IconButton>
        </Tooltip>
    );
};

export default LanguageSwitcher;
