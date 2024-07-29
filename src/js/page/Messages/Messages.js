import Page from "../Page.js"

class Messages extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [],
      page: 'messages'
    });

    this.chatEl = this.wrapper.querySelector('.chat');
    this.chatAsideEl = this.chatEl.querySelector('.chat-aside');
    this.chatBodyEl = this.chatEl.querySelector('.chat-body');
    this.formSendMsg = this.chatEl.querySelector('.formSendMsg');
    this.inputValueMsg = this.chatEl.querySelector('.input-value-msg');

    this.timerResize = null;
    this.mdMobile = window.matchMedia('(max-width: 630px)')

    window.addEventListener('resize', this.handleResize.bind(this));
    this.calcHeightMessagesContent(this.chatEl.querySelector('.chat-messages'));
  }

  // Метод для отображения сообщений
  renderMessage(messageData) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';

    switch (messageData.type) {
      case 'text':
        messageElement.innerHTML = `<p>${this.formatText(messageData.content)}</p>`;
        break;
      case 'image':
        messageElement.innerHTML = `
          <a href="${messageData.content}" data-fancybox="chat" data-caption="Image">
            <img src="${messageData.content}" alt="Image" />
          </a>`;
        break;
      case 'video':
        messageElement.innerHTML = `
          <a href="${messageData.content}" data-fancybox="chat" data-caption="Video">
            <img src="${messageData.meta.thumbnail}" alt="Video Thumbnail" />
          </a>`;
        break;
      case 'file':
        messageElement.innerHTML = `
          <a href="${messageData.content}" target="_blank">
            ${messageData.meta.fileName || 'Download File'}
          </a>`;
        break;
      default:
        console.log('Unknown message type:', messageData.type);
    }

    console.log(messageElement)
  }

  // Пример обработки текста с ссылками
  formatText(text) {
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
  }

  async getData(params = {}) {
    return [];
  }

  handleResize(e) {
    clearTimeout(this.timerResize);
    this.timerResize = setTimeout(() => {
      this.calcHeightMessagesContent(this.chatEl.querySelector('.chat-messages'));
    }, 100);
  }

  calcHeightMessagesContent(messages = this.chatEl.querySelector('.chat-messages._active')) {
    if (!messages) return;
    const header = messages.querySelector('.chat-messages-header');
    const content = messages.querySelector('.chat-messages-content');
    const bottom = messages.querySelector('.chat-messages-bottom');
    const contentHtml = content.innerHTML;
    const contentScroll = content.scrollTop;

    content.style.maxHeight = '';
    content.innerHTML = '';

    let height = messages.offsetHeight - (header.clientHeight + bottom.clientHeight);

    content.style.maxHeight = height + 'px';
    content.innerHTML = contentHtml;
    if (content.scrollHeight > height && contentScroll) {
      content.scrollTo({ top: contentScroll });
    }
  }

  onRender(dataRooms) {
  }
}

export default Messages;