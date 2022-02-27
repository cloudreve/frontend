import Chunk, { ChunkInfo } from "./chunk";
import { loadUploadChunk } from "../api";

export default class Local extends Chunk {
    protected async uploadChunk(chunkInfo: ChunkInfo) {
        return loadUploadChunk(
            this.task.session?.sessionID!,
            chunkInfo,
            (p) => {
                this.updateChunkProgress(p.loaded, chunkInfo.index);
            },
            this.cancelToken.token
        );
    }
}
