import React, { useCallback, useEffect, useState } from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../redux/explorer";
import FormHelperText from "@material-ui/core/FormHelperText";

const unitTransform = (v) => {
    if (!v || v.toString() === "0") {
        return [0, 1024 * 1024];
    }
    for (let i = 4; i >= 0; i--) {
        const base = Math.pow(1024, i);
        if (v % base === 0) {
            return [v / base, base];
        }
    }
};

export default function SizeInput({
    onChange,
    min,
    value,
    required,
    label,
    max,
    suffix,
}) {
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const [unit, setUnit] = useState(1);
    const [val, setVal] = useState(value);
    const [err, setError] = useState("");

    useEffect(() => {
        onChange({
            target: {
                value: (val * unit).toString(),
            },
        });
        if (val * unit > max || val * unit < min) {
            setError("不符合尺寸限制");
        } else {
            setError("");
        }
    }, [val, unit, max, min]);

    useEffect(() => {
        const res = unitTransform(value);
        setUnit(res[1]);
        setVal(res[0]);
    }, []);

    return (
        <FormControl error={err !== ""}>
            <InputLabel htmlFor="component-helper">{label}</InputLabel>
            <Input
                style={{ width: 200 }}
                value={val}
                type={"number"}
                inputProps={{ step: 1 }}
                onChange={(e) => setVal(e.target.value)}
                required={required}
                endAdornment={
                    <InputAdornment position="end">
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                        >
                            <MenuItem value={1}>B{suffix && suffix}</MenuItem>
                            <MenuItem value={1024}>
                                KB{suffix && suffix}
                            </MenuItem>
                            <MenuItem value={1024 * 1024}>
                                MB{suffix && suffix}
                            </MenuItem>
                            <MenuItem value={1024 * 1024 * 1024}>
                                GB{suffix && suffix}
                            </MenuItem>
                            <MenuItem value={1024 * 1024 * 1024 * 1024}>
                                TB{suffix && suffix}
                            </MenuItem>
                        </Select>
                    </InputAdornment>
                }
            />
            {err !== "" && <FormHelperText>{err}</FormHelperText>}
        </FormControl>
    );
}
