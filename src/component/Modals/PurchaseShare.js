import React from "react";
import { Dialog } from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import DialogContentText from "@material-ui/core/DialogContentText";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

export default function PurchaseShareDialog() {
    const { t } = useTranslation();
    const purchase = useSelector((state) => state.explorer.purchase);
    return (
        <>
            {purchase && (
                <Dialog
                    open={purchase}
                    onClose={purchase.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="alert-dialog-title">
                        {t("vas.sharePurchaseTitle", { score: purchase.score })}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {t("vas.sharePurchaseDescription")}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={purchase.onClose}>
                            {t("cancel", { ns: "common" })}
                        </Button>
                        <Button
                            onClick={() => purchase.callback()}
                            color="primary"
                            autoFocus
                        >
                            {t("ok", { ns: "common" })}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
}
