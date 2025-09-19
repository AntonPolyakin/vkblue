import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import { places } from '../../places/index';

export default class Portal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mounted: false,
        };

        this.container = null;
    }

    componentDidMount() {
        places.onAdd(this.props.place, container => {
            this.container = container;
            this.setState(prevState => ({ mounted: true }));
            console.log('added: ', this.props.place);
        });
        places.onRemove(this.props.place, container => {
            this.container = null;
            this.setState(prevState => ({ mounted: false }));
            console.log('removed: ', this.props.place);
        });
    }

    render() {
        if (this.state.mounted) {
            return createPortal(this.props.children, this.container);
        } else {
            return null;
        }
    }
}
