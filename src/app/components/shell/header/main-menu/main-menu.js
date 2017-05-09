import {Controller} from 'superb';
import {on} from '~/helpers/controller/decorators';
import $ from '~/helpers/$';
import {description as template} from './main-menu.html';

export default class MainMenu extends Controller {

    init(model) {
        this.template = template;
        this.view = {
            classes: ['container']
        };
        this.css = '/app/components/shell/header/main-menu/main-menu.css';
        this.model = model;
        this.model.activeState = (num) => this.selectedIndex === num ? 'active' : '';
    }

    onLoaded() {
        this.model.initialRenderDone = true;
    }

    @on('click a[data-set-redirect]')
    setRedirect(e) {
        const encodedLocation = encodeURIComponent(window.location.href);

        e.target.href += `?next=${encodedLocation}`;
    }

    @on('focusin a[role="menuitem"][aria-haspopup="true"]')
    resetSelection(event) {
        this.selectedIndex = -1;
        this.update();
    }

    @on('keydown a[role="menuitem"][aria-haspopup="true"]:focus')
    moveSelection(event) {
        /* eslint complexity: 0 */
        const menu = event.target.nextSibling.children;
        const lastIndex = menu.length - 1;
        const newTarget = () => menu[this.selectedIndex].querySelector('a');

        switch (event.keyCode) {
        case $.key.down:
            if (this.selectedIndex < lastIndex) {
                ++this.selectedIndex;
            }
            event.preventDefault();
            this.update();
            break;
        case $.key.up:
            --this.selectedIndex;
            if (this.selectedIndex < 0) {
                this.selectedIndex = 0;
            }
            event.preventDefault();
            this.update();
            break;
        case $.key.enter:
        case $.key.space:
            event.preventDefault();
            newTarget().dispatchEvent($.newEvent('click'));
            // Falls through!
        case $.key.esc:
            document.activeElement.blur();
            break;
        default:
            break;
        }
    }

}
