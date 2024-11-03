import Page from "../Page.js"
import { createElement } from "../../settings/createElement.js";

class PricesRooms extends Page {
  constructor({ loader }) {
    super({
      loader,
      page: 'prices-rooms'
    });

    this.iframe = createElement('iframe', {
      attributes: [
        ['style', 'position: absolute;left: 0;top: 0;right: 0;width: 100%;height: 100%;'],
        ['src', 'https://docs.google.com/spreadsheets/d/1yMoTmjlNPoBwZff276nEYN6C3wujzpb_VzGzMNi8c-Q/edit?usp=sharing?widget=true&amp;headers=false']
      ]
    })

    this.wrapper.appendChild(this.iframe)
    setTimeout(() => this.loader.enable())
    this.iframe.onload = () => {
      this.loader.disable()
    };
  }
}

export default PricesRooms