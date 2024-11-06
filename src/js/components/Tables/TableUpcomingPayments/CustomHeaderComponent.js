class CustomHeaderComponent {
  init(params) {
    this.params = params;
    this.eGui = document.createElement('div');
    this.eGui.classList.add('custom-header');
    this.params.valueFormatter = this.params.valueFormatter || function (value) {
      return value
    }
    // Устанавливаем значение заголовка на основе params
    this.eGui.innerHTML = `<span style="color: #4f5b67;font-size:12px;">${this.getHeaderName()}</span>`;
  }

  getHeaderName() {
    let content = this.params.displayName
    const headersData = this.params.api.getGridOption('headersData')

    if (headersData) {
      content += ` <span class="text-info" style="font-size:12px;">${this.params.valueFormatter(headersData[this.params.headersDataKey])}</span>`
    }

    return content || 'Заголовок'; // пример с фиксированным заголовком
  }

  getGui() {
    return this.eGui;
  }

  destroy() {
    // Освобождаем ресурсы, если нужно
  }
}

export default CustomHeaderComponent