// import axios from "axios";
import { createElement } from "../../settings/createElement.js";
import Page from "../Page.js"
// import { dateFormatter } from "../../settings/dateFormatter.js";

class MestoPlan extends Page {
  constructor({ loader }) {
    super({
      loader,
      page: 'mesto-plan'
    });

    this.iframe = createElement('iframe', {
      attributes: [
        ['style', 'position: absolute;left: 0;top: 0;right: 0;width: 100%;height: 100%;'],
        ['src', 'https://docs.google.com/spreadsheets/d/1pJStDxaxum2__G4Rr0WdH-MAXa1ARYIxZeWhpzETC2c/edit?usp=sharing?widget=true&amp;headers=false']
      ]
    })
    
    this.wrapper.appendChild(this.iframe)
    setTimeout(() => this.loader.enable())
    this.iframe.onload = () => {
      this.loader.disable()
    };
    // this.getTable()
  }

  // createTable([titles, ...data]) {
  //   console.log()

  //   const table = this.wrapper.querySelector('.google-table')
  //   const tHead = table.querySelector('thead')
  //   const tBody = table.querySelector('tbody')

  //   table.parentElement.style.cssText = `max-width: ${this.wrapper.clientWidth}px;`

  //   tHead.innerHTML = `<tr>${titles.map(title => `<th>${title}</th>`).join('')}</tr>`
  //   tBody.innerHTML = [...data].map(arr => `<tr>${arr.map((ct, i) => {
  //     let content = ct

  //     if (i == 0 && content) {
  //       content = !isNaN(new Date(content).getTime()) ? dateFormatter(new Date(content)) : content;
  //     }

  //     return `<td>${content}</td>`
  //   }).join('')}</tr>`).join('')
  // }

  // async getTable() {
  //   try {
  //     setTimeout(() => { this.loader.enable() })

  //     const response = await axios.get('https://script.google.com/macros/s/AKfycbwnw5_7Rwp-yUFyrIHFKz9w1JqcidznDU6VhIIm46zeM1GbLZGuloDUiFW5cbJ1o-8B/exec')
  //     if (response.status !== 200) return
  //     const { result } = response.data

  //     const filtered = result.filter(subArray => {
  //       return subArray.length > 0 && subArray.some(element => element !== "");
  //     });

  //     this.createTable(filtered)
  //   } catch (error) {
  //     throw error;
  //   } finally {
  //     this.loader.disable()
  //   }
  // }
}

export default MestoPlan