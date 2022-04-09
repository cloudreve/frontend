import React from "react";
import Backdrop from "@material-ui/core/Backdrop";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import UploadIcon from "@material-ui/icons/CloudUpload";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) =>
    createStyles({
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: "#fff",
            flexDirection: "column",
        },
    })
);

export function DropFileBackground({ open }) {
    const classes = useStyles();
    return (
        <Backdrop className={classes.backdrop} open={open}>
            <div>
                <UploadIcon style={{ fontSize: 80 }} />
            </div>
            <div>
                <Typography variant={"h4"}>松开鼠标开始上传</Typography>
            </div>
        </Backdrop>
    );
}
