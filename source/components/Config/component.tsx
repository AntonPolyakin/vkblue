import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import closeLightBox from '../../content/actions/closeLightBox';
import { getSettings } from '../../store/settings/selectors';
import { GlobalStore } from '../../store';
import CloseIcon from './images/close.png';
import { SettingsStore } from '../../store/settings/types';
import { updateSettings } from '../../actionCreators/settings';
import { getPresetsPresets } from '../../store/presets/selectors';
import { Preset } from '../../store/presets/types';
import { updatePresets } from '../../actionCreators/presets';
import { resetApp } from '../../modules/resetApp/content';
import { clampToRange } from '../../utils/utils';

const _Checkbox: any = require('../../content/components/Checkbox/component').default;

const SettingsWrapper = styled.div`
    position: relative;
    p {
        color: #999;
    }
`;

const Header = styled.div`
    height: 54px;
    padding: 0 25px;
    line-height: 54px;
    background: #6287ae;

    span {
        font-size: 14px;
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, Roboto, Open Sans, Helvetica Neue, sans-serif;
    }
`;

const Footer = styled.div`
    height: 54px;
    line-height: 54px;
    padding: 0px 25px;
    border-top: 1px solid rgb(231, 232, 236);
    background: rgb(250, 251, 252);

    p {
        margin: 0;
        font-size: 11px;
    }
`;

const HeaderClose = styled.span`
      position: absolute;
      top: 0;right: 0;
      height: 54px;
      width: 54px;
      background: url('${CloseIcon}') no-repeat center;
      background-size: 12px;
      opacity: 0.75;
      cursor: pointer;
      &:hover {
        opacity: 1;
      }
`;

const Body = styled.div`
    padding: 20px 25px;
    overflow-y: auto;
    max-height: 50vh;

    h3 {
        color: #000;
        margin: 0 0 10px;
        font-size: 15px;
    }
`;

const Block = styled.div`
    margin: 0 0 10px 5px;

    p {
        margin: 2px 0 5px 29px;
        font-size: 11px;
        line-height: 14px;
        color: #999;
    }
`;

const Row = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
    box-sizing: border-box;
`;
const Column = styled.div`
    flex-basis: 50%;

    &:first-child {
        pudding: 0 10px 0 0;
    }
`;

const FullColumn = styled.div`
    flex-basis: 100%;

    &:first-child {
        pudding: 0;
    }
`;

const Checkbox = styled(_Checkbox)`
    display: block;
    margin: 0 0 5px;
    font-size: 12px !important;

    & > span {
        margin-right: 10px;
        color: #666;

        &:first-child {
            height: 18px;
            width: 18px;
            font-size: 18px;
            line-height: 18px;
        }

        &:last-child {
            font-size: 14px;
            line-height: 16px;
        }
    }
`;

const NoCheckbox = styled.span`
    display: block;
    font-size: 14px;
    line-height: 16px;
    margin: 0 0 5px;
    color: #666;
    font-family: RobotoRegular, sans-serif;
`;

const Button = styled.button`
    float: right;
    padding: 7px 16px 8px;
    margin: 12px 0px 0px;
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

const InputLabelEmpty = styled.span`
    color: #5181b8;
    cursor: pointer;
`;

const InputLabelUploaded = styled.span`
    color: #999;
    cursor: pointer;
    display: none;
`;

const InputFile = styled.input`
    visibility: hidden;
    width: 1px;
    height: 1px;

    &:valid ~ ${InputLabelUploaded} {
        display: inline-block;
    }

    &:valid ~ ${InputLabelEmpty} {
        //display: none;
    }
`;

const DownloadLink = styled.a`
    color: #5181b8 !important;
    cursor: pointer;
`;

const Label = styled.label`
    display: flex;
    justify-content: space-between;
    color: #666;
    padding-left: 29px;
    font-size: 13px;
    line-height: 24px;
    margin-bottom: 5px;

    label {
        overflow: hidden;
        width: 75%;
    }

    span {
        float: right;
        color: #999;
        font-size: 12px;
        line-height: 24px;
    }

    input {
        height: 20px;
        width: 45px;
        color: black !important;
        border-radius: 2px;
        border: 1px solid rgba(128, 128, 128, 0.5);
        box-shadow: none;
        outline: none;
        text-align: center;
    }
`;

