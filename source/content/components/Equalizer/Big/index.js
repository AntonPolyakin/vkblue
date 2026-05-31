import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import ClassNames from 'classnames';
import Select from './Select/component';
import PopupMenu from './PopupMenu/component';
import Checkbox from '../../Checkbox/component';
import Filters from './Filters/component';
import styles from './styles.scss';
import openLightBox from '../../../actions/openLightBox';
import {
  equalizerUpdateEffectGain,
  equalizerUpdateEffectName,
  equalizerUpdateSurround,
  equalizerUpdatePitchSettings
} from '../../../../store/equalizer/actionCreators';
import {
  getEqualizerConvolverEffect,
  getEqualizerConvolverGain,
  getEqualizerFilters,
  getEqualizerSurround,
  getEqualizerPitchSettings
} from '../../../../store/equalizer/selectors';
import {
  getSettingsCompressorEnabled,
  getSettingsEqualizerEnabled,
  getSettingsSurroundEnabled,
} from '../../../../store/settings/selectors';
import { getPresetsPresets, getPresetsAuto, getPresetsCurrent } from '../../../../store/presets/selectors';
import { deletePreset, updateAutoPreset, updateCurrentPreset, updatePreset } from '../../../../actionCreators/presets';
import { jsxJoin } from '../../../../utils/jsx-utils';
import styled from 'styled-components';

const EFFECTS = [
  { name: 'ambience', text: 'Ambience' },
  { name: 'plate', text: 'Echo' },
  { name: 'hall', text: 'Concert' },
  { name: 'space', text: 'Space' },
];

const DEFAULT_PITCH_SETTINGS = {
  pitchValueSemitones: 0,
  pitchValueCents: 0,
  windowSizeMilliseconds: 120,
  applySmartProcessing: true,
  speedUnits: 0,
  speedFine: 0,
  preservePitch: true,
};

const Button = styled.button`
    float: right;
    padding: 7px 16px 8px;
    font-size: 12.5px;
    display: inline-block;
    zoom: 1;
    cursor: pointer;
    white-space: nowrap;
    outline: none;
    vertical-align: top;
    line-height: 15px;
    text-align: center;
    text-decoration: none;
    background: none;
    background-color: #5181b8;
    color: #fff;
    border: 0;
    border-radius: 4px;
    box-sizing: border-box;
`;

