import React, { useMemo } from "react";
import { Divider, ListItem, ListItemText, makeStyles } from "@material-ui/core";
import TypeIcon from "../../FileManager/TypeIcon";
import { useUpload } from "../UseUpload";
import { Status } from "../core/uploader/base";
import { UploaderError } from "../core/errors";

const useStyles = makeStyles((theme) => ({
    progressContent: {
        position: "relative",
        zIndex: 9,
    },
    listAction: {
        marginLeft: 20,
        marginRight: 20,
    },
    fileName: {
        wordBreak: "break-all",
    },
    successStatus: {
        color: theme.palette.success.main,
    },
    errorStatus: {
        color: theme.palette.warning.main,
        wordBreak: "break-all",
    },
}));

export default function UploadTask({ uploader }) {
    const classes = useStyles();
    const { status, error } = useUpload(uploader);
    const statusText = useMemo(() => {
        let errMsg;
        switch (status) {
            case Status.preparing:
                return <div>准备中...</div>;
            case Status.error:
                errMsg = error.message;
                if (error instanceof UploaderError) {
                    errMsg = error.Message("");
                }

                return (
                    <div className={classes.errorStatus}>
                        {errMsg}
                        <br />
                    </div>
                );
            default:
                return <div>未知</div>;
        }
    }, [status, error]);

    return (
        <>
            <ListItem className={classes.progressContent} button>
                <TypeIcon fileName={uploader.task.name} isUpload />
                <ListItemText
                    className={classes.listAction}
                    primary={
                        <span className={classes.fileName}>
                            {uploader.task.name}
                        </span>
                    }
                    secondary={statusText}
                />
            </ListItem>
            <Divider />
        </>
    );
}
