import path from "path";
import process from "process"
export const getFilePath = (...fileParts: string[]) => path.join(process.cwd(), "profile-data", ...fileParts);

export function constructSourcePath(...pieces: string[]) {
    return path.join(process.cwd(), "source-maps", ...pieces);
}