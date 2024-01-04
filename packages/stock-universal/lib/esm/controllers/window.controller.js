/**
 * Represents a controller for manipulating the window object.
 */
export class WindowController {
    /**
     * Creates a new instance of the WindowController class.
     * @param doc - The document object associated with the window.
     */
    constructor(doc) {
        this.doc = doc;
    }
    /**
     * Gets the window object associated with the document.
     * @returns The window object or null if not available.
     */
    getWindow() {
        return this.doc.defaultView;
    }
    /**
     * Gets the location object associated with the document.
     * @returns The location object.
     */
    getLocation() {
        return this.doc.location;
    }
    /**
     * Creates a new HTML element with the specified tag name.
     * @param tag - The tag name of the element to create.
     * @returns The created HTML element.
     */
    createElement(tag) {
        return this.doc.createElement(tag);
    }
}
//# sourceMappingURL=window.controller.js.map