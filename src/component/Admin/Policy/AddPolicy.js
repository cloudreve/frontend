import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { useParams } from "react-router";
import LocalGuide from "./Guid/LocalGuide";
import RemoteGuide from "./Guid/RemoteGuide";
import QiniuGuide from "./Guid/QiniuGuide";
import OSSGuide from "./Guid/OSSGuide";
import UpyunGuide from "./Guid/UpyunGuide";
import COSGuide from "./Guid/COSGuide";
import OneDriveGuide from "./Guid/OneDriveGuide";
import S3Guide from "./Guid/S3Guide";

const useStyles = makeStyles((theme) => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100,
        },
        marginBottom: 40,
    },
    content: {
        padding: theme.spacing(2),
    },
}));

export default function AddPolicyParent() {
    const classes = useStyles();

    const { type } = useParams();

    return (
        <div>
            <Paper square className={classes.content}>
                {type === "local" && <LocalGuide />}
                {type === "remote" && <RemoteGuide />}
                {type === "qiniu" && <QiniuGuide />}
                {type === "oss" && <OSSGuide />}
                {type === "upyun" && <UpyunGuide />}
                {type === "cos" && <COSGuide />}
                {type === "onedrive" && <OneDriveGuide />}
                {type === "s3" && <S3Guide />}
            </Paper>
        </div>
    );
}
