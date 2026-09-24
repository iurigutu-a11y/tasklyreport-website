import assert from 'node:assert/strict';
import test from 'node:test';
import { createSupportWidget } from '../support-widget/taskly-support.js';

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
    this.hidden = false;
    this.value = '';
    this.focused = false;
    this.className = '';
  }

  append(...children) {
    for (const child of children) {
      child.parentElement = this;
      this.children.push(child);
    }
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'class') this.className = String(value);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatchEvent(event) {
    const dispatchedEvent = {
      preventDefault() {},
      ...event,
    };
    for (const listener of this.listeners.get(dispatchedEvent.type) || [])
      listener(dispatchedEvent);
  }

  focus() {
    this.focused = true;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const visit = (element) => {
      const classSelector = selector.startsWith('.') ? selector.slice(1) : null;
      if (classSelector && element.className.split(/\s+/).includes(classSelector))
        matches.push(element);
      for (const child of element.children) visit(child);
    };
    for (const child of this.children) visit(child);
    return matches;
  }

  get firstElementChild() {
    return this.children[0] || null;
  }

  remove() {
    this.parentElement?.children.splice(this.parentElement.children.indexOf(this), 1);
  }
}

class FakeDocument {
  constructor() {
    this.body = new FakeElement('body');
  }

  createElement(tagName) {
    return new FakeElement(tagName);
  }
}

function widgetElements(documentRef) {
  const root = documentRef.body.querySelector('.taskly-support-widget');
  return {
    root,
    toggle: root.querySelector('.taskly-support-widget__toggle'),
    panel: root.querySelector('.taskly-support-widget__panel'),
    close: root.querySelector('.taskly-support-widget__close'),
    messages: root.querySelector('.taskly-support-widget__messages'),
  };
}

test('close button and launcher control one persistent widget panel', () => {
  const documentRef = new FakeDocument();
  const widget = createSupportWidget({
    document: documentRef,
    apiBase: 'https://taskly-ai-server-7ztrsl34mq-ew.a.run.app',
    product: 'taskly_report_pro',
    fetch: async () => ({ ok: true, status: 200, json: async () => ({}) }),
  });
  const { root, toggle, panel, close, messages } = widgetElements(documentRef);

  assert.equal(widget.root, root);
  assert.equal(documentRef.body.querySelectorAll('.taskly-support-widget').length, 1);
  assert.equal(panel.hidden, true);

  toggle.dispatchEvent({ type: 'click' });
  assert.equal(panel.hidden, false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');

  close.dispatchEvent({ type: 'click' });
  assert.equal(panel.hidden, true);
  assert.equal(panel.getAttribute('aria-hidden'), 'true');
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(messages.children.length, 1);

  toggle.dispatchEvent({ type: 'click' });
  assert.equal(panel.hidden, false);
  close.dispatchEvent({ type: 'keydown', key: 'Enter' });
  assert.equal(panel.hidden, true);

  toggle.dispatchEvent({ type: 'click' });
  close.dispatchEvent({ type: 'keydown', key: ' ' });
  assert.equal(panel.hidden, true);
  assert.equal(documentRef.body.querySelectorAll('.taskly-support-widget').length, 1);
});

test('Escape closes the open panel without removing conversation messages', () => {
  const documentRef = new FakeDocument();
  createSupportWidget({
    document: documentRef,
    apiBase: 'https://taskly-ai-server-7ztrsl34mq-ew.a.run.app',
    fetch: async () => ({ ok: true, status: 200, json: async () => ({}) }),
  });
  const { toggle, panel, messages } = widgetElements(documentRef);

  toggle.dispatchEvent({ type: 'click' });
  const messageCount = messages.children.length;
  const input = documentRef.body.querySelector('.taskly-support-widget__input');
  input.dispatchEvent({ type: 'keydown', key: 'Escape' });

  assert.equal(panel.hidden, true);
  assert.equal(messages.children.length, messageCount);
});
