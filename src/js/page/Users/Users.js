import Page from "../Page.js"


class Users extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [],
      page: 'users'
    });
  }

  async getData(data = {}) {
    return []
  }
}

export default Users