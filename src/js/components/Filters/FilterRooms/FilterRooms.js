import BaseFilter from "../BaseFilter.js";
import { filterHtml } from "./html.js"

export class FilterRooms extends BaseFilter {
  constructor(button, options = {}) {
    const defaultFilterValues = {
      area_start: 0,
      area_end: 10,
      price_start: 0,
      price_end: 30000,
      length_start: 0,
      length_end: 4,
      width_start: 0,
      width_end: 3,
      height_start: 0,
      height_end: 4,
    };
    super(button, { content: filterHtml(), ...options }, defaultFilterValues);
  }
}

export default FilterRooms