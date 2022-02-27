import React from "react";
import { ListItem, ListItemText, makeStyles } from "@material-ui/core";
import TypeIcon from "../../FileManager/TypeIcon";
import { useUpload } from "../UseUpload";

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
}));

export default function UploadTask({ uploader }) {
    const classes = useStyles();
    useUpload(uploader);

    return (
        <ListItem className={classes.progressContent} button>
            <TypeIcon fileName={uploader.task.name} isUpload />
            <ListItemText
                className={classes.listAction}
                primary={
                    <span className={classes.fileName}>
                        {uploader.task.name}
                    </span>
                }
                secondary={<div>{uploader.status}</div>}
            />
        </ListItem>
    );
}