const ResetAppButton = styled.span`
    display: inline-block;
    color: red;
    font-size: 11px;
    padding: 4px 6px;
    border-radius: 2px;
    border: 1px solid red;
    margin-bottom: 4px;
    margin-left: 27px;
    cursor: pointer;
`;

interface ConfigProps {
    settings: SettingsStore;
    presets: Preset[];
    closeLightBox(): void;
    changeSettings(data: SettingsStore): void;
    updatePresets(presets: Preset[]): void;
}

const presetsIsValid: (presets: Preset[]) => boolean = presets => {
    if (presets.length < 1) {
        throw Error('Presets must be exist!');
    }

    return presets.every(preset => {
        if (!preset.name) {
            throw Error(`Preset: name must be exist!`);
        }

        if (preset.values.length !== 10) {
            throw Error(`Preset "${preset.name}": values must be an array with length equal 10!`);
        }

        if (!preset.values.every(value => typeof value === 'number' && value >= -1 && value <= 1)) {
            throw Error(`Preset "${preset.name}": values must be array of numbers from -1 to 1!`);
        }

        if (!Array.isArray(preset.genres)) {
            throw Error(`Preset "${preset.name}": genres must be array!`);
        }

        if (Object.keys(preset).length !== 3) {
            throw Error(`Preset "${preset.name}": only "name", "values", "genres" is required!`);
        }

        return true;
    });
};

