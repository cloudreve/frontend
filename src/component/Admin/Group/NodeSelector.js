import React, { useCallback, useEffect, useState } from "react";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../redux/explorer";
import { useTranslation } from "react-i18next";
import Input from "@material-ui/core/Input";
import Chip from "@material-ui/core/Chip";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { getSelectItemStyles } from "../../../utils";
import { useTheme } from "@material-ui/core/styles";

export default function NodeSelector({ selected, handleChange }) {
    const { t } = useTranslation("dashboard", { keyPrefix: "group" });
    const [nodes, setNodes] = useState({});
    const theme = useTheme();

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        API.post("/admin/node/list", {
            page: 1,
            page_size: 10000,
            order_by: "id asc",
            conditions: {},
        })
            .then((response) => {
                const res = {};
                response.data.items.forEach((v) => {
                    res[v.ID] = v.Name;
                });
                setNodes(res);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }, []);

    return (
        <Select
            labelId="demo-mutiple-chip-label"
            id="demo-mutiple-chip"
            multiple
            value={selected}
            onChange={handleChange}
            input={<Input id="select-multiple-chip" />}
            renderValue={(selected) => (
                <div>
                    {selected.map((value) => (
                        <Chip
                            style={{
                                margin: 2,
                            }}
                            key={value}
                            size={"small"}
                            label={nodes[value]}
                        />
                    ))}
                </div>
            )}
        >
            {Object.keys(nodes).map((pid) => (
                <MenuItem
                    key={pid}
                    value={pid}
                    style={getSelectItemStyles(pid, selected, theme)}
                >
                    {nodes[pid]}
                </MenuItem>
            ))}
        </Select>
    );
}
