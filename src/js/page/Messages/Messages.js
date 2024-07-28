import Page from "../Page.js"

class Messages extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [],
      page: 'messages'
    })

    this.chatEl = this.wrapper.querySelector('.chat')
    this.chatAsideEl = this.chatEl.querySelector('.chat-aside')
    this.chatBodyEl = this.chatEl.querySelector('.chat-body')

    this.timerResize = null

    window.addEventListener('resize', this.handleResize.bind(this))
    this.calcHeightMessagesContent(this.chatEl.querySelector('.chat-messages'))
  }

  async getData(params = {}) {
    return []
  }

  handleResize(e) {
    clearTimeout(this.timerResize)
    this.timerResize = setTimeout(() => {
      this.calcHeightMessagesContent(this.chatEl.querySelector('.chat-messages'))
    }, 100);
  }

  calcHeightMessagesContent(messages = this.chatEl.querySelector('.chat-messages._active')) {
    if (!messages) return
    const header = messages.querySelector('.chat-messages-header')
    const content = messages.querySelector('.chat-messages-content')
    const bottom = messages.querySelector('.chat-messages-bottom')
    const contentHtml = content.innerHTML
    const contentScroll = content.scrollTop

    content.style.maxHeight = ''
    content.innerHTML = ''

    let height = messages.offsetHeight - (header.clientHeight + bottom.clientHeight)

    content.style.maxHeight = height + 'px'
    content.innerHTML = contentHtml
    if (content.scrollHeight > height && contentScroll) {
      content.scrollTo({ top: contentScroll, })
    }
  }

  onRender(dataRooms) {
  }
}

export default Messages