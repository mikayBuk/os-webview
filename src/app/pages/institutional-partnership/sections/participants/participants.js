import componentType from '~/helpers/controller/init-mixin';
import {description as template} from './participants.html';
import css from './participants.css';
import {on} from '~/helpers/controller/decorators';
import EstablishedPartners from './established-partners/established-partners';
import shellBus from '~/components/shell/shell-bus';

const spec = {
    template,
    css,
    view: {
        tag: 'section',
        classes: ['participants', 'white']
    }
};

export default class extends componentType(spec) {

    onLoaded() {
        this.establishedPartners = new EstablishedPartners({
            model: this.model.established
        });
    }

    @on('click .show-established-partners')
    showPrintSubmenu(event) {
        event.preventDefault();
        shellBus.emit('showDialog', () => ({
            title: 'Established Partners',
            content: this.establishedPartners
        }));
    }

};
