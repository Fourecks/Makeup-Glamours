import { Product, Slide, FaqItem } from './types';

export const LOGO_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAA5HSURBVHgB7d1NbBtXFAfw7x/2Yy92YgeCJEmQoEMBBQIHBtCDRAZERAQIEiRIkGCDjgqSBDWwoSEBHTQIHGihgQRIkCBxggQJ/AwBBVK/d77r/P74fr6uu7e615eP15t7d2dnZ3d2d3d3d2cGANgJvLu7O/9/B2sBAMh/7O7uzukBAMg5d3d3fgAAMuTu7s68u7u7+umnn+7u7s77AMCQe3d3Z9YG9wBgI+7u7s6YAwDMBLu7uzNjAwAzgbu7uzP2ACAzge7u7sw/AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu7u7MGACITqC7uztjACAyge7u7sw9AMhMQDu-/AAAAAElFTkSuQmCC';

export const SLIDES: Slide[] = [
  {
    id: 1,
    imageUrl: 'https://picsum.photos/1920/1080?random=1',
    title: 'Discover Your Glow',
    subtitle: 'High-performance, clean cosmetics that celebrate you. Shop our new collection.',
    buttonText: 'Shop Now',
  },
  {
    id: 2,
    imageUrl: 'https://picsum.photos/1920/1080?random=2',
    title: 'Summer Essentials',
    subtitle: 'Lightweight foundations and vibrant colors for a flawless summer look.',
    buttonText: 'Explore Collection',
  },
  {
    id: 3,
    imageUrl: 'https://picsum.photos/1920/1080?random=3',
    title: 'Vegan & Cruelty-Free',
    subtitle: 'Beauty that feels as good as it looks. Kind to your skin and the planet.',
    buttonText: 'Learn More',
  },
];

export const PRODUCTS: Product[] = [
    {
        id: 1,
        name: 'Velvet Matte Lipstick',
        price: 24.99,
        description: 'A rich, creamy, and long-lasting matte lipstick that glides on effortlessly, providing a velvety smooth finish. Infused with Vitamin E to keep your lips moisturized and comfortable all day long.',
        category: 'Lips',
        images: ['https://picsum.photos/800/800?random=11', 'https://picsum.photos/800/800?random=12', 'https://picsum.photos/800/800?random=13', 'https://picsum.photos/800/800?random=14'],
        stock: 15,
    },
    {
        id: 2,
        name: 'Luminous Glow Foundation',
        price: 39.50,
        description: 'Achieve a radiant, flawless complexion with our lightweight foundation. This buildable formula provides medium coverage with a natural, dewy finish that lasts all day without caking.',
        category: 'Face',
        images: ['https://picsum.photos/800/800?random=15', 'https://picsum.photos/800/800?random=16'],
        stock: 10,
    },
    {
        id: 3,
        name: 'Waterproof Liquid Eyeliner',
        price: 19.99,
        description: 'Define your eyes with precision. Our ultra-fine tip liquid eyeliner is intensely pigmented, waterproof, and smudge-proof, ensuring your look stays perfect from morning to night.',
        category: 'Eyes',
        images: ['https://picsum.photos/800/800?random=17', 'https://picsum.photos/800/800?random=18'],
        stock: 0, // Sold out
    },
    {
        id: 4,
        name: 'Hydrating Rosewater Mist',
        price: 28.00,
        description: 'A refreshing facial mist that hydrates and soothes the skin. Formulated with pure rosewater, it can be used to set makeup, refresh your skin throughout the day, or as a lightweight toner.',
        category: 'Skincare',
        images: ['https://picsum.photos/800/800?random=19', 'https://picsum.photos/800/800?random=20'],
        stock: 25,
    },
    {
        id: 5,
        name: 'Sunset Glow Eyeshadow Palette',
        price: 45.00,
        description: 'Create endless looks with 12 stunning shades inspired by a sunset. This palette features a mix of matte, shimmer, and metallic finishes with a buttery-smooth, blendable formula.',
        category: 'Eyes',
        images: ['https://picsum.photos/800/800?random=21', 'https://picsum.photos/800/800?random=22'],
        stock: 8,
    },
    {
        id: 6,
        name: 'Plumping Lip Gloss',
        price: 22.00,
        description: 'Get fuller-looking lips with a high-shine finish. Our non-sticky lip gloss is infused with hyaluronic acid to hydrate and plump, leaving your lips feeling soft and looking luscious.',
        category: 'Lips',
        images: ['https://picsum.photos/800/800?random=23', 'https://picsum.photos/800/800?random=24'],
        stock: 12,
    },
    {
        id: 7,
        name: 'Gentle Cleansing Balm',
        price: 32.00,
        description: 'Melt away makeup, dirt, and impurities with this nourishing cleansing balm. It transforms from a solid balm to a silky oil, leaving your skin feeling clean, soft, and hydrated without stripping it.',
        category: 'Skincare',
        images: ['https://picsum.photos/800/800?random=25', 'https://picsum.photos/800/800?random=26'],
        stock: 5,
    },
    {
        id: 8,
        name: 'Brow Sculpting Gel',
        price: 18.50,
        description: 'Tame, shape, and set your brows in place all day. This clear brow gel has a lightweight, flexible formula that grooms brow hairs without feeling stiff or flaky.',
        category: 'Eyes',
        images: ['https://picsum.photos/800/800?random=27', 'https://picsum.photos/800/800?random=28'],
        stock: 20,
    }
];

export const FAQS: FaqItem[] = [
  {
    id: 1,
    question: 'Are your products cruelty-free?',
    answer: 'Yes, all of our products are 100% cruelty-free. We are certified by Leaping Bunny and do not test on animals at any stage of product development.',
  },
  {
    id: 2,
    question: 'What is your return policy?',
    answer: 'We offer a 30-day satisfaction guarantee. If you\'re not happy with your purchase, you can return it for a full refund or exchange. Please visit our returns page for more details.',
  },
  {
    id: 3,
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. You can see the specific details at checkout.',
  },
  {
    id: 4,
    question: 'Are your products vegan?',
    answer: 'The majority of our products are vegan. You can find a full list of ingredients on each product page. Look for the vegan symbol to easily identify them.',
  },
];

export const CATEGORIES = ['All', ...new Set(PRODUCTS.map(p => p.category))];