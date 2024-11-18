export function determineType(value) {
  const type = Object.prototype.toString.call(value);

  switch (type) {
    case '[object String]':
      return 'string';
    case '[object Number]':
      return 'number';
    case '[object Boolean]':
      return 'boolean';
    case '[object Undefined]':
      return 'undefined';
    case '[object Null]':
      return 'null';
    case '[object Array]':
      return 'array';
    case '[object Object]':
      return 'object';
    case '[object Function]':
      return 'function';
    case '[object Date]':
      return 'date';
    case '[object RegExp]':
      return 'regexp';
    case '[object Set]':
      return 'set';
    case '[object Map]':
      return 'map';
    case '[object BigInt]':
      return 'bigint';
    case '[object Symbol]':
      return 'symbol';
    default:
      return 'unknown';
  }
}