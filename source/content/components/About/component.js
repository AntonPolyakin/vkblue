import browser from 'webextension-polyfill';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import closeLightBox from '../../actions/closeLightBox';
import openLightBox from '../../actions/openLightBox';

const manifest = browser.runtime.getManifest();

class About extends PureComponent {
    render() {
        const { closeLightBox, openLightBox } = this.props;
        const date = new Date();

        return (
            <div styleName="lightbox_wrapper" onClick={closeLightBox}>
                <div styleName="lightbox" onClick={e => e.stopPropagation()}>
                    <div styleName="settings_popup">
                        <span styleName="close" onClick={closeLightBox}>
                            CLOSE
                        </span>
                        <div styleName="info">
                            <div styleName="logo">
                                <h2 styleName="name">{manifest.short_name}</h2>
                                <span styleName="version">версия {manifest.version}</span>
                            </div>
                            <div styleName="description">
                                <p>{manifest.description}</p>
                            </div>

                            <div styleName="technical">
                                <ul>
                                    <li>
                                        Концепт и разработка:{' '}
                                        <strong>
                                            <a target="_blank" href={browser.i18n.getMessage('creator_code_link')}>
                                                {browser.i18n.getMessage('creator_code_name')}
                                            </a>
                                            ,
                                            <a target="_blank" href={browser.i18n.getMessage('creator_design_link')}>
                                                {browser.i18n.getMessage('creator_design_name')}
                                            </a>
                                        </strong>
                                    </li>
                                    <li>
                                        Логотип и медиа:{' '}
                                        <strong>
                                            <a target="_blank" href={browser.i18n.getMessage('creator_media_link')}>
                                                {browser.i18n.getMessage('creator_media_name')}
                                            </a>
                                            ,
                                            <a target="_blank" href={browser.i18n.getMessage('elements_design_link')}>
                                                {browser.i18n.getMessage('elements_design_name')}
                                            </a>
                                        </strong>
                                    </li>
                                </ul>
                                <a onClick={() => openLightBox('help')}>
                                    <strong>Поддержать нас</strong>
                                </a>
                                <br />
                                <br />
                                <p>
                                    © {date.getFullYear()} Все права защищены{' '}
                                    <a target="_blank" href="https://sleepingdude.com/policy.html">
                                        Политика конфиденциальности
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = {
    closeLightBox,
    openLightBox,
};

export default connect(
    null,
    mapDispatchToProps,
)(CSSModules(About, styles));
