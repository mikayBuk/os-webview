import React, {useState} from 'react';
import WrappedJsx from '~/controllers/jsx-wrapper';
import mix from '~/helpers/controller/mixins';
import RadioPanelJsx from './radio-panel.jsx';
import busMixin from '~/helpers/controller/bus-mixin';
import {on} from '~/helpers/controller/decorators';

export function RadioPanel({selectedItem, items, onChange}) {
    const [active, setActive] = useState(false);
    const classList = ['filter-buttons'];

    function toggleActive() {
        setActive(!active);
    }

    if (active) {
        classList.push('active');
    }
    return (
        <div className={classList.join(' ')} onClick={toggleActive}>
            <RadioPanelJsx items={items} selectedValue={selectedItem} onChange={onChange} />
        </div>
    );
}

export default class extends mix(WrappedJsx).with(busMixin) {

    init(items) {
        super.init(RadioPanelJsx, {
            items,
            selectedItem: null,
            onChange: (value) => this.updateSelected(value)
        });
        this.view = {
            classes: ['filter-buttons']
        };
    }

    updateSelected(value) {
        this.updateProps({
            selectedItem: value
        });
        this.emit('change', value);
    }

    // This is for when it is in mobile/dropdown mode
    @on('click')
    toggleActive() {
        this.el.classList.toggle('active');
    }

}
