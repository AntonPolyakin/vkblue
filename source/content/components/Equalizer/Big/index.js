import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import ClassNames from 'classnames';
import Select from './Select/component';
import Checkbox from '../../Checkbox/component';
import Filters from './Filters/component';
import styles from './styles.scss';
import openLightBox from '../../../actions/openLightBox';
import {
  equalizerUpdateEffectGain,
  equalizerUpdateEffectName,
  equalizerUpdateSurround,
} from '../../../../store/equalizer/actionCreators';
import {
  getEqualizerConvolverEffect,
  getEqualizerConvolverGain,
  getEqualizerFilters,
  getEqualizerSurround,
} from '../../../../store/equalizer/selectors';
import {
  getSettingsCompressorEnabled,
  getSettingsEqualizerEnabled,
  getSettingsSurroundEnabled,
} from '../../../../store/settings/selectors';
import { getPresetsPresets, getPresetsAuto, getPresetsCurrent } from '../../../../store/presets/selectors';
import { deletePreset, updateAutoPreset, updateCurrentPreset } from '../../../../actionCreators/presets';

const EFFECTS = [
  { name: 'ambience', text: 'Ambience' },
  { name: 'plate', text: 'Echo' },
  { name: 'hall', text: 'Concert' },
  { name: 'space', text: 'Space' },
];

