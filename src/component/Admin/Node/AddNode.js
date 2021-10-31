import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import NodeGuide from "./Guide/NodeGuide";

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

export default function AddNode() {
    const classes = useStyles();
    return (
        <div>
            <Paper square className={classes.content}>
                <NodeGuide />
            </Paper>
        </div>
    );
}
