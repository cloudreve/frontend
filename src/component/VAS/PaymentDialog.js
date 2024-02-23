import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    makeStyles,
} from "@material-ui/core";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    codeContainer: {
        textAlign: "center",
        marginTop: "20px",
    },
}));

export default function PaymentDialog({ open, handleClose, payment }) {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {t("vas.paymentQrcode")}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {payment.type === "alipay" && t("vas.qrcodeAlipay")}
                    {payment.type === "payjs" && t("vas.qrcodeWechat")}
                    {payment.type === "custom" && t("vas.qrcodeCustom")}
                </DialogContentText>
                <div className={classes.codeContainer}>
                    <QRCodeSVG value={payment.img} />,
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => window.open(payment.img)}>
                    {t("vas.openPaymentLink")}
                </Button>
                <Button onClick={handleClose} color="primary">
                    {t("close", { ns: "common" })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
