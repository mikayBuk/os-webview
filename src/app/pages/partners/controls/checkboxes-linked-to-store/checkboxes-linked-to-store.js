import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck} from '@fortawesome/free-solid-svg-icons/faCheck';
import {treatSpaceOrEnterAsClick} from '~/helpers/events';
import cn from 'classnames';
import './checkboxes-linked-to-store.scss';

function Checkbox({label, value, store}) {
    const checked = React.useMemo(
        () => store.includes(value),
        [store, value]
    );

    return (
        <label className="form-control">
            <span className={cn('indicator', {checked})} tabIndex="0" onKeyDown={treatSpaceOrEnterAsClick}>
                <input
                    className="hidden" type="checkbox"
                    value={value}
                    onChange={() => store.toggle(value)}
                />
                <FontAwesomeIcon className="tick" icon={faCheck} />
            </span>
            <span className="label-text">{label}</span>
        </label>
    );
}

export default function CheckboxesLinkedToStore({store, options}) {
    return (
        <div className="checkboxes-linked-to-store">
            {
                options.map((option) =>
                    <Checkbox key={option.value} label={option.label} value={option.value} store={store} />
                )
            }
        </div>
    );
}
