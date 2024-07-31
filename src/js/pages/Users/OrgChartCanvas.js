class OrgChartCanvas {
  constructor(selector, nodes) {
    this.canvas = document.querySelector(selector);
    // this.canvas.style.width = this.canvas.clientWidth + 'px'

    this.ctx = this.canvas.getContext('2d');
    this.nodes = nodes;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.nodeWidth = 100;
    this.nodeHeight = 50;

    this.init();
  }

  init() {
    this.canvas.addEventListener('wheel', this.onZoom.bind(this));
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.drawChart();
  }

  onZoom(event) {
    event.preventDefault();
    const zoomAmount = 0.1;
    if (event.deltaY < 0) {
      this.scale = Math.min(this.scale + zoomAmount, 2);
    } else {
      this.scale = Math.max(this.scale - zoomAmount, 0.5);
    }
    this.drawChart();
  }

  onMouseDown(event) {
    const startX = event.offsetX;
    const startY = event.offsetY;

    const onMouseMove = (e) => {
      this.offsetX += e.offsetX - startX;
      this.offsetY += e.offsetY - startY;
      this.drawChart();
    };

    const onMouseUp = () => {
      this.canvas.removeEventListener('mousemove', onMouseMove);
      this.canvas.removeEventListener('mouseup', onMouseUp);
    };

    this.canvas.addEventListener('mousemove', onMouseMove);
    this.canvas.addEventListener('mouseup', onMouseUp);
  }

  drawNode(node) {
    const x = node.x * this.scale + this.offsetX;
    const y = node.y * this.scale + this.offsetY;
    this.ctx.fillStyle = 'lightblue';
    this.ctx.fillRect(x, y, this.nodeWidth * this.scale, this.nodeHeight * this.scale);
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(node.name, x + 10, y + 20);
    this.ctx.fillText(node.title, x + 10, y + 40);
  }

  drawChart() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.layoutNodes();
    this.nodes.forEach(node => this.drawNode(node));
  }

  layoutNodes() {
    // Пример простой раскладки, вы можете усложнить ее для более точной иерархии
    let xPos = 100;
    let yPos = 100;
    this.nodes.forEach((node, index) => {
      if (node.pid === null) {
        node.x = xPos;
        node.y = yPos;
        xPos += this.nodeWidth + 50;
      } else {
        const parent = this.nodes.find(n => n.id === node.pid);
        node.x = parent.x;
        node.y = parent.y + this.nodeHeight + 50;
      }
    });
  }

  addEmployee(employee) {
    this.nodes.push(employee);
    this.drawChart();
  }
}

export default OrgChartCanvas