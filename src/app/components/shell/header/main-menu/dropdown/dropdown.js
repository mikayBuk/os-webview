import componentType, {insertHtmlMixin} from '~/helpers/controller/init-mixin';
import {on} from '~/helpers/controller/decorators';
import $ from '~/helpers/$';
import headerBus from '../../bus';
import {description as template} from './dropdown.html';
import css from './dropdown.css';

const spec = {
    template,
    css,
    view: {
        classes: ['nav-menu-item', 'dropdown']
    },
    model() {
        this.props = this.getProps();

        return {
            isOpen: this.isOpen,
            selectedIndex: this.selectedIndex,
            dropdownLabel: this.props.dropdownLabel,
            items: this.props.items
        };
    }
};

export default class Dropdown extends componentType(spec, insertHtmlMixin) {

    init(options) {
        super.init(options);
        this.frozen = false;
        this.isOpen = false;
        this.selectedIndex = -1;
    }

    onLoaded() {
        this.closeMenuBound = (event) => {
            if (this.openedByTouch) {
                this.openedByTouch = false;
                return;
            }
            if (!$.isMobileDisplay() && !this.frozen) {
                this.closeMenu();
            }
        };
        this.el.addEventListener('mouseleave', this.closeMenuBound);
    }

    onClose() {
        this.el.removeEventListener('mouseleave', this.closeMenuBound);
    }

    setFocus() {
        this.settingFocus = true;
        if (this.selectedIndex < 0) {
            this.el.querySelector('a').focus();
        } else {
            this.el.querySelectorAll('.dropdown-menu [role="menuitem"]')[this.selectedIndex].focus();
        }
        this.settingFocus = false;
    }

    freeze() {
        this.frozen = true;
    }

    unfreeze() {
        this.frozen = false;
    }

    openMenu() {
        if (!this.isOpen) {
            this.isOpen = true;
            if ($.isMobileDisplay()) {
                headerBus.emit('recognizeDropdownOpen', {
                    el: this.el,
                    label: this.props.dropdownLabel,
                    close: this.closeMenu.bind(this)
                });
            }
            this.update();
        }
    }

    closeMenu() {
        if (this.isOpen) {
            this.isOpen = false;
            headerBus.emit('recognizeDropdownOpen', null);
            this.update();
        }
    }

    @on('focusin')
    @on('mouseover')
    openDesktopMenu() {
        if (!$.isMobileDisplay()) {
            this.openMenu();
        }
    }

    @on('focusout')
    navigateAway(event) {
        if (event.target.parentNode === this.el && !$.isMobileDisplay() && !this.settingFocus) {
            this.closeMenuBound(event);
        }
    }

    @on('touchstart .dropdown > [role="menuitem"]')
    openByTouch(event) {
        this.openedByTouch = true;
    }

    @on('click .dropdown > [role="menuitem"]')
    openMobileMenu(event) {
        event.preventDefault();
        this.openMenu();
    }

    @on('keydown')
    moveSelection(event) {
        /* eslint complexity: 0 */
        const lastIndex = this.props.items.length - 1;

        switch (event.keyCode) {
        case $.key.down:
            if (this.selectedIndex < lastIndex) {
                ++this.selectedIndex;
            }
            event.preventDefault();
            this.setFocus();
            break;
        case $.key.up:
            --this.selectedIndex;
            if (this.selectedIndex < 0) {
                this.selectedIndex = -1;
            }
            event.preventDefault();
            this.setFocus();
            break;
        case $.key.enter:
        case $.key.space:
            document.activeElement.dispatchEvent(new Event('click', {bubbles: true}));
            // Falls through to close
        case $.key.esc:
            document.activeElement.blur();
            this.closeMenuBound();
            event.preventDefault();
            break;
        default:
            break;
        }
        this.update();
    }

}
