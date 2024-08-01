export const inputValidator = {
  numeric: function (input) {
    input.value = input.value.replace(/\D/g, '');
    return input
  },
  decimal: function (input) {
    input.value = input.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    return input
  },
  price: function (input) {
    function formatPrice(value) {
      const sanitizedValue = value.replace(/[^-0-9]/g, '');
      let formattedValue = '';

      if (sanitizedValue.length) {
        for (let i = 0; i < sanitizedValue.length; i++) {
          if (i > 0 && (sanitizedValue.length - i) % 3 === 0) {
            formattedValue += ',';
          }
          formattedValue += sanitizedValue[i];
        }

        return formattedValue + ' ₽';
      } return ''
    }

    function handleKeydown(e) {
      if (e.key === 'Backspace') {
        e.preventDefault();
        let value = input.value.replace(/[^0-9]/g, '');
        value = value.slice(0, -1);
        input.value = value.length > 0 ? formatPrice(value) : '';
      }
    }

    input.value = formatPrice(input.value)

    input.removeEventListener('keydown', handleKeydown)
    input.addEventListener('keydown', handleKeydown);
    
    return input
  }
};