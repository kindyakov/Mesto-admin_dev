export function buildQueryParams(queryObject) {
  const queryParams = [];

  for (const key in queryObject) {
    if (queryObject[key] !== null && queryObject[key] !== undefined) {
      queryParams.push(`${key}=${encodeURIComponent(queryObject[key])}`);
    }
  }

  return queryParams.length ? `?${queryParams.join('&')}` : ''
}

export function mergeQueryParams(queryParams, newParams) {
  // Создаем копию queryParams для избежания мутаций
  const updatedQueryParams = { ...queryParams };

  // Итерируемся по каждому паре ключ-значение в передаваемых параметрах
  for (const key in newParams) {
    const value = newParams[key];

    // Если значение не является ни пустой строкой, ни null, обновляем или добавляем ключ
    if (value !== '' && value !== null) {
      updatedQueryParams[key] = value;
    } else {
      // Если значение пустое или null, удаляем ключ из updatedQueryParams
      delete updatedQueryParams[key];
    }
  }

  return updatedQueryParams;
}