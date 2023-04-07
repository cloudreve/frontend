import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../redux/explorer";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import Chip from "@material-ui/core/Chip";
import MenuItem from "@material-ui/core/MenuItem";
import { getSelectItemStyles } from "../../../utils";
import FormHelperText from "@material-ui/core/FormHelperText";
import { FormControl } from "@material-ui/core";
import API from "../../../middleware/Api";
import { useTheme } from "@material-ui/core/styles";

export default function PolicySelector({
    onChange,
    value,
    label,
    helperText,
    filter,
}) {
    const [policies, setPolicies] = useState({});
    const theme = useTheme();
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        API.post("/admin/policy/list", {
            page: 1,
            page_size: 10000,
            order_by: "id asc",
            conditions: {},
        })
            .then((response) => {
                const res = {};
                let data = response.data.items;
                if (filter) {
                    data = data.filter(filter);
                }

                data.forEach((v) => {
                    res[v.ID] = v.Name;
                });
                setPolicies(res);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }, []);

    return (
        <FormControl fullWidth>
            <InputLabel htmlFor="component-helper">{label}</InputLabel>
            <Select
                labelId="demo-mutiple-chip-label"
                id="demo-mutiple-chip"
                multiple
                value={value}
                onChange={onChange}
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
                                label={policies[value]}
                            />
                        ))}
                    </div>
                )}
            >
                {Object.keys(policies).map((pid) => (
                    <MenuItem
                        key={pid}
                        value={pid}
                        style={getSelectItemStyles(pid, value, theme)}
                    >
                        {policies[pid]}
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText id="component-helper-text">
                {helperText}
            </FormHelperText>
        </FormControl>
    );
}
