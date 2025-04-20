import { BoxProps, Skeleton } from "@mui/material";
import { lazy, Suspense } from "react";
import { useAppSelector } from "../../../../redux/hooks.ts";

const MapBox = lazy(() => import("./LeafletMapBox.tsx"));

export interface MapLoaderProps extends BoxProps {
  height: number;
  center: [number, number];
  mapProvider?: string;
  googleTileType?: string;
}

const MapLoader = (props: MapLoaderProps) => {
  const mapProvider = useAppSelector(
    (state) => state.siteConfig.explorer.config.map_provider,
  );
  const googleTileType = useAppSelector(
    (state) => state.siteConfig.explorer.config.google_map_tile_type,
  );
  return (
    <Suspense
      fallback={
        <Skeleton variant="rounded" width={"100%"} height={props.height} />
      }
    >
      <MapBox
        mapProvider={mapProvider}
        googleTileType={googleTileType}
        {...props}
      />
    </Suspense>
  );
};

export default MapLoader;
