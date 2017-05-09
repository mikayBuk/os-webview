import {Controller} from 'superb';
import stickyNote from '../sticky-note/sticky-note';
import UpperMenu from './upper-menu/upper-menu';
import MainMenu from './main-menu/main-menu';
import settings from 'settings';
import $ from '~/helpers/$';
import {on} from '~/helpers/controller/decorators';
import linkHelper from '~/helpers/link';
import userModel, {sfUserModel} from '~/models/usermodel';
import {description as template} from './header.html';

class Header extends Controller {

    init() {
        this.template = template;
        this.css = '/app/components/shell/header/header.css';
        this.view = {
            tag: 'header',
            classes: ['page-header', 'hide-until-loaded']
        };
        this.regions = {
            stickyNote: 'sticky-note',
            upperMenu: 'nav.meta-nav',
            mainMenu: 'nav.nav'
        };

        // Fix: There must be a better way
        const padParentForStickyNote = () => {
            const stickyNoteEl = this.el.querySelector('sticky-note');

            if (stickyNoteEl) {
                const h = stickyNoteEl.offsetHeight;

                this.el.parentNode.style.minHeight = `${h}px`;
            }
        };

        const accounts = `${settings.apiOrigin}/accounts`;

        this.model = {
            login: `${accounts}/login/openstax/`,
            logout: `${accounts}/logout/`,
            user: {
                username: null,
                groups: []
            },
            accountLink: `${settings.accountHref}/profile`,
            facultyAccessLink: `${settings.accountHref}/faculty_access/apply`,
            currentDropdown: null
        };

        this.upperMenu = new UpperMenu(this.model);
        this.mainMenu = new MainMenu(this.model);

        userModel.load().then((response) => {
            const handleUser = (user) => {
                if (typeof user === 'object') {
                    this.model.user = user;
                }
                this.update();
                this.mainMenu.update();
            };

            if (typeof response === 'object' && response.groups.length === 0) {
                sfUserModel.load().then(handleUser);
            } else {
                handleUser(response);
            }
        });

        document.addEventListener('click', this.resetHeader.bind(this));
        window.addEventListener('resize', this.closeFullScreenNav.bind(this));
        window.addEventListener('resize', padParentForStickyNote);
        window.addEventListener('navigate', () => this.update());
    }

    onUpdate() {
        stickyNote.forceHide(window.location.pathname !== '/');
    }

