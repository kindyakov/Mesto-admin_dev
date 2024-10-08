export function chatItemHtml(data) {
  return `
  <li class="chat__aside_item _chat-tab-btn" data-tab-btn="chat,${data.manager_id}" data-manager-id="${data.manager_id}">
            <div class="wp-img">
              <div class="img">
                <img src="">
              </div>
              <span class="status-user"></span>
            </div>
            <div class="inner">
              <p class="name">${data.manager_fullname ? data.manager_fullname : ''}</p>
              <span class="last-msg">${data.last_msg ? data.last_msg : ''}</span>
            </div>
          </li>`
}

export function chatHtml(data) {
  return `
  <div class="chat__messages chat-messages _chat-tab-content" data-tab-content="chat,${data.manager_id}">
        <div class="chat__messages_header chat-messages-header">
          <div class="chat__messages_header-chat">
            <button class="button-back btn-open-chats">
              <svg class="icon icon-arrow">
                <use xlink:href="img/svg/sprite.svg#arrow"></use>
              </svg>
            </button>
            <div class="img">
              <img src="">
            </div>
            <div class="inner">
              <p class="name">${data.manager_fullname ? data.manager_fullname : ''}</p>
              <!-- <span>Печатает...</span> -->
            </div>
          </div>
          <button class="chat__messages_header-button-actions button-actions">
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2 10C3.10457 10 4 9.10457 4 8C4 6.89543 3.10457 6 2 6C0.89543 6 0 6.89543 0 8C0 9.10457 0.89543 10 2 10Z" />
              <path
                d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" />
              <path
                d="M14 10C15.1046 10 16 9.10457 16 8C16 6.89543 15.1046 6 14 6C12.8954 6 12 6.89543 12 8C12 9.10457 12.8954 10 14 10Z" />
            </svg>
          </button>
        </div>

        <div class="chat__messages_content chat-messages-content">
          ${data.messages?.length ? data.messages.reverse().map(msg => chatMessageHtml(msg, data.manager_id === msg.from_manager_id ? 'message-received' : 'message-sent')).join('') : ''}
        </div>

        <div class="chat__messages_bottom chat-messages-bottom">
          <ul class="chat__messages_file-list file-list">
            
          </ul>
          <form class="chat__form-send form-send-msg">
            <input type="text" name="second_manager_id" value="${data.manager_id}" style="display: none;">
            <div class="wp-input">
              <input type="text" name="message_text" placeholder="Напишите что нибудь..." autocomplete="off"
                class="chat__textarea input input-value-msg">
              <label class="load-file">
                <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M11.835 1.79102C11.2378 1.79102 10.6651 2.02824 10.2428 2.45051L3.3503 9.34302C2.64657 10.0467 2.25122 11.0012 2.25122 11.9964C2.25122 12.9917 2.64657 13.9461 3.3503 14.6499C4.05403 15.3536 5.0085 15.7489 6.00372 15.7489C6.99895 15.7489 7.95341 15.3536 8.65714 14.6499L15.5496 7.75736C15.8425 7.46446 16.3174 7.46446 16.6103 7.75736C16.9032 8.05025 16.9032 8.52512 16.6103 8.81802L9.7178 15.7105C8.73277 16.6956 7.39677 17.2489 6.00372 17.2489C4.61067 17.2489 3.27468 16.6956 2.28964 15.7105C1.30461 14.7255 0.751221 13.3895 0.751221 11.9964C0.751221 10.6034 1.30461 9.26739 2.28964 8.28236L9.18214 1.38985C9.88572 0.686279 10.84 0.291016 11.835 0.291016C12.83 0.291016 13.7842 0.686279 14.4878 1.38985C15.1914 2.09343 15.5866 3.04768 15.5866 4.04268C15.5866 5.03769 15.1914 5.99194 14.4878 6.69552L7.5878 13.588C7.16569 14.0101 6.59318 14.2473 5.99622 14.2473C5.39926 14.2473 4.82676 14.0101 4.40464 13.588C3.98253 13.1659 3.74539 12.5934 3.74539 11.9964C3.74539 11.3995 3.98253 10.827 4.40464 10.4049L10.7725 4.04454C11.0655 3.75182 11.5404 3.7521 11.8331 4.04517C12.1258 4.33823 12.1256 4.81311 11.8325 5.10583L5.4653 11.4655C5.32469 11.6063 5.24539 11.7974 5.24539 11.9964C5.24539 12.1956 5.32449 12.3865 5.4653 12.5274C5.60611 12.6682 5.79709 12.7473 5.99622 12.7473C6.19535 12.7473 6.38633 12.6682 6.52714 12.5274L13.4271 5.63486C13.8492 5.21261 14.0866 4.63973 14.0866 4.04268C14.0866 3.4455 13.8494 2.87278 13.4271 2.45051C13.0049 2.02824 12.4321 1.79102 11.835 1.79102Z" />
                </svg>
                <input type="file" class="input-load-file" name="file" multiple>
              </label>
            </div>
            <button class="chat__button-send button-send-msg">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon">
                <path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
          </form>
        </div>

      </div>`
}

export function chatMessageHtml(data, typeMsg = 'message-sent') {
  return `
  <div class="chat__message ${typeMsg}">
  <div class="chat__message_bubble">
    <p>${data.message_text ? data.message_text : ''}${data.attachment_link ? data.attachment_link : ''}</p>
  </div>
  <span class="chat__message_timestamp">${data.message_datetime ? data.message_datetime : ''}</span>
</div>`
}

export function name(data) {
  return `
  <li class="chat__messages_file">
              <div class="preview">${data.previ}</div>
              <button class="btn-del">
                <svg class='icon icon-close'>
                  <use xlink:href='img/svg/sprite.svg#close'></use>
                </svg>
              </button>
            </li>`
}