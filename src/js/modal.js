window.customElements.define('kp-modal', class KpModal extends HTMLElement {
  get visible() {
    return this.hasAttribute('visible')
  }

  set visible(value) {
    if (value) {
      this.setAttribute('visible', '')
    } else {
      this.removeAttribute('visible')
    }
  }

  static get observedAttributes() {
    return ['visible']
  }

  constructor() {
    super()

    // Create shadow DOM for the component
    this.attachShadow({ mode: 'open' })
    this.nodes = null
  }

  connectedCallback() {
    this.render()
    this.modal = this.shadowRoot.querySelector('.modal')
    this.dialog = this.shadowRoot.querySelector('.modal-dialog')
    this.closeBtn = this.querySelector('.close')
    this.attachEventHandlers()
  }

  removeEvents() {
    this.removeEventListener('kp.modal.opened', this.show, true)
    this.removeEventListener('kp.modal.closed', this.close, true)
    this.modal.removeEventListener('click', this.close, true)
    if (this.closeBtn !== null) {
      this.closeBtn.removeEventListener('click', this.close, true)
    }
  }

  disconnectedCallback() {
    this.removeEvents()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'visible') {
      if (newValue === null) {
        this.modal.classList.remove('visible')
      } else {
        this.modal.classList.add('visible')
      }
    }
  }

  render() {
    const container = document.createElement('div')
    const randomId = new Date().getUTCMilliseconds()

    container.innerHTML = `
      <style>
        :host {
          --modal-bg-colour: #fff;
          --modal-colour: #151515;
          --modal-backdrop: rgba(0, 0, 0, .7);
        }
        *, *::after, *::before{
          box-sizing: border-box;
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          width: 100%;
          height: 100%;
          color: var(--modal-colour);
          background-color: var(--modal-backdrop);
          opacity: 0;
          visibility: hidden;
          transform: scale(1.1);
          transition: visibility 0s linear .25s, opacity .25s 0s, transform .25s;
        }
        .visible {
          opacity: 1;
          visibility: visible;
          transform: scale(1);
          transition: visibility 0s linear 0s, opacity .25s 0s, transform .25s;
        }
        .modal-dialog {
          position: absolute;
          top: 50%;
          left: 50%;
          display: flex;
          width: 80vw;
          height: 80vh;
          padding: 1rem;
          flex-direction: column;
          background-color: var(--modal-bg-colour);
          transform: translate(-50%, -50%);
          border-radius: .2rem;
        }
        .modal-content {
          padding-right: 1rem;
          margin-bottom: 1rem;
          overflow-y: auto;
        }
        .modal-title {
          margin-bottom: 1rem;
          font-size: 1.8rem;
        }
        .modal-footer {
          display: flex;
          margin-top: auto;
          justify-content: flex-end;
        }
      </style>
      <div class='modal${this.visible ? ' visible' : ''}'>
        <div class='modal-dialog' role='document'>
          <slot name='modal-title' class='modal-title' id='modal-title-${randomId}'></slot>
          <div class='modal-content'>
            <slot name='modal-content' id='modal-desc-${randomId}'></slot>
          </div>
          <slot name='modal-footer' class='modal-footer'></slot>
        </div>
      </div>`

    this.setAttribute('aria-labelledby', `modal-title-${randomId}`)
    this.setAttribute('aria-describedby', `modal-desc-${randomId}`)
    this.setAttribute('aria-modal', true)
    this.setAttribute('role', 'dialog')

    this.shadowRoot.appendChild(container)
  }

  dispatchCustomEvent(eventName) {
    const event = new CustomEvent(eventName, { bubbles: true, cancelable: true })
    event.relatedTarget = this
    this.dispatchEvent(event)
    this.removeEventListener(eventName, this)
  }

  attachEventHandlers() {
    if (this.closeBtn !== null) {
      this.closeBtn.addEventListener('click', () => {
        this.close()
      })
    }

    this.modal.addEventListener('click', ({ target }) => {
     if (target !== this && target !== this.dialog && !this.dialog.contains(target) && !this.contains(target)) {
        this.close()
      }
    })
  }

  keypress(code) {
    if (code === 'Escape') {
      this.close()
    }
  }

  trap(focusNode) {
    const elements = [
      'a[href]',
      'area[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]'].join(',')

    this.nodes = [...document.querySelectorAll(elements)]
      .filter(node => !focusNode.contains(node) && node.getAttribute('tabindex') !== '-1')
    this.nodes.forEach(node => node.setAttribute('tabindex', '-1'))
  }

  release() {
    this.nodes.forEach(node => node.removeAttribute('tabindex'))
  }

  show() {
    this.visible = true
    this.trap(this)
    this.dispatchCustomEvent('kp.modal.opened')

    document.addEventListener('keyup', ({ code }) => {
      this.keypress(code)
    }, { once: true })
  }

  close() {
    this.visible = false
    this.release()
    this.dispatchCustomEvent('kp.modal.closed')
    this.removeEvents()
  }
})
