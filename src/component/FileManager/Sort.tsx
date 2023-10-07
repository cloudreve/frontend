import React, { MouseEventHandler, useState } from "react";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import TextTotateVerticalIcon from "@material-ui/icons/TextRotateVertical";
import { useTranslation } from "react-i18next";
import { CloudreveFile, SortMethod } from "./../../types/index";

const SORT_OPTIONS: {
    value: SortMethod;
    label: string;
}[] = [
    { value: "namePos", label: "A-Z" },
    { value: "nameRev", label: "Z-A" },
    { value: "timePos", label: "oldestUploaded" },
    { value: "timeRev", label: "newestUploaded" },
    { value: "modifyTimePos", label: "oldestModified" },
    { value: "modifyTimeRev", label: "newestModified" },
    { value: "sizePos", label: "smallest" },
    { value: "sizeRes", label: "largest" },
]

export default function Sort({ value, onChange, isSmall, inherit, className }) {
    const { t } = useTranslation("application", { keyPrefix: "fileManager.sortMethods" });

    const [anchorSort, setAnchorSort] = useState<Element | null>(null);
    const showSortOptions: MouseEventHandler<HTMLButtonElement> = (e) => {
        setAnchorSort(e.currentTarget);
    }
    
    const [sortBy, setSortBy] = useState<SortMethod>(value || '')
    function onChangeSort(value: SortMethod) {
        setSortBy(value)
        onChange(value)
        setAnchorSort(null);
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


type SortFunc = (a: CloudreveFile, b: CloudreveFile) => number;

export const sortMethodFuncs: Record<SortMethod, SortFunc> = {
    sizePos: (a: CloudreveFile, b: CloudreveFile) => {
        return a.size - b.size;
    },
    sizeRes: (a: CloudreveFile, b: CloudreveFile) => {
        return b.size - a.size;
    },
    namePos: (a: CloudreveFile, b: CloudreveFile) => {
        return a.name.localeCompare(
            b.name,
            navigator.languages[0] || navigator.language,
            { numeric: true, ignorePunctuation: true }
        );
    },
    nameRev: (a: CloudreveFile, b: CloudreveFile) => {
        return b.name.localeCompare(
            a.name,
            navigator.languages[0] || navigator.language,
            { numeric: true, ignorePunctuation: true }
        );
    },
    timePos: (a: CloudreveFile, b: CloudreveFile) => {
        return Date.parse(a.create_date) - Date.parse(b.create_date);
    },
    timeRev: (a: CloudreveFile, b: CloudreveFile) => {
        return Date.parse(b.create_date) - Date.parse(a.create_date);
    },
    modifyTimePos: (a: CloudreveFile, b: CloudreveFile) => {
        return Date.parse(a.date) - Date.parse(b.date);
    },
    modifyTimeRev: (a: CloudreveFile, b: CloudreveFile) => {
        return Date.parse(b.date) - Date.parse(a.date);
    },
};
