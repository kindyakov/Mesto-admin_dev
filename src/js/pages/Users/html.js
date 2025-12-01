export function employeeHtml(data) {
  return `<div class="employee__body">
        <div class="employee__img">
          <img src="./img/ava.jpg">
        </div>
        <div class="employee__content">
          <h6>${data.manager_fullname ? data.manager_fullname : ''}</h6>
          <span>${data.role ? data.role : ''}</span>
        </div>
        <button class="button-actions">
          <svg viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon">
            <path
              d="M2 0C0.9 0 0 0.9 0 2C0 3.1 0.9 4 2 4C3.1 4 4 3.1 4 2C4 0.9 3.1 0 2 0ZM14 0C12.9 0 12 0.9 12 2C12 3.1 12.9 4 14 4C15.1 4 16 3.1 16 2C16 0.9 15.1 0 14 0ZM8 0C6.9 0 6 0.9 6 2C6 3.1 6.9 4 8 4C9.1 4 10 3.1 10 2C10 0.9 9.1 0 8 0Z" />
          </svg>
        </button>
      </div>
      <button class="button-open-subordinates">
        <svg class='icon icon-plus'>
          <use xlink:href='#plus'></use>
        </svg>
        <svg viewBox="0 0 8 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-arrow">
          <path
            d="M3.64645 16.3536C3.84171 16.5488 4.15829 16.5488 4.35355 16.3536L7.53553 13.1716C7.7308 12.9763 7.7308 12.6597 7.53553 12.4645C7.34027 12.2692 7.02369 12.2692 6.82843 12.4645L4 15.2929L1.17157 12.4645C0.976311 12.2692 0.659728 12.2692 0.464466 12.4645C0.269204 12.6597 0.269204 12.9763 0.464466 13.1716L3.64645 16.3536ZM3.5 0V2.28571H4.5V0H3.5ZM3.5 5.71429V10.2857H4.5V5.71429H3.5ZM3.5 13.7143V16H4.5V13.7143H3.5Z" />
        </svg>
      </button>

      <div class="subordinates">
        
      </div>`
}

export function accessesPopupHtml(data) {
  return `
  <div class="accesses-popup">
    <h5 class="accesses-popup__title">Доступы</h5>
    <div class="accesses-popup__content" style="max-height: 200px;overflow-y: auto;">
      <label>
        <input type="checkbox" name="can_set_accesses" ${data.can_set_accesses ? 'checked' : ''}>
        <p>Можно устанавливать доступы</p>
      </label>  
      <label>
        <input type="checkbox" name="can_see_users" ${data.can_see_users ? 'checked' : ''}>
        <p>Можно смотреть вкладку <u>Пользователи</u></p>
      </label>
      <label>
        <input type="checkbox" name="can_see_users_worktime" ${data.can_see_users_worktime ? 'checked' : ''}>
        <p>Можно смотреть рабочее время остальных</p>
      </label>
      <label>
        <input type="checkbox" name="needs_time_control" ${data.needs_time_control ? 'checked' : ''}>
        <p>Нужен контроль рабочего времени</p>
      </label>
      <label>
        <input type="checkbox" name="can_see_room_prices" ${data.can_see_room_prices ? 'checked' : ''}>
        <p>Можно смотреть вкладку <u>Цены ячеек</u></p>
      </label>
      <label>
        <input type="checkbox" name="can_see_dasboards" ${data.can_see_dasboards ? 'checked' : ''}>
        <p>Можно смотреть раздел <u>Дашборды</u></p>
      </label>
      <label>
        <input type="checkbox" name="can_edit_payments" ${data.can_edit_payments ? 'checked' : ''}>
        <p>Можно редактировать платежи</p>
      </label>
      <label>
        <input type="checkbox" name="can_edit_next_payment_date" ${data.can_edit_next_payment_date ? 'checked' : ''}>
        <p>Можно редактировать даты предстоящих платежей</p>
      </label>
      <label>
        <input type="checkbox" name="can_add_returns" ${data.can_add_returns ? 'checked' : ''}>
        <p>Можно добавлять возвраты</p>
      </label>
      <label>
        <input type="checkbox" name="can_edit_agreement_price" ${data.can_edit_agreement_price ? 'checked' : ''}>
        <p>Можно редактировать стоимость аренды в договоре</p>
      </label>
      <label>
        <input type="checkbox" name="can_edit_agreement_deposit" ${data.can_edit_agreement_deposit ? 'checked' : ''}>
        <p>Можно редактировать депозит в договоре</p>
      </label>
      <label>
        <input type="checkbox" name="can_change_moving_out_date" ${data.can_change_moving_out_date ? 'checked' : ''}>
        <p>Можно планировать выезд клиента</p>
      </label>
      <label>
        <input type="checkbox" name="can_change_return_amount" ${data.can_change_return_amount ? 'checked' : ''}>
        <p>Можно менять сумму к возврату при выезде</p>
      </label>
      <label>
        <input type="checkbox" name="can_see_effectiveness" ${data.can_see_effectiveness ? 'checked' : ''}>
        <p>Может смотреть Дашборд Эффективность</p>
      </label>
    </div>
  </div>`
}