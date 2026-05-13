import React from 'react';

export function jsxJoin(items, separator) {
    const filtered = items.filter(Boolean);

    return filtered.reduce((acc, item, index) => {
        if (index > 0) {
            acc.push(
                React.isValidElement(separator)
                    ? React.cloneElement(separator, { key: `sep-${index}` })
                    : separator
            );
        }

        acc.push(item);
        return acc;
    }, []);
}