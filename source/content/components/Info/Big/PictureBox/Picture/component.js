import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import Loader from '../../../../Loader/component';

class Picture extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: false,
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.picture !== prevProps.picture) {
            this.setState({ error: false });
        }
    }

    render() {
        const { picture } = this.props;
        const { error } = this.state;

        if (picture === undefined) {
            return (
                <div styleName="wrapper_picture">
                    <Loader />
                </div>
            );
        }

        if (picture === null || error) {
            return (
                <div styleName="wrapper_picture">
                    <div styleName="empty_picture" />
                </div>
            );
        }

        return (
            <div styleName="wrapper_picture">
                <img
                    styleName="picture"
                    key={picture}
                    src={picture}
                    alt="image not found"
                    onError={event => this.setState({ error: true })}
                />
            </div>
        );
    }
}

export default CSSModules(Picture, styles);
