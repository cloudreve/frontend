import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    makeStyles,
} from "@material-ui/core";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({}));

export default function OptionSelector() {
    const classes = useStyles();
    const option = useSelector((state) => state.viewUpdate.modals.option);

    return (
        <Dialog
            open={option && option.open}
            onClose={option && option.onClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">
                {option && option.title}
            </DialogTitle>
            <DialogContent dividers={"paper"} className={classes.content}>
                <List component="nav" aria-label="main mailbox folders">
                    {option &&
                        option.options.map((o) => (
                            <ListItem
                                key={o.key}
                                onClick={() => option && option.callback(o)}
                                button
                            >
                                <ListItemText
                                    primary={o.name}
                                    secondary={o.description}
                                />
                            </ListItem>
                        ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={option && option.onClose}>取消</Button>
            </DialogActions>
        </Dialog>
    );
}
