import { v4 as uuidv4 } from 'uuid'
import Page from "../Page.js"
import TableEmployee from '../../components/Tables/TableEmployee/TableEmployee.js';
import { api } from "../../settings/api.js";
import { rowHtml } from "./html.js";
import { outputInfo } from "../../utils/outputinfo.js"
import modalDownloadPhotoWh from "../../components/Modals/ModalDownloadPhotoWh/ModalDownloadPhotoWh.js"
import { getCurrentTimeString } from '../../utils/getCurrentTimeString.js';

class WorkingHours extends Page {
  constructor({ loader }) {
    super({
      loader,
      tables: [
        // {
        //   tableSelector: '.table-employee',
        //   TableComponent: TableEmployee,
        //   options: {
        //     paginationPageSize: 15
        //   }
        // }
      ],
      page: 'working-hours'
    });

    this.timePoints = []
    this.timePoint = null

    this.init()
  }

  init() {
    if (!this.wrapper) return
    this.workingHours = this.wrapper.querySelector('.working-hours')

    this.events()
  }

  events() {
    modalDownloadPhotoWh.onOpen = params => {
      if (!params) return
      this.timePoint = modalDownloadPhotoWh.extractData(params)
    }

    modalDownloadPhotoWh.onSave = () => {
      if (modalDownloadPhotoWh.file) {
        const reader = new FileReader();
        const formData = new FormData()
        let time, photo

        if (this.timePoint.start_or_end === 'start') {
          time = 'time_start'
          photo = 'start_photo_link'
        } else {
          photo = 'end_photo_link'
          time = 'time_end'
        }

        reader.onload = (e) => this.timePoint[photo] = e.target.result;
        reader.readAsDataURL(modalDownloadPhotoWh.file)

        formData.append('file', modalDownloadPhotoWh.file)
        formData.append('start_or_end', photo)

        this.timePoint[time] = getCurrentTimeString(':')
        this.addTimePoint(formData)
      } else {
        modalDownloadPhotoWh.label.classList.add('_error')
      }
    }
  }

  checkAndInsert(workDays) {
    const today = new Date().toISOString().split('T')[0]; // Получаем текущую дату в формате "YYYY-MM-DD"
    const todayEntry = workDays.find(day => day.date === today);

    workDays.forEach(data => {
      data.id = uuidv4()
      this.workingHours.insertAdjacentHTML('beforeend', rowHtml(data));
    });

    if (!todayEntry) {
      // Если записи с сегодняшней датой нет
      this.workingHours.insertAdjacentHTML('beforeend', rowHtml());
    }
  }

  onRender(data) {
    const { timepoints = [] } = data

    this.timePoints = timepoints
    this.workingHours.innerHTML = ''

    if (timepoints.length) {
      this.checkAndInsert(timepoints)
    } else {
      this.workingHours.insertAdjacentHTML('beforeend', rowHtml())
    }
  }

  changeRow(timePoint) {
    const row = this.workingHours.querySelector(`[data-id="${timePoint.id}"]`)

    if (!row) return
    row.insertAdjacentHTML('afterend', rowHtml(timePoint))
    row.remove()
  }

  async addTimePoint(formData) {
    try {
      modalDownloadPhotoWh.loader.enable()
      const response = await api.post('/_add_timepoint_', formData)

      if (response.status !== 200) return
      outputInfo(response.data)

      if (response.data.msg_type === 'success') {
        this.changeRow(this.timePoint)
      }

      modalDownloadPhotoWh.close()
    } catch (error) {
      console.error(error)
    } finally {
      modalDownloadPhotoWh.loader.disable()
    }
  }

  async getData() {
    try {
      const response = await api.get('/_get_time_control_info_')
      if (response.status !== 200) return null
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default WorkingHours