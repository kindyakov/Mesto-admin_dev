import Page from "../Page.js"
import { chatItemHtml, chatHtml, chatMessageHtml } from "./html.js";
import { api } from "../../settings/api.js";
import { getMessagesHistory, getManagersList } from "../../settings/request.js";
import { outputInfo } from "../../utils/outputinfo.js";

import { Tabs } from "../../modules/myTabs.js"
import { createElement } from "../../settings/createElement.js";
import { dateFormatter } from "../../settings/dateFormatter.js";

class Messages extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [],
      page: 'messages'
    });

    this.tabs = new Tabs({
      btnSelector: '._chat-tab-btn',
      contentSelector: '._chat-tab-content',
    })

    this.chatEl = this.wrapper.querySelector('.chat');
    this.chatAsideEl = this.chatEl.querySelector('.chat-aside');
    this.chatBodyEl = this.chatEl.querySelector('.chat-body');
    this.chatsList = this.chatEl.querySelector('.chats-list')

    this.timerResize = null;
    this.mdMobile = window.matchMedia('(max-width: 630px)')

    window.addEventListener('resize', this.handleResize.bind(this));
    this.chatEl.addEventListener('click', this.handleClick.bind(this))
    this.chatEl.addEventListener('change', this.handleChange.bind(this))
    this.chatEl.addEventListener('submit', this.handleSubmit.bind(this))

    this.calcHeightMessagesContent(this.chatEl.querySelector('.chat-messages'));

    this.tabs.onChange = ({ nextTabBtn, nextTabContent }) => {
      const managerId = nextTabBtn.getAttribute('data-manager-id')
      const chatMessagesContent = nextTabContent.querySelector('.chat-messages-content')
      this.renderChat(managerId, chatMessagesContent)
      if (this.mdMobile.matches) {
        this.chatAsideEl.classList.remove('_open')
      }
    }
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

  handleClick(e) {
    if (e.target.closest('.btn-open-chats')) {
      this.chatAsideEl.classList.add('_open')
    }
  }

  handleResize(e) {
    clearTimeout(this.timerResize);
    this.timerResize = setTimeout(() => {
      this.calcHeightMessagesContent(this.chatEl.querySelector('.chat-messages'));
    }, 100);
  }

  handleChange(e) {
    if (e.target.classList.contains('input-load-file')) {
      this.handleChangeLoadFile(e)
    }
  }

  handleSubmit(e) {
    e.preventDefault()
    if (e.target.classList.contains('form-send-msg')) {
      this.handleSubmitFormSend(e)
    }
  }

  handleChangeLoadFile(e) {
    const input = e.target

    const files = e.target.files
    const reader = new FileReader();

    reader.onload = (e) => {
      this.loadPreviewFile(e, input)
    }

    files.length && Array.from(files).forEach(file => reader.readAsDataURL(file))

    // const dataTransfer = new DataTransfer();
    // dataTransfer.items.add(file);
  }

  handleSubmitFormSend(e) {
    const form = e.target
    const chatMessagesContent = form.closest('.chat-messages').querySelector('.chat-messages-content')
    const formData = new FormData(form)
    let isValid = false, data = {}

    Array.from(formData).forEach(arr => {
      const [name, value] = arr

      if (name === 'message_text' && value !== '' ||
        name === 'file' && value.size
      ) {
        isValid = true
      }

      data[name] = value
    })

    if (isValid) {
      data.message_datetime = `${dateFormatter(new Date, "yyyy-MM-dd")} ${dateFormatter(new Date, "HH:mm:ss")}`
      this.sendMessage(formData).then(res => {
        if (res.msg_type === 'success') {
          const fileList = form.closest('.chat-messages-bottom').querySelector('.file-list')

          fileList.innerHTML = ''
          fileList.classList.remove('_open')

          form.reset()
          chatMessagesContent.insertAdjacentHTML('beforeend', chatMessageHtml(data))
          chatMessagesContent.scrollTo({ top: chatMessagesContent.scrollHeight })

        }
      })
    }
  }

  loadPreviewFile(e, input) {
    const fileListEl = input.closest('.chat-messages-bottom').querySelector('.file-list')
    const typeFile = e.target.result.split(';')[0].split(':')[1].split('/')[0]
    const item = createElement('li', { classes: ['chat__messages_file'], content: `<div class="preview">${typeFile === 'image' ? `<img src="${e.target.result}">` : `<svg class='icon icon-file'><use xlink:href='img/svg/sprite.svg#file'></use></svg>`}</div>` })
    const btnDel = createElement('button', { classes: ['btn-del'], content: `<svg class='icon icon-close'><use xlink:href='img/svg/sprite.svg#close'></use></svg>` })


    btnDel.addEventListener('click', () => {
      console.log(e.target, input.files)

      item.remove()
      if (!fileListEl.children.length) {
        fileListEl.classList.remove('_open')
      }
    })

    item.appendChild(btnDel)
    fileListEl.appendChild(item)
    fileListEl.classList.add('_open')
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

  // onRender(dataRooms) {}

  async getData(params = {}) {
    return getManagersList(params)
  }

  async render(queryParams = {}) {
    try {
      this.loader.enable()
      const { managers = [] } = await getManagersList(queryParams)
      if (!managers.length) return
      const { messages = [] } = await getMessagesHistory({ second_manager_id: managers[0].manager_id })
      managers[0].messages = messages
      this.chatsList.innerHTML = managers.map(manager => chatItemHtml(manager)).join('')
      this.chatBodyEl.innerHTML = managers.map(manager => chatHtml(manager)).join('')

      this.tabs.init()

      const [chatMessagesActive] = this.tabs.contentActive
      const chatMessagesContent = chatMessagesActive.querySelector('.chat-messages-content')
      chatMessagesContent.scrollTo({ top: chatMessagesContent.scrollHeight })

      this.chatEl.querySelector('[data-count-chats]')?.setAttribute('data-count-chats', managers.length)
      this.onRender(managers)
    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async renderChat(manager_id, chatMessagesContent) {
    try {
      this.loader.enable()
      const { messages = [] } = await getMessagesHistory({ second_manager_id: manager_id })
      if (!messages.length) return
      chatMessagesContent.innerHTML = messages.reverse().map(message => chatMessageHtml(message, manager_id === message.from_manager_id ? 'message-received' : 'message-sent')).join('')
      chatMessagesContent.scrollTo({ top: chatMessagesContent.scrollHeight })

    } catch (error) {
      console.error(error)
    } finally {
      this.loader.disable()
    }
  }

  async sendMessage(formData) {
    try {
      this.loader.enable()
      const response = await api.post('/_send_message_', formData)
      if (response.status !== 200) return
      outputInfo(response.data)
      return response.data
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      this.loader.disable()
    }
  }
}

export default Messages;