/**
 * Represents a controller for manipulating the window object.
 */
export declare class WindowController {
    doc: Document;
    /**
     * Creates a new instance of the WindowController class.
     * @param doc - The document object associated with the window.
     */
    constructor(doc: Document);
    /**
     * Gets the window object associated with the document.
     * @returns The window object or null if not available.
     */
    getWindow(): Window | null;
    /**
     * Gets the location object associated with the document.
     * @returns The location object.
     */
    getLocation(): Location;
    /**
     * Creates a new HTML element with the specified tag name.
     * @param tag - The tag name of the element to create.
     * @returns The created HTML element.
     */
    createElement(tag: string): HTMLElement;
}
