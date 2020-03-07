import React, {useCallback, useEffect, useState} from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import {useParams} from "react-router";
import LocalGuide from "../Policy/Guid/LocalGuide";
import RemoteGuide from "../Policy/Guid/RemoteGuide";
import QiniuGuide from "../Policy/Guid/QiniuGuide";
import OSSGuide from "../Policy/Guid/OSSGuide";
import UpyunGuide from "../Policy/Guid/UpyunGuide";
import COSGuide from "../Policy/Guid/COSGuide";
import OneDriveGuide from "../Policy/Guid/OneDriveGuide";
import API from "../../../middleware/Api";
import {useDispatch} from "react-redux";
import {toggleSnackbar} from "../../../actions";
import EditPro from "../Policy/Guid/EditPro";

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


export default function EditPolicyPreload( ) {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [type,setType] = useState("");
    const [policy,setPolicy] = useState({});

    let { mode,id } = useParams();

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );


    useEffect(()=>{
        setType("");
        API.get("/admin/policy/" + id)
            .then(response => {
                response.data.IsOriginLinkEnable =  response.data.IsOriginLinkEnable ? "true" : "false";
                response.data.AutoRename =  response.data.AutoRename ? "true" : "false";
                response.data.MaxSize =  response.data.MaxSize.toString();
                response.data.IsPrivate =  response.data.IsPrivate ? "true" : "false";
                response.data.OptionsSerialized.file_type =
                    response.data.OptionsSerialized.file_type ?
                    response.data.OptionsSerialized.file_type.join(","):
                        "";
                setPolicy(response.data);
                setType(response.data.Type);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    },[id]);

    return (
        <div>
            <Paper square className={classes.content}>
                {mode === "guide" &&
                    <>
                        {type==="local"&&<LocalGuide policy={policy}/>}
                        {type==="remote"&&<RemoteGuide policy={policy}/>}
                        {type==="qiniu"&&<QiniuGuide policy={policy}/>}
                        {type==="oss"&&<OSSGuide policy={policy}/>}
                        {type==="upyun"&&<UpyunGuide policy={policy}/>}
                        {type==="cos"&&<COSGuide policy={policy}/>}
                        {type==="onedrive"&&<OneDriveGuide policy={policy}/>}
                    </>
                }

                {mode === "pro" && type !== "" &&
                    <EditPro policy={policy}/>
                }
            </Paper>
        </div>
    );
}
