const boolFields = ["IsOriginLinkEnable", "AutoRename", "IsPrivate"];

const numberFields = ["MaxSize"];

const boolFieldsInOptions = ["placeholder_with_size", "s3_path_style"];

const numberFieldsInOptions = ["chunk_size", "tps_limit", "tps_limit_burst"];

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
    response.data.OptionsSerialized.file_type = response.data.OptionsSerialized
        .file_type
        ? response.data.OptionsSerialized.file_type.join(",")
        : "";
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

    policyCopy.OptionsSerialized.file_type =
        policyCopy.OptionsSerialized.file_type.split(",");
    if (
        policyCopy.OptionsSerialized.file_type.length === 1 &&
        policyCopy.OptionsSerialized.file_type[0] === ""
    ) {
        policyCopy.OptionsSerialized.file_type = [];
    }

    return policyCopy;
};
