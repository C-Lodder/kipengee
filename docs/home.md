# Modal


### Basic Usage
```html
<!-- Trigger -->
<button id="trigger" type="button">Trigger</button>

<!-- Modal -->
<kp-modal id="modal">
  <div slot="modal-content">
    <p>This is my modal</p>
  </div>
</kp-modal>
```

```js
document.getElementById('trigger').addEventListener('click', () => {
  document.getElementById('modal').show()
})
```

<kp-modal id="demo-modal-basic">
  <div slot="modal-content">
    <p>This is my modal</p>
  </div>
</kp-modal>
<button id="demo-modal-basic-launch" type="button">Launch modal</button>


### Header and footer
```html
<kp-modal>
  <div slot="modal-title">Modal title</div>
  <div slot="modal-content">
    <p>This is my modal</p>
  </div>
  <div slot="modal-footer">
    <button name="button" class="close">Close</button>
  </div>
</kp-modal>
```

<kp-modal id="demo-modal-full">
  <div slot="modal-title">Modal title</div>
  <div slot="modal-content">
    <p>This is my modal</p>
  </div>
  <div slot="modal-footer">
    <button name="button" class="close">Close</button>
  </div>
</kp-modal>
<button id="demo-modal-full-launch" type="button">Launch modal</button>


### Events

Trigged when the modal has opened
```js
document.getElementById('modal').addEventListener('kp.modal.opened', () => {
  alert('Modal is open')
})
```

Trigged when the modal has closed
```js
document.getElementById('modal').addEventListener('kp.modal.closed', () => {
  alert('Modal is closed')
})
```


### Methods

Manually opens a modal
```js
document.getElementById('modal').show()
```

Manually closes a modal
```js
document.getElementById('modal').close()
```


<script markdown="0">
document.getElementById('demo-modal-basic-launch').addEventListener('click', () => {
  document.getElementById('demo-modal-basic').show()
})
document.getElementById('demo-modal-full-launch').addEventListener('click', () => {
  document.getElementById('demo-modal-full').show()
})
</script>
