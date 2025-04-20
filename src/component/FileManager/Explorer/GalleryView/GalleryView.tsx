import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Box, ImageList } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks.ts";
import { FmIndexContext } from "../../FmIndexContext.tsx";
import { FmFile, loadingPlaceHolderNumb } from "../GridView/GridView.tsx";
import DndWrappedFile from "../../Dnd/DndWrappedFile.tsx";
import GalleryImage from "./GalleryImage.tsx";
import { mergeRefs } from "../../../../util";

const GalleryView = React.forwardRef(
  (
    {
      ...rest
    }: {
      [key: string]: any;
    },
    ref,
  ) => {
    const { t } = useTranslation("application");
    const dispatch = useAppDispatch();
    const containerRef = useRef<HTMLElement>();
    const fmIndex = useContext(FmIndexContext);
    const [boxHeight, setBoxHeight] = useState(0);
    const [col, setCol] = useState(0);

    const files = useAppSelector(
      (state) => state.fileManager[fmIndex].list?.files,
    );
    const pagination = useAppSelector(
      (state) => state.fileManager[fmIndex].list?.pagination,
    );
    const search_params = useAppSelector(
      (state) => state.fileManager[fmIndex]?.search_params,
    );
    const galleryWidth = useAppSelector(
      (state) => state.fileManager[fmIndex].galleryWidth,
    );

    const mergedRef = useCallback(
      (val: any) => {
        mergeRefs(containerRef, ref)(val);
      },
      [containerRef, ref],
    );

    const list = useMemo(() => {
      const list: FmFile[] = [];
      if (!files) {
        return list;
      }

      files.forEach((file) => {
        list.push(file);
      });

      // Add loading placeholder if there is next page
      if (pagination && pagination.next_token) {
        for (let i = 0; i < loadingPlaceHolderNumb; i++) {
          const id = `loadingPlaceholder-${pagination.next_token}-${i}`;
          list.push({
            ...files[0],
            path: files[0].path + "/" + id,
            id: `loadingPlaceholder-${pagination.next_token}-${i}`,
            first: i == 0,
            placeholder: true,
          });
        }
      }
      return list;
    }, [files, pagination, search_params]);

    const resizeGallery = useCallback(
      (containerWidth: number, boxSize: number) => {
        const boxCount = Math.floor(containerWidth / boxSize);
        const newCols = Math.max(1, boxCount);
        const boxHeight = containerWidth / newCols;
        setBoxHeight(boxHeight);
        setCol(newCols);
      },
      [setBoxHeight, setCol],
    );

    useEffect(() => {
      if (!containerRef.current) return;
      const resizeObserver = new ResizeObserver(() => {
        const containerWidth = containerRef.current?.clientWidth ?? 100;
        resizeGallery(containerWidth, galleryWidth);
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect(); // clean up
    }, [galleryWidth]);

    return (
      <Box ref={mergedRef} component={"div"} {...rest} sx={{}}>
        <ImageList
          gap={2}
          cols={col}
          rowHeight={boxHeight}
          variant="quilted"
          sx={{
            overflow: "hidden",
            margin: 0,
          }}
        >
          {list.map((file, index) => (
            <DndWrappedFile
              key={file.id}
              component={GalleryImage}
              search={search_params}
              index={index}
              showThumb={true}
              file={file}
            />
          ))}
        </ImageList>
      </Box>
    );
  },
);

export default GalleryView;
