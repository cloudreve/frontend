import React from "react";
import { makeStyles } from "@material-ui/core";
import { Dialog } from "@material-ui/core";

import { useDispatch } from "react-redux";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import DialogContentText from "@material-ui/core/DialogContentText";
const useStyles = makeStyles(theme => ({}));

export default function PurchaseShareDialog(props) {
    const dispatch = useDispatch();
    const classes = useStyles();

    return (
        <Dialog
            open={props.callback}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="alert-dialog-title">
                确定要支付 {props.score}积分 购买此分享？
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    购买后，您可以自由预览、下载此分享的所有内容，一定期限内不会重复扣费。
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>
                    取消
                </Button>
                <Button onClick={()=>props.callback()} color="primary" autoFocus>
                    确定
                </Button>
            </DialogActions>
        </Dialog>
    );
}
