import Page from "../Page.js"
import { createElement } from "../../settings/createElement.js";

class MestoBudget extends Page {
  constructor({ loader }) {
    super({
      loader,
      page: 'mesto-budget'
    });

    this.iframe = createElement('iframe', {
      attributes: [
        ['style', 'position: absolute;left: 0;top: 0;right: 0;width: 100%;height: 100%;'],
        ['src', 'https://docs.google.com/spreadsheets/d/1xTQmwkLTVLZMJdW6m0MfoLzuZV3f_l1iU6nHjqYfyGo/edit?usp=sharing?widget=true&amp;headers=false']
      ]
    })

    this.wrapper.appendChild(this.iframe)
    setTimeout(() => this.loader.enable())
    this.iframe.onload = () => {
      this.loader.disable()
    };
  }
}

export default MestoBudget