class BigEqualizer extends PureComponent {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      showEffects: false,
    };
    this.pitchRefs = [];
    this.resetPitchSettings = this.resetPitchSettings.bind(this);
    this.onChangePitch = this.onChangePitch.bind(this);

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

    this._syncPitchRanges();

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

    if (prevProps.pitchSettings !== this.props.pitchSettings) {
      this._syncPitchRanges();
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

  _syncRangeVisual(input) {
    if (!input || input.type !== 'range') return;

    const min = input.min === '' ? 0 : parseFloat(input.min);
    const max = input.max === '' ? 100 : parseFloat(input.max);
    const val = parseFloat(input.value);

    const range = max - min || 1;
    let ratio = (val - min) / range;
    ratio = Math.max(0, Math.min(1, ratio));

    if (this.isRTL) {
      ratio = 1 - ratio;
    }

    const sx = `${ratio * 100}%`;

    input.style.setProperty('--min', String(min));
    input.style.setProperty('--max', String(max));
    input.style.setProperty('--value', String(val));
    input.style.setProperty('--sx', sx);
    input.style.backgroundSize = `${sx} 100%`;
  }

  _syncPitchRanges() {
    this.pitchRefs.forEach(input => this._syncRangeVisual(input));
  }

  resetPitchSettings() {
    const pitch = { ...DEFAULT_PITCH_SETTINGS };

    this.props.equalizerUpdatePitchSettings(pitch);
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

  onChangePitch(key, value) {
    this.props.equalizerUpdatePitchSettings({ [key]: value });
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
      presetsUpdatePreset,
      presetsUpdateCurrent,
      settingsSurround,
      settingsCompressor,
      enabled,
      filters,
      pitchSettings
    } = this.props;
    const { showEffects, pitch } = this.state;

    const {
      pitchValueSemitones,
      pitchValueCents,
      windowSizeMilliseconds,
      applySmartProcessing,
      speedUnits,
      speedFine,
      preservePitch,
    } = pitchSettings;

    const calcSpeedPercentage = (units, fine) => {
      const base = units < 0 ? 100 + units : 100 + 5 * units;
      return base + fine;
    };

    const speedPercent = calcSpeedPercentage(speedUnits, 0);
    const speedFineDisplay = calcSpeedPercentage(speedUnits, speedFine);
    let backgroundColor;
    Array.from(window.document.querySelectorAll('#spa_layout_content section')).some(pB => {
      backgroundColor = `var(--vkui--color_background_content, ${window.getComputedStyle(pB).getPropertyValue('background-color')})`;
      return true;
    });

    let isOriginalDefault = presets['default'] && [...new Set(presets['default'].values)].length === 1;

    const updateDefaultPreset = (preset) => {
      let defaultPresetValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      let presetValues = preset?.values || defaultPresetValues;
      let newPreset = { values: presetValues };
      let presetId = 'default';

      presetsUpdatePreset(newPreset, presetId);
    }

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
          <div styleName="links">
            {jsxJoin(
              [
                current === null && (
                  <div key="save" styleName="new">
                    <span onClick={onAddPreset}>Сохранить</span>
                  </div>
                ),
                current === null && (
                  <div key="default" styleName="new">
                    <span onClick={() => {
                      updateDefaultPreset({ values: filters });
                      presetsUpdateCurrent('default');
                    }}>Сделать по умолчанию</span>
                  </div>
                ),
                current === 'default' && !isOriginalDefault && (
                  <div key="reset" styleName="new">
                    <span onClick={() => updateDefaultPreset()}>Сбросить по умолчанию</span>
                  </div>
                )
              ],
              <span styleName="separator">|</span>
            )}
          </div>

          <PopupMenu
            trigger={
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 12C26.2091 12 28 10.2091 28 8C28 5.79086 26.2091 4 24 4C21.7909 4 20 5.79086 20 8C20 10.2091 21.7909 12 24 12ZM24 28C26.2091 28 28 26.2091 28 24C28 21.7909 26.2091 20 24 20C21.7909 20 20 21.7909 20 24C20 26.2091 21.7909 28 24 28ZM28 40C28 42.2091 26.2091 44 24 44C21.7909 44 20 42.2091 20 40C20 37.7909 21.7909 36 24 36C26.2091 36 28 37.7909 28 40Z"
                />
              </svg>
            }
          >
            {({ close }) => (
              <ul styleName="popup-menu-list">
                <li styleName="popup-menu-item">
                  <Checkbox
                    value={auto}
                    onChange={({ value }) => {
                      presetsUpdateAuto(value);
                      //close();
                    }}
                  >
                    Автоопределение
                  </Checkbox>
                </li>
              </ul>
            )}
          </PopupMenu>

        </div>
        <div styleName={ClassNames('equalizer-wrapper', { disabled: !enabled })}>
          <Filters />
        </div>
        <div styleName={ClassNames('effects-wrapper', { opened: showEffects })}>
          <span onClick={onToggleEffects} style={{ backgroundColor }}>
            Эффекты
          </span>
          <div styleName="effects">
            <h3>Пространственные эффекты</h3>
            <div styleName="spatial-section">

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

            <h3>Эффекты растяжения</h3>
            <div styleName="pitch-section">


              <div styleName="pitch-col">
                <div styleName="pitch-control">
                  <label>Высота тона: <span>{pitchValueSemitones}</span> (полутона)</label>
                  <input
                    ref={el => (this.pitchRefs[0] = el)}
                    className={`${styles['styled-slider']} ${styles['slider-progress']}`}
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={pitchValueSemitones}
                    onInput={e => this._syncRangeVisual(e.target)}
                    onChange={e => this.onChangePitch('pitchValueSemitones', parseInt(e.target.value, 10))}
                  />
                </div>

                <div styleName="pitch-control">
                  <label>Высота тона: <span>{pitchValueCents}</span> (центы)</label>
                  <input
                    ref={el => (this.pitchRefs[1] = el)}
                    className={`${styles['styled-slider']} ${styles['slider-progress']}`}
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={pitchValueCents}
                    onInput={e => this._syncRangeVisual(e.target)}
                    onChange={e => this.onChangePitch('pitchValueCents', parseInt(e.target.value, 10))}
                  />
                </div>

                <div styleName="pitch-control">
                  <label>Размер блока: <span>{windowSizeMilliseconds}</span> (мс)</label>
                  <input
                    ref={el => (this.pitchRefs[2] = el)}
                    className={`${styles['styled-slider']} ${styles['slider-progress']}`}
                    type="range"
                    min="20"
                    max="150"
                    step="5"
                    value={windowSizeMilliseconds}
                    onInput={e => this._syncRangeVisual(e.target)}
                    onChange={e => this.onChangePitch('windowSizeMilliseconds', parseInt(e.target.value, 10))}
                  />
                </div>

                <div styleName="pitch-row">
                  <Checkbox
                    value={applySmartProcessing}
                    onChange={({ value }) => this.onChangePitch('applySmartProcessing', value)}
                  >
                    Умная обработка
                  </Checkbox>
                </div>
              </div>


              <div styleName="pitch-col">
                <div styleName="pitch-control">
                  <label>Скорость воспроизведения: <span>{speedPercent}%</span></label>
                  <input
                    ref={el => (this.pitchRefs[3] = el)}
                    className={`${styles['styled-slider']} ${styles['slider-progress']}`}
                    type="range"
                    min="-75"
                    max="60"
                    step="1"
                    value={speedUnits}
                    onInput={e => this._syncRangeVisual(e.target)}
                    onChange={e => this.onChangePitch('speedUnits', parseInt(e.target.value, 10))}
                  />
                </div>

                <div styleName="pitch-control">
                  <label>Скорость воспроизведения: <span>{speedFineDisplay}%</span></label>
                  <input
                    ref={el => (this.pitchRefs[4] = el)}
                    className={`${styles['styled-slider']} ${styles['slider-progress']}`}
                    type="range"
                    min="-5"
                    max="5"
                    step="1"
                    value={speedFine}
                    onInput={e => this._syncRangeVisual(e.target)}
                    onChange={e => this.onChangePitch('speedFine', parseInt(e.target.value, 10))}
                  />
                </div>

                <div styleName="pitch-row">
                  <Checkbox
                    value={preservePitch}
                    onChange={({ value }) => this.onChangePitch('preservePitch', value)}
                  >
                    Сохранить тональность
                  </Checkbox>
                </div>
              </div>

            </div>

            <div styleName="pitch-reset-row">

              <Button
                onClick={() => {
                  this.resetPitchSettings();
                }}
              >
                Сбросить
              </Button>
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
  pitchSettings: getEqualizerPitchSettings(state),
});

const mapDispatchToProps = {
  presetsUpdateAuto: updateAutoPreset,
  presetsUpdateCurrent: updateCurrentPreset,
  presetsUpdatePreset: updatePreset,
  presetsDeletePreset: deletePreset,
  openLightBox,
  equalizerUpdateSurround,
  equalizerUpdateEffectGain,
  equalizerUpdateEffectName,
  equalizerUpdatePitchSettings,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CSSModules(BigEqualizer, styles, { allowMultiple: true }));
