import VERSION from '~/version';
import CMSPageController from '~/controllers/cms';
import $ from '~/helpers/$';
import settings from 'settings';
import {description as template} from './footer.html';

class Footer extends CMSPageController {

    init() {
        this.template = template;
        this.css = `/app/components/shell/footer/footer.css?${VERSION}`;
        this.view = {
            tag: 'footer',
            classes: ['page-footer']
        };
        this.model = {};
        this.slug = 'footer';
        /* eslint arrow-parens: 0 */
        (async () => {
            try {
                const response = await fetch(`${settings.apiOrigin}/api/documents?search=press%20kit`);
                const data = await response.json();

                if (data.length) {
                    this.model.pressKitData = data[0];
                    this.update();
                }
            } catch (e) {
                console.log(e);
            }
        })();
    }

    onDataLoaded() {
        const pd = this.pageData;

        Object.assign(this.model, {
            apStatement: pd.ap_statement,
            copyright: pd.copyright,
            supporters: pd.supporters,
            twitterLink: pd.twitter_link,
            facebookLink: pd.facebook_link,
            linkedinLink: pd.linkedin_link
        });
        this.update();
        this.onLoaded();
    }

    onLoaded() {
        $.insertHtml(this.el, this.model);
    }

}

const footer = new Footer();

export default footer;
