const boolFields = ["IsOriginLinkEnable", "AutoRename", "IsPrivate"];

const numberFields = ["MaxSize"];

const boolFieldsInOptions = ["placeholder_with_size", "s3_path_style"];

const numberFieldsInOptions = ["chunk_size", "tps_limit", "tps_limit_burst"];
const listJsonFieldsInOptions = ["file_type", "thumb_exts"];

export const transformResponse = (response) => {
    boolFields.forEach(
        (field) =>
            (response.data[field] = response.data[field] ? "true" : "false")
    );
    numberFields.forEach(
        (field) => (response.data[field] = response.data[field].toString())
    );
    boolFieldsInOptions.forEach(
        (field) =>
        (response.data.OptionsSerialized[field] = response.data
            .OptionsSerialized[field]
            ? "true"
            : "false")
    );
    numberFieldsInOptions.forEach(
        (field) =>
        (response.data.OptionsSerialized[field] = response.data
            .OptionsSerialized[field]
            ? response.data.OptionsSerialized[field].toString()
            : 0)
    );

    listJsonFieldsInOptions.forEach((field) => {
        response.data.OptionsSerialized[field] = response.data
            .OptionsSerialized[field]
            ? response.data.OptionsSerialized[field].join(",")
            : "";
    });
    return response;
};

export const transformPolicyRequest = (policyCopy) => {
    boolFields.forEach(
        (field) => (policyCopy[field] = policyCopy[field] === "true")
    );
    numberFields.forEach(
        (field) => (policyCopy[field] = parseInt(policyCopy[field]))
    );
    boolFieldsInOptions.forEach(
        (field) =>
        (policyCopy.OptionsSerialized[field] =
            policyCopy.OptionsSerialized[field] === "true")
    );
    numberFieldsInOptions.forEach(
        (field) =>
        (policyCopy.OptionsSerialized[field] = parseInt(
            policyCopy.OptionsSerialized[field]
        ))
    );

    listJsonFieldsInOptions.forEach((field) => {
        policyCopy.OptionsSerialized[field] = policyCopy.OptionsSerialized[
            field
        ]
            ? policyCopy.OptionsSerialized[field].split(",")
            : [];
        if (
            policyCopy.OptionsSerialized[field].length === 1 &&
            policyCopy.OptionsSerialized[field][0] === ""
        ) {
            policyCopy.OptionsSerialized[field] = [];
        }
    });

    return policyCopy;
};
