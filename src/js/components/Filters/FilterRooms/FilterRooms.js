import BaseFilter from "../BaseFilter.js";
import { filterHtml } from "./html.js"

export class FilterRooms extends BaseFilter {
  constructor(button, options = {}) {
    const defaultFilterValues = {
      area_start: 0,
      area_end: 100,
      price_start: 0,
      price_end: 200000,
      length_start: 0,
      length_end: 40,
      width_start: 0,
      width_end: 40,
      height_start: 0,
      height_end: 40,
    };
    super(button, { content: filterHtml(), ...options }, defaultFilterValues);
  }
}

export default FilterRooms