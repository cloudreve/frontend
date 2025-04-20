import { Box, Grow, IconButton, Typography } from "@mui/material";
import { forwardRef, useCallback, useMemo, useState } from "react";
import TextCaseTitle from "../../../Icons/TextCaseTitle.tsx";
import { useTranslation } from "react-i18next";
import Dismiss from "../../../Icons/Dismiss.tsx";
import FolderOutlined from "../../../Icons/FolderOutlined.tsx";
import Search from "../../../Icons/Search.tsx";
import { SearchBaseCondition } from "./SearchBaseCondition.tsx";
import { FileTypeCondition } from "./FileTypeCondition.tsx";
import { FileNameCondition, StyledBox } from "./FileNameCondition.tsx";
import Tag from "../../../Icons/Tag.tsx";
import { TagCondition } from "./TagCondition.tsx";
import Numbers from "../../../Icons/Numbers.tsx";
import { MetadataCondition } from "./MetadataCondition.tsx";
import HardDriveOutlined from "../../../Icons/HardDriveOutlined.tsx";
import { SizeCondition } from "./SizeCondition.tsx";
import CalendarClock from "../../../Icons/CalendarClock.tsx";
import { DateTimeCondition } from "./DateTimeCondition.tsx";

export interface Condition {
  type: ConditionType;
  case_folding?: boolean;
  names?: string[];
  name_op_or?: boolean;
  file_type?: number;
  size_gte?: number;
  size_lte?: number;
  time?: number;
  metadata_key?: string;
  metadata_value?: string;
  base_uri?: string;
  tags?: string[];
  id?: string;
  metadata_key_readonly?: boolean;
  created_gte?: number;
  created_lte?: number;
  updated_gte?: number;
  updated_lte?: number;
}

export enum ConditionType {
  name,
  size,
  created,
  modified,
  type,
  metadata,
  base,
  tag,
}

export interface ConditionProps {
  condition: Condition;
  onChange: (condition: Condition) => void;
  onRemove?: (condition: Condition) => void;
  index: number;
}

const ConditionBox = forwardRef((props: ConditionProps, ref) => {
  const { condition, index, onRemove, onChange } = props;
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);

  const Icon = useMemo(() => {
    switch (condition.type) {
      case ConditionType.base:
        return Search;
      case ConditionType.type:
        return FolderOutlined;
      case ConditionType.tag:
        return Tag;
      case ConditionType.metadata:
        return Numbers;
      case ConditionType.size:
        return HardDriveOutlined;
      case ConditionType.modified:
      case ConditionType.created:
        return CalendarClock;

      default:
        return TextCaseTitle;
    }
  }, [condition.type]);

  const title = useMemo(() => {
    switch (condition.type) {
      case ConditionType.base:
        return t("application:navbar.searchBase");
      case ConditionType.name:
        return t("application:modals.fileName");
      case ConditionType.type:
        return t("application:navbar.fileType");
      case ConditionType.tag:
        return t("application:fileManager.tags");
      case ConditionType.metadata:
        return t("application:fileManager.metadata");
      case ConditionType.size:
        return t("application:navbar.fileSize");
      case ConditionType.modified:
        return t("application:fileManager.updatedDate");
      case ConditionType.created:
        return t("application:fileManager.createDate");
      default:
        return "Unknown";
    }
  }, [t, condition]);

  const onNameConditionAdded = useCallback(
    (_e: any, newValue: string[]) => {
      onChange({
        ...condition,
        names: newValue,
      });
    },
    [onChange],
  );

  return (
    <StyledBox
      ref={ref}
      sx={{
        mt: index > 0 ? 1 : 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Typography
        sx={{
          gap: 1,
          mb: 1,
          display: "flex",
          alignItems: "center",
        }}
        variant={"body2"}
        fontWeight={600}
      >
        <Icon sx={{ width: "20px", height: "20px" }} />
        <Box sx={{ flexGrow: 1 }}>{title}</Box>
        <Grow in={hovered && !!onRemove}>
          <IconButton
            onClick={onRemove ? () => onRemove(condition) : undefined}
          >
            <Dismiss fontSize={"small"} />
          </IconButton>
        </Grow>
      </Typography>
      <Box>
        {condition.type == ConditionType.name && (
          <FileNameCondition
            condition={condition}
            onChange={onChange}
            onNameConditionAdded={onNameConditionAdded}
          />
        )}
        {condition.type == ConditionType.type && (
          <FileTypeCondition condition={condition} onChange={onChange} />
        )}
        {condition.type == ConditionType.base && (
          <SearchBaseCondition condition={condition} onChange={onChange} />
        )}
        {condition.type == ConditionType.tag && (
          <TagCondition onChange={onChange} condition={condition} />
        )}
        {condition.type == ConditionType.metadata && (
          <MetadataCondition onChange={onChange} condition={condition} />
        )}
        {condition.type == ConditionType.size && (
          <SizeCondition condition={condition} onChange={onChange} />
        )}
        {condition.type == ConditionType.created && (
          <DateTimeCondition
            condition={condition}
            onChange={onChange}
            field={"created"}
          />
        )}
        {condition.type == ConditionType.modified && (
          <DateTimeCondition
            condition={condition}
            onChange={onChange}
            field={"updated"}
          />
        )}
      </Box>
    </StyledBox>
  );
});

export default ConditionBox;
