import React from "react";
import { ListItem, makeStyles } from "@material-ui/core";
import TypeIcon from "../../FileManager/TypeIcon";

const useStyles = makeStyles((theme) => ({}));

export default function UploadTask({ uploader }) {
    const classes = useStyles();

    return (
        <ListItem className={classes.progressContent} button>
            <TypeIcon fileName={uploader.task.name} isUpload />
        </ListItem>
    );
}
