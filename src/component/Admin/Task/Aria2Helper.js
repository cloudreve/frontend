import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Link,
} from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({}));

export default function Aria2Helper(props) {
    const { t } = useTranslation("dashboard", { keyPrefix: "task" });
    const { t: tCommon } = useTranslation("common");
    const classes = useStyles();

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {t("howToConfigAria2")}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {t("aria2Des")}
                    <ul>
                        <li>
                            <Trans
                                ns={"dashboard"}
                                i18nKey={"task.masterAria2Des"}
                                components={[
                                    <Link
                                        component={RouterLink}
                                        to={"/admin/node/edit/1"}
                                        key={0}
                                    />,
                                ]}
                            />
                        </li>
                        <li>
                            <Trans
                                ns={"dashboard"}
                                i18nKey={"task.slaveAria2Des"}
                                components={[
                                    <Link
                                        component={RouterLink}
                                        to={"/admin/node/add"}
                                        key={0}
                                    />,
                                ]}
                            />
                        </li>
                    </ul>
                    <Trans
                        ns={"dashboard"}
                        i18nKey={"task.editGroupDes"}
                        components={[
                            <Link
                                component={RouterLink}
                                to={"/admin/group"}
                                key={0}
                            />,
                        ]}
                    />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} color="primary" autoFocus>
                    {tCommon("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
