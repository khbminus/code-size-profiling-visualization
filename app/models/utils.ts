import path from "path";
import process from "process"
export const getFilePath = (...fileParts: string[]) => path.join(process.cwd(), "profile-data", ...fileParts);