import BaseFilter from "../BaseFilter.js";
import { filterHtml } from "./html.js"

export class FilterLocks extends BaseFilter {
  constructor(button, options = {}) {
    const defaultFilterValues = {
      electric_quantity_start: 0,
      electric_quantity_end: 100,
    };
    super(button, { content: filterHtml(), ...options }, defaultFilterValues);
  }
}

export default FilterLocks