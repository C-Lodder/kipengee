# Tabs


### Usage
```html
<kp-tabs>
  <button slot="title">Tab 1</button>
  <button slot="title">Tab 2</button>
  <button slot="title">Tab 3</button>
  <button slot="title">Tab 4</button>

  <section>
    <p>Content for tab 1</p>
  </section>
  <section>
    <p>Content for tab 2</p>
  </section>
  <section>
    <p>Content for tab 3</p>
  </section>
  <section>
    <p>Content for tab 4</p>
  </section>
</kp-tabs>
```

### Demo

<kp-tabs>
  <button slot="title">Tab 1</button>
  <button slot="title">Tab 2</button>
  <button slot="title">Tab 3</button>
  <button slot="title">Tab 4</button>

  <section>
    <p>Content for tab 1</p>
  </section>
  <section>
    <p>Content for tab 2</p>
  </section>
  <section>
    <p>Content for tab 3</p>
  </section>
  <section>
    <p>Content for tab 4</p>
  </section>
</kp-tabs>


### Attributes

|Attribute      |Description                                              |
|---------------|---------------------------------------------------------|
|animated       |This will fade the content in and out when switching tabs|
|swipe(beta)    |This will add swipe support                              |


### Methods

Switches to the previous tab
```js
document.getElementById('tabs').prev()
```

Switches to the next tab
```js
document.getElementById('tabs').next()
```
