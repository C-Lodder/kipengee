window.customElements.define('kp-tabs', class KpTabs extends HTMLElement {
  get swipe() {
    return this.hasAttribute('swipe')
  }

  set swipe(value) {
    if (value) {
      this.setAttribute('swipe', '')
    } else {
      this.removeAttribute('swipe')
    }
  }

  get animated() {
    return this.hasAttribute('animated')
  }

  set animated(value) {
    if (value) {
      this.setAttribute('animated', '')
    } else {
      this.removeAttribute('animated')
    }
  }

  get selected() {
    return this._selected
  }

  set selected(idx) {
    this._selected = idx
    this.selectTab(idx)
    // Updated the element's selected attribute value when
    // backing property changes.
    this.setAttribute('selected', idx)
  }

  constructor() {
    super()

    this._selected = null
    this.xDown = null
    this.yDown = null
    this.threshold = 10

    // Create shadow DOM for the component
    this.attachShadow({ mode: 'open' })
  }

  render() {
    if (this.animated) {
      this.animatedCss = `
        #panels ::slotted(*) {
          overflow: hidden;
          opacity: 0;
          transition: all 1s;
          transition-timing-function: ease-in-out;
          min-height: 0 !important;
          max-height: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
        #panels ::slotted(.active) {
          opacity: 1;
          transition: opacity 1s;
          transition-timing-function: ease-in-out;
          min-height: auto !important;
          max-height: none !important;
          padding-top: none !important;
          padding-bottom: none !important;
        }`
    } else {
      this.animatedCss = `
        #panels ::slotted(*) {
          display: none;
        }
        #panels ::slotted(.active) {
          display: block;
        }`
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --tab-bg-color: #f2f2f2;
          --tab-text-color: #333;
          --tab-active-bg-color: #fff;
          --tab-active-border-color: #333;

          display: block;
          contain: content;
        }
        #panels {
          padding-top: .5rem;
          padding-bottom: .5rem;
          overflow: auto;
        }
        #tabs {
          -webkit-user-select: none;
          user-select: none;
        }
        #tabs slot {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        #tabs ::slotted(*) {
          padding: 1rem;
          flex: 1;
          color: var( --tab-text-color);
          background: var(--tab-bg-color);
          border: none;
          justify-content: center;
          cursor: pointer;
        }
        #tabs ::slotted([aria-selected="true"]) {
          background: var(--tab-active-bg-color);
          border-top: 2px solid var(--tab-active-border-color);
        }
        #tabs ::slotted(:focus) {
          z-index: 1;
        }
        @media (max-width: 767px) {
          #tabs ::slotted(*) {
            flex: 0 0 100%;
          }
        }
        ${this.animatedCss}
      </style>
      <div id="tabs">
        <slot id="tab" name="title"></slot>
      </div>
      <div id="panels">
        <slot id="panel"></slot>
      </div>` 
  }

  connectedCallback() {
    this.render()
    this.setAttribute('role', 'tablist')
    const tabsSlot = this.shadowRoot.querySelector('#tab')
    const panelsSlot = this.shadowRoot.querySelector('#panel')
    this.tabs = tabsSlot.assignedNodes({
      flatten: true
    })
    this.panels = panelsSlot.assignedNodes({
      flatten: true
    }).filter(({nodeType}) => nodeType === Node.ELEMENT_NODE)

    // Add aria role="tabpanel" to each content panel.
    for (let [i, panel] of this.panels.entries()) {
      panel.setAttribute('role', 'tabpanel')
      panel.setAttribute('tabindex', 0)
    }

    // Save refer to we can remove listeners later.
    this.boundOnTitleClick = this.onTitleClick.bind(this)
    this.boundOnKeyDown = this.onKeyDown.bind(this)
    tabsSlot.addEventListener('click', this.boundOnTitleClick)
    tabsSlot.addEventListener('keydown', this.boundOnKeyDown)

    this.selected = this.findFirstSelectedTab() || 0

    if (this.swipe) {
      this.addEventListener('touchstart', this.handleTouchStart, { passive: true })
      this.addEventListener('touchmove', this.handleTouchMove, { passive: true })
    }
  }

  disconnectedCallback() {
    const tabsSlot = this.shadowRoot.querySelector('#tab')
    tabsSlot.removeEventListener('click', this.boundOnTitleClick)
    tabsSlot.removeEventListener('keydown', this.boundOnKeyDown)

    if (this.swipe) {
      this.removeEventListener('touchstart')
      this.removeEventListener('touchmove')
    }
  }

  dispatchCustomEvent(eventName) {
    const event = new CustomEvent(eventName, { bubbles: true, cancelable: true })
    event.relatedTarget = this
    this.dispatchEvent(event)
    this.removeEventListener(eventName, this)
  }

  onTitleClick({ target }) {
    if (target.slot === 'title') {
      this.selected = this.tabs.indexOf(target)
      target.focus()
    }
  }

  prev() {
    let idx
    idx = this.selected - 1
    idx = idx < 0 ? this.tabs.length - 1 : idx
    this.tabs[idx].click()
  }

  next() {
    const idx = this.selected + 1
    this.tabs[idx % this.tabs.length].click()
  }

  onKeyDown(event) {
    switch (event.code) {
      case 'ArrowDown':
      case 'ArrowLeft':
        event.preventDefault()
        this.prev()
        break
      case 'ArrowUp':
      case 'ArrowRight':
        event.preventDefault()
        this.next()
        break
      default:
        break
    }
  }

  findFirstSelectedTab() {
    let selectedIdx
    for (let [i, tab] of this.tabs.entries()) {
      tab.setAttribute('role', 'tab')
      tab.setAttribute('type', 'button')
      // Allow users to declaratively select a tab
      // Highlight last tab which has the selected attribute.
      if (tab.hasAttribute('selected')) {
        selectedIdx = i
      }
    }
    return selectedIdx
  }

  selectTab(idx = null) {
    for (let i = 0, tab; tab = this.tabs[i]; ++i) {
      const select = i === idx
      tab.setAttribute('tabindex', select ? 0 : -1)
      tab.setAttribute('aria-selected', select)
      this.panels[i].setAttribute('aria-hidden', !select)
      if (select) {
        this.panels[i].classList.add('active')
      } else {
        this.panels[i].classList.remove('active')
      }
    }
  }

  getTouches({ touches, targetTouches }) {
    return touches[0] || targetTouches[0]
  }

  handleTouchStart(event) {
    const firstTouch = this.getTouches(event)
    this.xDown = firstTouch.clientX
    this.yDown = firstTouch.clientY
  }

  handleTouchMove(event) {
    if (!this.xDown || !this.yDown) {
      return
    }

    const xDiff = this.xDown - this.getTouches(event).clientX
    const yDiff = this.yDown - this.getTouches(event).clientY

    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > this.threshold) {
      if (xDiff > 0) {
        // Left swipe
        this.prev()
      } else {
        // Right swipe
        this.next()
      }
    }

    // Reset values
    this.xDown = null
    this.yDown = null
  }
})