class BigEqualizer extends PureComponent {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      showEffects: false,
    };
    this.onAddPreset = this.onAddPreset.bind(this);
    this.onChangeSurround = this.onChangeSurround.bind(this);
    this.onChangeEffect = this.onChangeEffect.bind(this);
    this.onToggleEffects = this.onToggleEffects.bind(this);
    this.onChangeGainEffect = this.onChangeGainEffect.bind(this);
    this.openConfig = this.openConfig.bind(this);

    // ref to the range input inside this component
    this.gainEffect = null;

    // initial dir check
    this.isRTL = document.documentElement.dir === 'rtl';

    // bind listener so we can remove it later
    this._boundRangeInputHandler = this._boundRangeInputHandler.bind(this);
  }

  // Called once after mounting — attach listeners and initialize CSS variables
  componentDidMount() {
    if (this.gainEffect) {
      // set initial CSS variables (--min, --max, --value)
      const min = this.gainEffect.min === '' ? '0' : this.gainEffect.min;
      const max = this.gainEffect.max === '' ? '100' : this.gainEffect.max;
      const val = this.gainEffect.value;

      this.gainEffect.style.setProperty('--min', min);
      this.gainEffect.style.setProperty('--max', max);
      this.gainEffect.style.setProperty('--value', val);

      // initialize background/visuals once
      this._updateRangeVisual(this.gainEffect);

      // listen input to update both css var and background size while sliding
      this.gainEffect.addEventListener('input', this._boundRangeInputHandler);
    }

    // MutationObserver to track dir changes (ltr/rtl)
    this.observer = new MutationObserver(mutationList => {
      mutationList.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'dir') {
          this.isRTL = mutation.target.dir === 'rtl';
          // re-render the visual if dir changed
          if (this.gainEffect) this._updateRangeVisual(this.gainEffect);
        }
      });
    });
    this.observer.observe(document.documentElement, { attributes: true });
  }

  // Clean up listeners
  componentWillUnmount() {
    if (this.gainEffect) {
      this.gainEffect.removeEventListener('input', this._boundRangeInputHandler);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // If value or min/max props change from above, keep CSS vars/visuals in sync
  componentDidUpdate(prevProps) {
    // if gainEffect prop changed (controlled input), update css var & visual
    if (this.gainEffect) {
      const currentVal = this.props.gainEffect;
      const prevVal = prevProps.gainEffect;

      const minAttr = this.gainEffect.min === '' ? '0' : this.gainEffect.min;
      const maxAttr = this.gainEffect.max === '' ? '100' : this.gainEffect.max;

      // always sync min/max in case attributes changed
      this.gainEffect.style.setProperty('--min', minAttr);
      this.gainEffect.style.setProperty('--max', maxAttr);

      // if prop value changed, sync --value and visual
      if (String(currentVal) !== String(prevVal)) {
        // controlled input already receives new value via render, but ensure css var
        this.gainEffect.style.setProperty('--value', String(currentVal));
        this._updateRangeVisual(this.gainEffect);
      }
    }
  }

  // Unified handler: updates CSS var --value and backgroundSize (progress fill)
  _boundRangeInputHandler(e) {
    const target = e.target;
    if (!target || target.type !== 'range') return;

    const min = target.min === '' ? 0 : parseFloat(target.min);
    const max = target.max === '' ? 100 : parseFloat(target.max);
    const val = parseFloat(target.value);

    // set CSS variable for styling usage
    target.style.setProperty('--value', String(target.value));
    // compute percentage normalized 0..100
    let percentage = 0;
    if (max !== min) {
      percentage = ((val - min) * 100) / (max - min);
    }
    if (this.isRTL) {
      // for RTL we invert
      percentage = ((max - val) * 100) / (max - min || 1);
    }

    // update background fill (existing behavior)
    target.style.backgroundSize = `${percentage}% 100%`;
  }

  // Helper to update visual based on current attributes / value
  _updateRangeVisual(target) {
    if (!target || target.type !== 'range') return;
    const min = target.min === '' ? 0 : parseFloat(target.min);
    const max = target.max === '' ? 100 : parseFloat(target.max);
    const val = parseFloat(target.value);
    let percentage = 0;
    if (max !== min) percentage = ((val - min) * 100) / (max - min);
    if (this.isRTL) percentage = ((max - val) * 100) / (max - min || 1);
    target.style.backgroundSize = `${percentage}% 100%`;
  }

  openConfig() {
    this.props.openLightBox('config');
  }

  onAddPreset() {
    this.props.openLightBox('add_preset');
  }

  onChangeSurround() {
    if (!this.props.settingsSurround) {
      alert('Функция не активна.\nДля начала включите компонент "Dolby Surround" в настройках.');
      this.openConfig();
      return;
    }
    if (this.props.settingsCompressor) {
      alert('Dolby не совместим с Компрессором,\nсначала выключите компонент "Компрессор" в настройках');
      this.openConfig();
      return;
    }
    if (this.props.settingsSurround && !this.props.settingsCompressor) {
      this.props.equalizerUpdateSurround(!this.props.surround);
    }
  }

  onToggleEffects() {
    this.setState(({ showEffects }) => ({ showEffects: !showEffects }));
  }

  onChangeEffect({ name, value }) {
    this.props.equalizerUpdateEffectName(name);
    this.props.equalizerUpdateEffectGain(value);
  }

  onChangeGainEffect() {
    const { gainEffect } = this;
    this.props.equalizerUpdateEffectGain(parseFloat(gainEffect.value));
  }

  get effects() {
    const { onChangeEffect } = this;
    const { effect } = this.props;
    return EFFECTS.map(({ name, text }) => {
      const active = effect === name;
      const classes = ClassNames(name, { active: active, locked: false });
      const onClick = onChangeEffect.bind(this, { name: effect === name ? null : name, value: 0.5 });
      return (
        <li name={name} key={name} styleName={classes} onClick={onClick}>
          <span>{text}</span>
        </li>
      );
    });
  }

  render() {
    const { effects, onAddPreset, onChangeSurround, onToggleEffects, onChangeGainEffect } = this;
    const {
      auto,
      presets,
      current,
      surround,
      effect,
      gainEffect = 0.5,
      presetsUpdateAuto,
      presetsDeletePreset,
      presetsUpdateCurrent,
      settingsSurround,
      settingsCompressor,
      enabled,
    } = this.props;
    const { showEffects } = this.state;
    let backgroundColor;
    Array.from(window.document.querySelectorAll('.page_block')).some(pB => {
      backgroundColor = window.getComputedStyle(pB).getPropertyValue('background-color');
      return true;
    });

    return (
      <div styleName="wrapper">
        <div styleName="options">
          <div styleName="genres">
            <Select
              selected={current}
              presets={presets}
              onChange={presetsUpdateCurrent}
              onDelete={presetsDeletePreset}
            />
          </div>
          {current === -1 ? (
            <div styleName="new">
              <span onClick={onAddPreset}>Сохранить</span>
            </div>
          ) : null}
          <div styleName="autodetect">
            <Checkbox value={auto} onChange={({ value }) => presetsUpdateAuto(value)}>
              Определять автоматически
            </Checkbox>
          </div>
        </div>
        <div styleName={ClassNames('equalizer-wrapper', { disabled: !enabled })}>
          <Filters />
        </div>
        <div styleName={ClassNames('effects-wrapper', { opened: showEffects })} style={{ backgroundColor }}>
          <span onClick={onToggleEffects} style={{ backgroundColor }}>
            Effects
          </span>
          <div styleName="effects">
            <ul>
              <li
                styleName={ClassNames('dolby', {
                  active: !settingsCompressor && settingsSurround && surround,
                })}
                onClick={onChangeSurround}
              >
                <span>DOLBY</span>
              </li>
              {effects}
            </ul>
            <div styleName={ClassNames('depth', effect, { enabled: effect })}>
              {/* added ref here — this.gainEffect */}
              <input
                ref={i => (this.gainEffect = i)}
                className={`${styles['styled-slider']} ${styles['slider-progress']}`}
                value={gainEffect}
                type="range"
                max="1"
                min="0"
                step="0.1"
                onChange={onChangeGainEffect}
                disabled={!effect}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  presets: getPresetsPresets(state),
  auto: getPresetsAuto(state),
  current: getPresetsCurrent(state),
  filters: getEqualizerFilters(state),
  surround: getEqualizerSurround(state),
  effect: getEqualizerConvolverEffect(state),
  gainEffect: getEqualizerConvolverGain(state),
  enabled: getSettingsEqualizerEnabled(state),
  settingsSurround: getSettingsSurroundEnabled(state),
  settingsCompressor: getSettingsCompressorEnabled(state),
});

const mapDispatchToProps = {
  presetsUpdateAuto: updateAutoPreset,
  presetsUpdateCurrent: updateCurrentPreset,
  presetsDeletePreset: deletePreset,
  openLightBox,
  equalizerUpdateSurround,
  equalizerUpdateEffectGain,
  equalizerUpdateEffectName,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CSSModules(BigEqualizer, styles, { allowMultiple: true }));