const Config: React.FunctionComponent<ConfigProps> = ({
    settings,
    closeLightBox,
    changeSettings,
    presets,
    updatePresets,
}) => {
    const [equalizer, setEqualizer] = React.useState(settings.equalizer);
    const [equalizerAnalyser, setEqualizerAnalyser] = React.useState(settings.equalizerAnalyser);
    const [equalizerSurround, setEqualizerSurround] = React.useState(settings.equalizerSurround);
    const [equalizerEffects, setEqualizerEffects] = React.useState(settings.equalizerEffects);
    const [equalizerCompressor, setEqualizerCompressor] = React.useState(settings.equalizerCompressor);
    const [scrobbler, setScrobbler] = React.useState(settings.scrobbler);
    const [subscribeToGroup, setSubscribeToGroup] = React.useState(settings.subscribeToGroup);
    const [newPresets, setNewPresets] = React.useState(presets);

    const [equalizerCompressorThreshold, setEqualizerCompressorThreshold] = React.useState(
        settings.equalizerCompressorThreshold,
    );
    const [equalizerCompressorKnee, setEqualizerCompressorKnee] = React.useState(settings.equalizerCompressorKnee);
    const [equalizerCompressorRatio, setEqualizerCompressorRatio] = React.useState(settings.equalizerCompressorRatio);
    const [equalizerCompressorAttack, setEqualizerCompressorAttack] = React.useState(
        settings.equalizerCompressorAttack,
    );
    const [equalizerCompressorRelease, setEqualizerCompressorRelease] = React.useState(
        settings.equalizerCompressorRelease,
    );

    const presetsHref =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(
            JSON.stringify(presets.map(({ values, name, genres }) => ({ values: values.map(value=>clampToRange(+value || 0, [-1, 1])), name, genres })))
                .replace(/,"/g, ',\n"')
                .replace(/},/g, '\n},\n')
                .replace(/{/g, '{\n')
                .replace(/}]/g, '\n}]'),
        );

    return (
        <SettingsWrapper>
            <Header>
                <span>Настройки</span>
                <HeaderClose onClick={closeLightBox} />
            </Header>
            <Body>
                <Block>
                    <h3>Звук</h3>
                    <Row>
                        <Column>
                            <Block>
                                <Checkbox
                                    value={equalizer}
                                    onChange={(event: { value: boolean }) => setEqualizer(event.value)}
                                >
                                    Эквалайзер
                                </Checkbox>
                                <p>
                                    Включить/выключить любую обработку звука. Все другие настройки связанные со звуком
                                    не будут работать если выключено.
                                </p>
                            </Block>
                            <Block>
                                <Checkbox
                                    value={equalizerSurround}
                                    onChange={(event: { value: boolean }) => {
                                        if (event.value && equalizerCompressor) {
                                            alert(
                                                'Dolby не совместим с Компрессором,\nсначала выключите компонент "Компрессор"',
                                            );
                                            return;
                                        }

                                        setEqualizerSurround(event.value);
                                    }}
                                >
                                    Dolby Surround
                                </Checkbox>
                                <p>
                                    Если вы испытываете проблемы со звуком попробуйте отключить часть или все надстройки
                                    над звуком, может помочь.
                                </p>
                            </Block>
                            <Block>
                                <Checkbox
                                    value={equalizerEffects}
                                    onChange={(event: { value: boolean }) => setEqualizerEffects(event.value)}
                                >
                                    Эффекты
                                </Checkbox>
                                <p>Полностью выключит слой обработки эффектов. Выключайте если не используете.</p>
                            </Block>
                        </Column>
                        <Column>
                            <Block>
                                <Checkbox
                                    value={equalizerCompressor}
                                    onChange={(event: { value: boolean }) => {
                                        if (event.value && equalizerSurround) {
                                            alert(
                                                'Компрессор не совместим с Dolby,\nсначала выключите компонент "Dolby Surround"',
                                            );
                                            return;
                                        }
                                        setEqualizerCompressor(event.value);
                                    }}
                                >
                                    Компрессор
                                </Checkbox>
                                <p>Компрессор нужен для контроля перегрузок звука</p>
                                <div>
                                    <Label>
                                        <label>
                                            Threshold <span>[min: -100, max: 0]</span>
                                        </label>
                                        <input
                                            type="number"
                                            max={0}
                                            min={-100}
                                            step={1}
                                            value={equalizerCompressorThreshold}
                                            onChange={event => {
                                                setEqualizerCompressorThreshold(Number(event.target.value));
                                            }}
                                        />
                                    </Label>
                                    <Label>
                                        <label>
                                            Knee <span>[min: 0, max: 40]</span>
                                        </label>
                                        <input
                                            type="number"
                                            max={40}
                                            min={0}
                                            step={1}
                                            value={equalizerCompressorKnee}
                                            onChange={event => {
                                                setEqualizerCompressorKnee(Number(event.target.value));
                                            }}
                                        />
                                    </Label>
                                    <Label>
                                        <label>
                                            Ratio <span>[min: 1, max: 20]</span>
                                        </label>
                                        <input
                                            type="number"
                                            max={20}
                                            min={1}
                                            step={1}
                                            value={equalizerCompressorRatio}
                                            onChange={event => {
                                                setEqualizerCompressorRatio(Number(event.target.value));
                                            }}
                                        />
                                    </Label>
                                    <Label>
                                        <label>
                                            Attack <span>[min: 0, max: 1]</span>
                                        </label>
                                        <input
                                            type="number"
                                            max={1}
                                            min={0}
                                            step={0.05}
                                            value={equalizerCompressorAttack}
                                            onChange={event => {
                                                setEqualizerCompressorAttack(Number(event.target.value));
                                            }}
                                        />
                                    </Label>
                                    <Label>
                                        <label>
                                            Release <span>[min: 0, max: 1]</span>
                                        </label>
                                        <input
                                            type="number"
                                            step={0.05}
                                            max={1}
                                            min={0}
                                            value={equalizerCompressorRelease}
                                            onChange={event => {
                                                setEqualizerCompressorRelease(Number(event.target.value));
                                            }}
                                        />
                                    </Label>
                                </div>
                            </Block>
                        </Column>
                    </Row>
                </Block>
                <Row>
                    <Column>
                        <h3>Компоненты</h3>
                        <Block>
                            <Checkbox
                                value={equalizerAnalyser}
                                onChange={(event: { value: boolean }) => setEqualizerAnalyser(event.value)}
                            >
                                Визуалайзер
                            </Checkbox>
                            <p>
                                Выключение визуалайзера может улучшить быстродействие, уменшить использование памяти и
                                батареи(если у вас ноут).
                            </p>
                        </Block>
                        <Block>
                            <Checkbox
                                value={scrobbler}
                                onChange={(event: { value: boolean }) => setScrobbler(event.value)}
                            >
                                LastFM Скробблер
                            </Checkbox>
                            <p>Вы можете отключить скробблер, если в нем нет необходимости.</p>
                        </Block>
                    </Column>
                    <Column>
                        <h3>Экспертные</h3>
                        <Block>
                            <NoCheckbox>Бэкап и восстановление</NoCheckbox>
                            <p>
                                <DownloadLink href={presetsHref} download="presets.json" target="_blank">
                                    Экспорт
                                </DownloadLink>
                                &nbsp;/&nbsp;
                                <label>
                                    <InputFile
                                        required
                                        type="file"
                                        name="presets"
                                        accept=".json"
                                        onChange={(onChangeInputEvent: React.ChangeEvent<HTMLInputElement>) => {
                                            const reader = new FileReader();
                                            reader.onload = onLoadFileEvent => {
                                                try {
                                                    const result = onLoadFileEvent.target.result as string;
                                                    const newPresets = JSON.parse(result).map(preset => {
                                                        preset.values = preset.values.map(value=>clampToRange(+value || 0, [-1, 1]))
                                                        return preset;
                                                    }) as Preset[];

                                                    if (presetsIsValid(newPresets)) {
                                                        setNewPresets(newPresets);
                                                    }
                                                } catch (e) {
                                                    alert(`Упс! Не валидный файл пресетов! Ошибка: ${e}`);
                                                }
                                            };
                                            reader.readAsText(onChangeInputEvent.target.files[0], 'utf8');
                                        }}
                                    />
                                    <InputLabelEmpty>Импорт</InputLabelEmpty> настроек эквалайзера (.json) <br />
                                    <InputLabelUploaded>*cохраните чтобы применить</InputLabelUploaded>
                                </label>
                            </p>
                        </Block>
                        <Block>
                            <NoCheckbox>Сброс настроек</NoCheckbox>
                            <ResetAppButton onClick={() => resetApp()}>Сбросить и Перезагрузить</ResetAppButton>
                            <p>(!) сбросив настройки вы потеряете все не стандартные пресеты</p>
                        </Block>
                    </Column>
                </Row>
                <Row>
                    <FullColumn>
                        <Block>
                            <Checkbox
                                value={subscribeToGroup}
                                onChange={(event: { value: boolean }) => setSubscribeToGroup(event.value)}
                            >
                                Вступить в группу
                            </Checkbox>
                            <p>
                                После установки расширения вы автоматически становитесь частью сообщества VK Blue.<br />
                                Так вы будете в курсе всех новостей. Выключите, чтобы отменить автоматическое вступление в группу.
                            </p>
                        </Block>
                    </FullColumn>
                </Row>
            </Body>
            <Footer>
                <Button
                    onClick={() => {
                        updatePresets(newPresets);

                        changeSettings({
                            equalizer,
                            equalizerAnalyser,
                            equalizerSurround,
                            equalizerEffects,
                            equalizerCompressor,
                            scrobbler,
                            equalizerCompressorThreshold,
                            equalizerCompressorKnee,
                            equalizerCompressorRatio,
                            equalizerCompressorAttack,
                            equalizerCompressorRelease,
                            subscribeToGroup,
                        });
                    }}
                >
                    Сохранить
                </Button>
                <p>*после сохранения настроек все страницы VK будут перезагружены</p>
            </Footer>
        </SettingsWrapper>
    );
};

const mapStateToProps = (state: GlobalStore) => ({
    settings: getSettings(state),
    presets: getPresetsPresets(state),
});

const mapDispatchToProps = {
    closeLightBox,
    changeSettings: updateSettings,
    updatePresets,
};

export const Settings = connect(
    mapStateToProps,
    mapDispatchToProps,
)(Config);
