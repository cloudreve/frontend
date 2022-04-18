import React from "react";
import {
    Icon,
    ListItemIcon,
    makeStyles,
    Menu,
    MenuItem,
} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";

const useStyles = makeStyles((theme) => ({
    icon: {
        minWidth: 38,
    },
}));

export default function SelectMenu({
    options,
    anchorEl,
    handleClose,
    callback,
    selected,
    showIcon = true,
}) {
    const classes = useStyles();

    return (
        <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
        >
            {options.map((item) => (
                <>
                    <MenuItem
                        style={{ whiteSpace: "normal" }}
                        dense
                        onClick={() => callback(item)}
                    >
                        {showIcon && (
                            <ListItemIcon className={classes.icon}>
                                {item.name !== selected ? (
                                    <Icon />
                                ) : (
                                    <CheckIcon />
                                )}
                            </ListItemIcon>
                        )}

                        {item.name}
                    </MenuItem>
                </>
            ))}
        </Menu>
    );
}
