import React, {useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import {useParams} from "react-router";
import LocalGuide from "./Guid/LocalGuide";
import RemoteGuide from "./Guid/RemoteGuide";
import QiniuGuide from "./Guid/QiniuGuide";
import OSSGuide from "./Guid/OSSGuide";
import UpyunGuide from "./Guid/UpyunGuide";

const useStyles = makeStyles(theme => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100
        },
        marginBottom: 40
    },
    content: {
        padding: theme.spacing(2)
    },
}));


export default function AddPolicyParent( ) {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);

    let { type } = useParams();

    return (
        <div>
            <Paper square className={classes.content}>
                {type==="local"&&<LocalGuide/>}
                {type==="remote"&&<RemoteGuide/>}
                {type==="qiniu"&&<QiniuGuide/>}
                {type==="oss"&&<OSSGuide/>}
                {type==="upyun"&&<UpyunGuide/>}
            </Paper>
        </div>
    );
}
