
import { Animation } from './animation.js';
import { event, origin } from './enums.js';

/**
 * @summary Kømpletr.js is a library providing features dedicated to autocomplete fields.
 * 
 * @author Steve Lebleu <ping@steve-lebleu.dev>
 * 
 * @see https://github.com/steve-lebleu/kompletr
 */
export default class Kompletr {
  broadcaster = null;

  /**
   * 
   */
  cache = null;

  /**
   * 
   */
  callbacks = {};

  /**
   * 
   */
  configuration = null;

  /**
   * 
   */
  dom = null;

  /**
   * 
   */
  props = null;

  constructor({ configuration, properties, dom, cache, broadcaster, onKeyup, onSelect, onError }) {
    try {
      this.configuration = configuration;
      this.broadcaster = broadcaster;
      this.props = properties;
      this.dom = dom;
      this.cache = cache;

      this.broadcaster.subscribe(event.error, this.error);
      this.broadcaster.subscribe(event.dataDone, this.showResults);
      this.broadcaster.subscribe(event.domDone, this.bindResults);
      this.broadcaster.subscribe(event.selectDone, this.closeTheShop);

      this.broadcaster.listen(this.dom.input, 'keyup', this.suggest);
      this.broadcaster.listen(this.dom.body, 'click', this.closeTheShop); // TODO: validate this because it can be called many times if many kompletr instances

      if(onKeyup || onSelect || onError) {
        this.callbacks = Object.assign(this.callbacks, { onKeyup, onSelect, onError });
      }
    } catch(e) {
      broadcaster.trigger(event.error, e);
    }
  }

  closeTheShop = (e) => {
    if (e.srcElement === this.dom.input) {
      return true;
    }
    Animation.animateBack(this.dom.result, this.configuration.animationType, this.configuration.animationDuration);
    this.resetPointer();
  }

  resetPointer = () => {
    this.props.pointer = -1;
  }

  error = (e) => {
    console.error(`[kompletr] An error has occured -> ${e.stack}`);
    Animation.fadeIn(this.dom.result);
    this.callbacks.onError && this.callbacks.onError(e);
  }

  /**
   * @description CustomEvent 'this.request.done' listener
   * 
   * @todo Check something else to determine if we filter or not -> currently just the presence of onKeyup callback
   */
  showResults = async ({ from, data }) => {
    this.props.data = data;

    data = this.props.data.map((record, idx) => ({ idx, data: record }) ); // TODO: Check if we can avoid this step

    if (!this.callbacks.onKeyup) {
      data = data.filter((record) => {
        const value = typeof record.data === 'string' ? record.data : record.data[this.configuration.propToMapAsValue];
        if (this.configuration.filterOn === 'prefix') {
          return value.toLowerCase().lastIndexOf(this.dom.input.value.toLowerCase(), 0) === 0;
        }
        return value.toLowerCase().lastIndexOf(this.dom.input.value.toLowerCase()) !== -1;
      });
    }

    if (this.cache && from !== origin.cache) {
      this.cache.set({ string: this.dom.input.value, data });
    }

    this.dom.buildResults(data.slice(0, this.configuration.maxResults), this.configuration.fieldsToDisplay);
  }

  /**
   * @description CustomEvent 'kompletr.dom.done' listener
   */
  bindResults = () => {    
    Animation[this.configuration.animationType](this.dom.result, this.configuration.animationDuration); // TODO this is not really bindResult
    if(this.dom.result?.children?.length) {
      for(let i = 0; i < this.dom.result.children.length; i++) {
        ((i) => {
          return this.broadcaster.listen(this.dom.result.children[i], 'click', () => {
            this.dom.focused = this.dom.result.children[i];
            this.select(this.dom.focused.id);
          });
        })(i)
      }
    }
  }

  /**
   * @description 'input.keyup' listener
   */
  suggest = (e) => {
    if (this.dom.input.value.length < this.configuration.startQueriyngFromChar) {
      return;
    }
    
    const keyCode = e.keyCode;

    switch (keyCode) {
      case 13:  // Enter
        this.select(this.dom.focused.id);
        break;
      case 38: // Up
      case 40: // Down
        this.navigate(keyCode);
        break;
      default:
        if (this.dom.input.value !== this.props.previousValue) {
          this.hydrate(this.dom.input.value);
        }
        this.resetPointer();
        break
    }
  }

  /**
   * @description Manage the data hydration according to the current setup (cache, request or local data)
   * 
   * @param {String} value Current input value
   * 
   * @emits CustomEvent 'this.request.done' { from, data }
   * @emits CustomEvent 'this.error' { error }
   * 
   * @returns {Void}
   * 
   * @todo options.data could returns Promise<Array>, and same for the onKeyup callback
   */
  hydrate = async (value) => {
    try {
      if (this.cache && await this.cache.isValid(value)) {
        this.cache.get(value, (data) => {
          this.broadcaster.trigger(event.dataDone, { from: origin.cache, data: data });  
        });
      } else if (this.callbacks.onKeyup) {
        this.callbacks.onKeyup(value, (data) => {
          this.broadcaster.trigger(event.dataDone, { from: origin.callback, data: data });
        });
      } else {
        this.broadcaster.trigger(event.dataDone, { from: origin.local, data: this.props.data });
      }
    } catch(e) {
      this.broadcaster.trigger(event.error, e);
    }
  }

  /**
   * @description Apply visual navigation into the suggestions set
   * 
   * @param {Number} keyCode The current keyCode value
   * 
   * @returns {Void}
   */
  navigate = (keyCode) => {
    if (keyCode != 38 && keyCode != 40) {
      return false;
    }

    if(this.props.pointer < -1 || this.props.pointer > this.dom.result.children.length - 1) {
      return false;
    }

    if (keyCode === 38 && this.props.pointer >= -1) {
      this.props.pointer--;
    } else if (keyCode === 40 && this.props.pointer < this.dom.result.children.length - 1) {
      this.props.pointer++;
    } 

    this.dom.focus(this.props.pointer, 'remove');
    this.dom.focus(this.props.pointer, 'add');
  }

  /**
   * @description Select a suggested item as user choice
   * 
   * @param {Number} idx The index of the selected suggestion
   * 
   * @emits CustomEvent 'this.select.done'
   * 
   * @returns {Void}
   */
  select = (idx = 0) => {  
    this.dom.input.value = typeof this.props.data[idx] === 'object' ? this.props.data[idx][this.configuration.propToMapAsValue] : this.props.data[idx];
    this.callbacks.onSelect(this.props.data[idx]);
    this.broadcaster.trigger(event.selectDone);
  }
};