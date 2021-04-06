import React from 'react';
import cn from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import './link-with-chevron.css';

export default function LinkWithChevron({children, className, ...props}) {
    return (
        <a className={cn('link-with-chevron', className)} {...props}>
            {children}{' '}
            <FontAwesomeIcon icon={faChevronRight} />
        </a>
    );
}
