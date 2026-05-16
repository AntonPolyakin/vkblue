import React, { useEffect, useRef, useState } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

function PopupMenu({ trigger, children, className = '' }) {
    const [opened, setOpened] = useState(false);

    const rootRef = useRef(null);

    const open = () => setOpened(true);
    const close = () => setOpened(false);

    const toggle = () => {
        setOpened((prev) => !prev);
    };

    useEffect(() => {
        const handlePointerDown = (e) => {
            if (!rootRef.current) {
                return;
            }

            if (!rootRef.current.contains(e.target)) {
                close();
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                close();
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const content =
        typeof children === 'function'
            ? children({ close, open })
            : children;

    return (
        <div
            ref={rootRef}
            styleName="popup-opener"
            className={`${className} ${opened ? styles.opened : ''}`}
        >
            <button
                type="button"
                styleName="popup-btn"
                onClick={toggle}
            >
                {trigger}
            </button>

            {opened ? (
                <div
                    styleName="popup-menu"
                    className={styles.visible}
                >
                    {content}
                </div>
            ) : null}
        </div>
    );
}

export default CSSModules(PopupMenu, styles, {
    allowMultiple: true
});