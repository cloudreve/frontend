import React, { useCallback } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import Typography from "@material-ui/core/Typography";
import { toggleSnackbar } from "../../../redux/explorer";

export default function FileSelector({ onChange, value, label }) {
    const [selectValue, setSelectValue] = React.useState(
        value.map((v) => {
            return {
                ID: v,
                Name: "文件ID " + v,
            };
        })
    );
    const [loading, setLoading] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [options, setOptions] = React.useState([]);
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    React.useEffect(() => {
        let active = true;
        if (
            inputValue === "" ||
            selectValue.findIndex((v) => v.ID.toString() === inputValue) >= 0
        ) {
            setOptions([]);
            return;
        }

        setLoading(true);
        API.post("/admin/file/list", {
            page: 1,
            page_size: 10,
            order_by: "id desc",
            conditions: {
                id: inputValue,
            },
            searches: {},
        })
            .then((response) => {
                if (active) {
                    let newOptions = [];
                    newOptions = [...newOptions, ...response.data.items];
                    setOptions(newOptions);
                }
                setLoading(false);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
                setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [selectValue, inputValue]);

    return (
        <Autocomplete
            multiple
            style={{ width: 300 }}
            options={options}
            getOptionLabel={(option) =>
                typeof option === "string" ? option : option.Name
            }
            filterOptions={(x) => x}
            loading={loading}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={selectValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            onChange={(event, newValue) => {
                setSelectValue(newValue);
                onChange(JSON.stringify(newValue.map((v) => v.ID)));
            }}
            renderInput={(params) => (
                <TextField {...params} label={label} type={"number"} />
            )}
            renderOption={(option) => (
                <Typography noWrap>{option.Name}</Typography>
            )}
        />
    );
}
