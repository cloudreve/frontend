import React from "react";
import SmallIcon from "../SmallIcon";
import FileIcon from "../FileIcon";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
    dragging: {
        width: "200px"
    },
    cardDragged: {
        position: "absolute",
        "transform-origin": "bottom left"
    }
}));

const diliverIcon = (object, viewMethod, classes) => {
    return (
        <>
            {object.type === "dir" && viewMethod !== "list" && (
                <div className={classes.dragging}>
                    <SmallIcon file={object} />
                </div>
            )}
            {object.type === "file" && viewMethod === "icon" && (
                <div className={classes.dragging}>
                    <FileIcon file={object} />
                </div>
            )}
            {object.type === "file" && viewMethod === "smallIcon" && (
                <div className={classes.dragging}>
                    <SmallIcon file={object} />
                </div>
            )}
        </>
    );
};

const Preview = props => {
    const selected = useSelector(state => state.explorer.selected);
    const viewMethod = useSelector(
        state => state.viewUpdate.explorerViewMethod
    );
    const classes = useStyles();
    return (
        <>
            {selected.length === 0 &&
                diliverIcon(props.object, viewMethod, classes)}
            {selected.length > 0 && (
                <>
                    {selected.slice(0, 3).map((card, i) => (
                        <div
                            key={card.id}
                            className={classes.cardDragged}
                            style={{
                                zIndex: selected.length - i,
                                transform: `rotateZ(${-i * 2.5}deg)`
                            }}
                        >
                            {diliverIcon(card, viewMethod, classes)}
                        </div>
                    ))}
                </>
            )}
        </>
    );
};
export default Preview;
