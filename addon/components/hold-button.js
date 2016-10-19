import Ember from 'ember';
import layout from '../templates/components/hold-button';

var positionalParams = {
  positionalParams: 'params'
};

var HoldButtonComponent = Ember.Component.extend(positionalParams, {
  layout: layout,
  tagName: 'button',
  classNames: ['ember-hold-button'],
  classNameBindings: ['isHolding', 'isComplete', 'isHold', 'type'],
  attributeBindings: ['style'],

  delay: 500,
  type: 'rectangle',

  timer: null,
  isHolding: false,
  isHold: false,
  isComplete: false,

  style: Ember.computed('delay', function() {
    let delay = this.get('delay');

    let durations = [
      '-webkit-transition-duration',
      '-moz-transition-duration',
      'transition-duration',
      '-webkit-animation-duration',
      '-moz-animation-duration',
      'animation-duration'
    ].map((property) => {
      return property + ': ' + delay + 'ms';
    }).join(';');

    return Ember.String.htmlSafe(durations);
  }),

  setup: Ember.on('willInsertElement', function() {
    this.registerHandler();
  }),

  registerHandler() {
    this.on('mouseDown', this, this.startTimer);
    this.on('touchStart', this, (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.startTimer();
    });
  },

  startTimer() {
    if (!this.get('timer')) {
      this.set('isComplete', false);
      this.set('isHolding', true);
      this.set('isHold', false);

      this.off('mouseDown');
      this.on('mouseUp', this, this.cancelTimer);
      this.on('mouseLeave', this, this.cancelTimer);
      this.on('touchEnd', this, this.cancelTimer);
      this.on('touchCancel', this, this.cancelTimer);

      let timer = Ember.run.later(this, this.timerFinished, this.get('delay'));
      this.set('timer', timer);
    }
  },

  cancelTimer() {
    this.set('isHolding', false);
    this.set('isHold', false);
    Ember.run.cancel(this.get('timer'));
    this.set('timer', null);
    this.off('mouseUp');
    this.off('mouseLeave');
    this.off('touchEnd');
    this.off('touchCancel');
    this.registerHandler();
  },

  timerFinished() {
    if (this.get('isHolding') && !this.get('isComplete')) {
      this.set('isHold', true);
      this.on('mouseUp', this, this.sendTheAction);
    }
  },

  sendTheAction() {
    const params = this.getWithDefault('params', []);
    const actionParams = ['action', ...params];
    this.sendAction(...actionParams);
    this.set('isComplete', true);
    this.set('isHold', false);
    this.registerHandler();
    this.off('mouseUp');
    this.off('mouseLeave');
  }
});

HoldButtonComponent.reopenClass(positionalParams);
export default HoldButtonComponent;