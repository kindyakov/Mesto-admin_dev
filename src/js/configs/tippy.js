import tippy from 'tippy.js';

tippy.setDefaultProps({
  duration: 0,
  allowHTML: true,
  trigger: 'click',
  placement: 'bottom-start',
  arrow: false,
  interactive: true,
  appendTo: document.body,
});

export default tippy;