    onLoaded() {
        this.regions.stickyNote.append(stickyNote);
        this.regions.upperMenu.attach(this.upperMenu);
        this.regions.mainMenu.attach(this.mainMenu);
        // Prevent elements from showing up as they load
        setTimeout(() => this.el.classList.add('loaded'), 100);

        let ticking = false;

        this.removeAllOpenClassesOnScroll = () => {
            this.removeAllOpenClasses();
            ticking = false;
        };

        this.onScrollHeader = (evt) => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(this.removeAllOpenClassesOnScroll);
            }
        };

        window.addEventListener('scroll', this.onScrollHeader, false);
    }

    pin() {
        this.el.classList.add('fixed');
        return this;
    }

    transparent() {
        this.el.classList.add('transparent');
        return this;
    }

    reset() {
        this.el.classList.remove('fixed');
        this.el.classList.remove('transparent');
        return this;
    }

    isPinned() {
        return this.el.classList.contains('fixed');
    }

    get height() {
        let height = 0;

        if (this.el && typeof this.el === 'object') {
            height = this.el.offsetHeight;
        }

        return height;
    }

    toggleFullScreenNav(button) {
        const wasActive = this.el.classList.contains('active');
        const reconfigure = () => {
            button.setAttribute('aria-expanded', !wasActive);
            document.body.classList.toggle('no-scroll');
            this.el.classList.toggle('active');
            this.removeAllOpenClasses();
        };


        this.el.style.transition = 'none';
        if (wasActive) {
            $.fade(this.el, {fromOpacity: 1, toOpacity: 0}).then(() => {
                reconfigure();
                this.el.style.opacity = 1;
                this.el.style.transition = null;
            });
        } else {
            this.el.style.opacity = 0;
            reconfigure();
            $.fade(this.el, {fromOpacity: 0, toOpacity: 1}).then(() => {
                this.el.style.transition = null;
            });
        }
    }

    removeClass(array, className) {
        const len = array.length;

        for (let i = 0; i < len; i++) {
            if (array[i].classList) {
                array[i].classList.remove(className);
            } else {
                const names = array[i].className.split(' ')
                .filter((name) => name !== className);

                array[i].className = names.join('');
            }
        }
    }

    removeAllOpenClasses() {
        const parentItem = this.el.querySelectorAll('.dropdown');
        const dropDownMenu = this.el.querySelectorAll('.dropdown-menu');

        if (this.el) {
            this.el.classList.remove('open');
        }
        this.removeClass(parentItem, 'open');
        this.removeClass(dropDownMenu, 'open');
        this.closeDropdownMenus(true);
        this.updateHeaderStyle();
    }

    closeFullScreenNav() {
        const button = this.el.querySelector('.expand');

        if (this.el.classList.contains('active')) {
            document.body.classList.remove('no-scroll');
        }

        this.el.classList.remove('active');
        this.removeAllOpenClasses();

        button.setAttribute('aria-expanded', 'false');
    }

    @on('click .expand')
    onClickToggleFullScreenNav(e) {
        e.stopPropagation();
        this.toggleFullScreenNav(e.target);
    }

    @on('click .dropdown > a')
    flyOutMenu(e) {
        const w = window.innerWidth;
        const $this = e.target;
        const parentItem = $this.parentNode;
        const dropDownMenu = $this.nextElementSibling;

        if (w <= 768) {
            e.preventDefault();
            e.stopPropagation();
            if (!dropDownMenu.classList.contains('open')) {
                // FIX: this should all be done in the view
                this.removeAllOpenClasses();
                this.el.classList.add('open');
                parentItem.classList.add('open');
                dropDownMenu.classList.add('open');
                this.openThisDropdown(dropDownMenu);
            }
        }
    }

    @on('click .submenu-zone .close')
    closeSubmenu(e) {
        this.removeAllOpenClasses();
        e.preventDefault();
        e.stopPropagation();
    }

    @on('keydown .expand')
    onKeydownToggleFullScreenNav(e) {
        if (document.activeElement === e.target && [$.key.space, $.key.enter].includes(e.keyCode)) {
            e.preventDefault();
            this.toggleFullScreenNav(e.target);
        }
    }

    // Left and right arrows go through menu items
    @on('keydown a[role="menuitem"]:focus')
    nextOrPrevious(event) {
        const container = event.target.parentNode;

        if (event.keyCode === $.key.left) {
            container.previousSibling && container.previousSibling.querySelector('[role="menuitem"]').focus();
        }
        if (event.keyCode === $.key.right) {
            container.nextSibling && container.nextSibling.querySelector('[role="menuitem"]').focus();
        }
    }

    // FIX: should be done in the view
    openThisDropdown(menu) {
        menu.setAttribute('aria-expanded', 'true');

        for (const a of menu.querySelectorAll('a')) {
            a.setAttribute('tabindex', '0');
        }
    }

    resetHeader(e) {
        const target = e.target;

        const urlClick = e && linkHelper.validUrlClick(e);

        if (urlClick) {
            if (!urlClick.parentNode.classList.contains('dropdown')) {
                this.closeDropdownMenus(true);
                this.closeFullScreenNav();
            }
        } else if (!this.el.classList.contains('active')) {
            this.closeFullScreenNav();
        } else {
            this.updateHeaderStyle();
        }
    }

    // FIX: should be done in the view
    closeDropdownMenus(all) {
        const menus = this.el.querySelectorAll('.dropdown-menu');

        for (const menu of menus) {
            if (all || !menu.contains(document.activeElement)) {
                menu.setAttribute('aria-expanded', 'false');

                for (const a of menu.querySelectorAll('a')) {
                    a.setAttribute('tabindex', '-1');
                }
            }
        }
    }

    updateHeaderStyle() {
        const height = this.height;

        if (window.pageYOffset > height && !this.isPinned()) {
            this.reset().pin();
        } else if (window.pageYOffset <= height) {
            if (window.location.pathname === '/') {
                this.reset().transparent();
            } else {
                this.reset();
            }
        }
    }

}

const header = new Header();

export default header;
