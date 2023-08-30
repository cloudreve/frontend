import React, { useState } from "react";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import TextTotateVerticalIcon from "@material-ui/icons/TextRotateVertical";
import { useTranslation } from "react-i18next";

const SORT_TYPE = {
    namePos: "namePos",
    nameRev: "nameRev",
    timePos: "timePos",
    timeRev: "timeRev",
    modifyTimePos: "modifyTimePos",
    modifyTimeRev: "modifyTimeRev",
    sizePos: "sizePos",
    sizeRes: "sizeRes",
}

const SORT_OPTIONS = [
    { value: SORT_TYPE.namePos, label: "A-Z" },
    { value: SORT_TYPE.nameRev, label: "Z-A" },
    { value: SORT_TYPE.timePos, label: "oldestUploaded" },
    { value: SORT_TYPE.timeRev, label: "newestUploaded" },
    { value: SORT_TYPE.modifyTimePos, label: "oldestModified" },
    { value: SORT_TYPE.modifyTimeRev, label: "newestModified" },
    { value: SORT_TYPE.sizePos, label: "smallest" },
    { value: SORT_TYPE.sizeRes, label: "largest" },
]

export default function Sort({ value, onChange, isSmall, inherit, className }) {
    const { t } = useTranslation("application", { keyPrefix: "fileManager.sortMethods" });

    const [anchorSort, setAnchorSort] = useState(false);
    function showSortOptions(e) {
        setAnchorSort(e.currentTarget);
    }
    
    const [sortBy, setSortBy] = useState(value in SORT_TYPE ? value : '')
    function onChangeSort(value) {
        setSortBy(value)
        onChange(value)
        setAnchorSort(false);
    }
    return (
        <>
            <IconButton
                title={t("sortMethod")}
                className={className}
                onClick={showSortOptions}
                color={inherit ? "inherit" : "default"}
            >
                <TextTotateVerticalIcon
                    fontSize={isSmall ? "small" : "default"}
                />
            </IconButton>
            <Menu
                id="sort-menu"
                anchorEl={anchorSort}
                open={Boolean(anchorSort)}
                onClose={() => setAnchorSort(null)}
            >
                {
                    SORT_OPTIONS.map((option, index) => (
                        <MenuItem
                            key={index}
                            selected={option.value === sortBy}
                            onClick={() => onChangeSort(option.value)}
                        >
                            {t(option.label)}
                        </MenuItem>
                    ))
                }
            </Menu>
        </>
    )
}
