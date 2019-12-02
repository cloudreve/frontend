import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import FolderIcon from "@material-ui/icons/Folder";
import {
    Divider,
    MenuItem,
    ListItemIcon,
    ListItemText
} from "@material-ui/core";
import { useDrop } from "react-dnd";
import classNames from "classnames";

const useStyles = makeStyles(theme => ({
    active: {
        border: "2px solid " + theme.palette.primary.light
    }
}));

export default function DropDownItem(props) {
    const [{ canDrop, isOver }, drop] = useDrop({
        accept: "object",
        drop: () => {
            console.log({
                folder: {
                    id: -1,
                    path: props.path,
                    name: props.folder == "/" ? "" : props.folder
                }
            });
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    });

    const isActive = canDrop && isOver;
    let first = true;

    useEffect(() => {
        props.setActiveStatus(props.id,isActive);
    }, [isActive])

    const classes = useStyles();
    return (
        <MenuItem
            ref={drop}
            className={classNames({
                [classes.active]: isActive
            })}
            onClick={e => props.navigateTo(e, props.id)}
        >
            <ListItemIcon>
                <FolderIcon />
            </ListItemIcon>
            <ListItemText primary={props.folder} />
        </MenuItem>
    );
}
