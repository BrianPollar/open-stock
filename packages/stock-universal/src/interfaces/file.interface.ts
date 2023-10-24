/** */
/**
 * Represents a file with its directory information.
 */
export interface Ifilewithdir {
  /**
   * The name of the file.
   */
  filename: string;
  /**
   * The directory where the file is stored.
   */
  storageDir: string;
  /**
   * The unique identifier of the file.
   */
  id?: string;
}
