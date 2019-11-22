import componentType, {insertHtmlMixin} from '~/helpers/controller/init-mixin';
import settings from 'settings';
import {description as template} from './resource-box.html';
import css from './resource-box.css';

const spec = {
    template,
    css,
    view: {
        classes: ['resource-box']
    }
};

function encodeLocation(search) {
    const pathWithoutSearch = `${window.location.origin}${window.location.pathname}`;

    return encodeURIComponent(`${pathWithoutSearch}?${search}`);
}

function resourceBoxPermissions({
    resourceData, userStatus, search, resourceStatus, loginUrl
}) {
    const isExternal = Boolean(resourceData.link_external);
    const status = resourceStatus();
    const statusToPermissions = {
        unlocked: {
            iconType: isExternal ? 'external-link-alt' : 'download',
            link: {
                text: resourceData.link_text,
                url: resourceData.link_external || resourceData.link_document_url
            }
        },
        pending: {
            iconType: 'lock'
        },
        locked: {
            iconType: 'lock',
            link: {
                text: 'Log in to unlock',
                url: loginUrl
            }
        }
    };

    return statusToPermissions[status];
}

export default class extends componentType(spec, insertHtmlMixin) {

    // Utility function to set the values associated with whether the resource
    // is available to the user (instructor version)
    static instructorResourceBoxPermissions(resourceData, userStatus, search) {
        const resourceStatus = () => {
            if (resourceData.resource_unlocked || userStatus.isInstructor) {
                return 'unlocked';
            }
            if (userStatus.pendingVerification) {
                return 'pending';
            }
            return 'locked';
        };
        const encodedLocation = encodeLocation(search);
        const loginUrl = userStatus.userInfo && userStatus.userInfo.id ?
            `${settings.accountHref}/faculty_access/apply?r=${encodedLocation}` :
            `${settings.apiOrigin}/oxauth/login/?next=${encodedLocation}`;

        return resourceBoxPermissions({
            resourceData,
            userStatus,
            search,
            resourceStatus,
            loginUrl
        });
    };

    // Utility function for student resources
    static studentResourceBoxPermissions(resourceData, userStatus, search) {
        const resourceStatus = () => {
            if (resourceData.resource_unlocked || userStatus.isStudent || userStatus.isInstructor) {
                return 'unlocked';
            }
            return 'locked';
        };
        const loginUrl = `${settings.apiOrigin}/oxauth/login/?next=${encodeLocation(search)}`;

        return resourceBoxPermissions({
            resourceData,
            userStatus,
            search,
            resourceStatus,
            loginUrl
        });
    };

    init(model) {
        super.init();
        this.model = model;
        if (model.link) {
            this.view = Object.assign({}, this.view, {
                tag: 'a',
                attributes: {
                    href: model.link.url,
                    'data-local': model.iconType === 'lock' ? 'true' : 'false'
                }
            });
        }
        if (model.comingSoon) {
            this.view = Object.assign({}, this.view);
            this.view.classes = [...this.view.classes, 'coming-soon'];
            model.description = `<p>${model.comingSoonText}</p>`;
        }
    }

}
