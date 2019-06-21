import componentType, {canonicalLinkMixin, flattenPageDataMixin, loaderMixin} from '~/helpers/controller/init-mixin';
import css from './rover-by-openstax.css';
import bannerSection from './sections/banner';
import videoSection from './sections/video';
import meetRoverSection from './sections/meet-rover';
import stepwiseSection from './sections/stepwise';
import gettingStartedSection from './sections/getting-started';
import lmsSection from './sections/lms';
import faqSection from './sections/faq';
import StickyFooter from '~/components/sticky-footer/sticky-footer';
import Navigator from './sections/navigator/navigator';
import PopupContent from './popup/popup';
import ModalContent from '~/components/modal-content/modal-content';
import {on} from '~/helpers/controller/decorators';

const spec = {
    css,
    view: {
        classes: ['rover-by-openstax', 'page'],
        tag: 'main'
    },
    slug: 'pages/rover-2',
    model() {
        return {
        };
    },
    preserveWrapping: true
};
const BaseClass = componentType(spec, canonicalLinkMixin, flattenPageDataMixin, loaderMixin);

export default class RoverRedesign extends BaseClass {

    onDataLoaded() {
        const data = this.flattenPageData();
        const floatingTools = new (componentType({
            view: {
                classes: ['floating-tools']
            }
        }))();
        const headerImage = (data.section_1.image || {}).file;
        const sections = [
            bannerSection({
                model: {
                    headerImage,
                    mobileHeaderImage: headerImage,
                    headerImageAltText: 'Rover logo',
                    accessLink: 'transition-popup',
                    accessText: data.section_1.accessButtonCta,
                    headline: 'Rover by OpenStax',
                    introHtml: data.section_1.blurb,
                    button1Url: data.section_1.buttonLink,
                    button1Text: data.section_1.buttonCta
                }
            }),
            videoSection({
                model: {
                    heading: data.section_2.heading,
                    linkText: data.section_2.navText,
                    subhead: data.section_2.subheading,
                    description: data.section_2.blurb,
                    video: data.section_2.video
                }
            }),
            meetRoverSection({
                model: {
                    heading: data.section_3.heading,
                    linkText: data.section_3.navText,
                    description: data.section_3.subheading,
                    cards: data.section_3.cards.map((c) => ({
                        image: c.icon.file,
                        description: c.blurb
                    })),
                    webinarLink: data.section_3.buttonLink,
                    webinarLinkText: data.section_3.buttonCta
                }
            }),
            stepwiseSection({
                model: {
                    heading: data.section_4.heading,
                    linkText: data.section_4.navText,
                    description: data.section_4.blurb,
                    cards: data.section_4.cards.map((c) => ({
                        heading: c.heading,
                        description: c.blurb,
                        image: {
                            image: c.image.file,
                            imageAltText: c.imageAltText
                        }
                    }))
                }
            }),
            lmsSection({
                model: {
                    heading: data.section_6.heading,
                    linkText: data.section_6.navText,
                    description: data.section_6.blurb,
                    image: {
                        image: data.section_6.image.file,
                        altText: data.section_6.imageAltText
                    },
                    caption: data.section_6.caption
                }
            }),
            gettingStartedSection({
                model: {
                    heading: data.section_5.heading,
                    linkText: data.section_5.navText,
                    description: data.section_5.blurb,
                    cards: data.section_5.cards.map((c) => ({
                        heading: c.heading,
                        description: c.blurb,
                        video: c.video
                    }))
                }
            }),
            faqSection({
                model: {
                    heading: 'Frequently Asked Questions',
                    linkText: data.section_7.navText,
                    questions: data.section_7.faqs
                }
            }),
            new StickyFooter({
                leftButton: {
                    link: data.section_7.webinarButtonUrl,
                    text: data.section_7.webinarButtonCta,
                    description: ''
                },
                rightButton: {
                    link: 'transition-popup',
                    text: data.section_7.signupButtonCta,
                    description: ''
                }
            }),
            floatingTools
        ];

        this.hideLoader();
        sections.forEach((section) => {
            this.regions.self.append(section);
        });

        const navModel = sections.filter((s) => s.model && s.model.linkText)
            .map((s) => ({
                id: s.el.id,
                heading: s.model.linkText
            }));

        navModel.heading = this.pageData.nav_title;
        const navigator = new Navigator({
            model: navModel
        });

        // This is kind of rude
        sections[0].regions.self.append(navigator);
        // Pardot tracking
        if ('piTracker' in window) {
            piTracker(window.location.href.split('#')[0]);
        }
        const cmsPopupData = data.popup.content[0];

        this.popupData = Object.assign(
            {
                loginUrl: data.section_1.accessButtonLink,
                image: cmsPopupData.backgroundImage.file
            },
            cmsPopupData
        );
    }

    @on('click a[href="transition-popup"]')
    showPopup(event) {
        event.preventDefault();
        const popupContent = new PopupContent({
            model: this.popupData
        });
        const modalContent = new ModalContent(popupContent);

        this.regions.self.append(modalContent);
        popupContent.on('cancel', () => {
            const mcEl = modalContent.el;
            const mcIdx = this.regions.self.controllers.indexOf(modalContent);

            modalContent.detach();
            // Necessary due to a bug in superb
            mcEl.parentNode.removeChild(mcEl);
            this.regions.self.controllers.splice(mcIdx, 1);
        });
    }

}
