import {Controller} from 'superb';
import {on} from '~/helpers/controller/decorators';
import $ from '~/helpers/$';
import settings from 'settings';
import {description as template} from './give.html';

const studentModel = {
    headline: 'Help Us Make More Free Books!',
    subhead: `Like having a textbook for free? Your donation helps us provide access
    to free textbooks for more students like you.`,
    amounts: [5, 10, 15, 25, 50, 100]
};

export default class Give extends Controller {

    init() {
        const queryDict = $.parseSearchString(window.location.search);

        this.template = template;
        this.model = {
            headline: 'Give to OpenStax',
            subhead: `Your donation helps us create opportunities for students to have
            access to quality free and low-cost educational materials. With your gift,
            we can create and revise our free textbooks, finetune our adaptive learning
            tools, and spread the word to more instructors and students. Your donation
            changes lives.`,
            thankYouUrl: `${settings.apiOrigin}/confirmation?give`,
            amounts: [5, 25, 50, 100, 500, 1000]
        };
        if ('student' in queryDict) {
            Object.assign(this.model, studentModel);
        }
        this.css = '/app/pages/give/give.css';
        this.view = {
            classes: ['give-page']
        };
    }

    onLoaded() {
        document.title = 'Give - OpenStax';
        this.setAmount(5);
    }

    setAmount(amount) {
        this.model.selectedAmount = amount;
        this.model.otherAmount = this.model.amounts.includes(amount) ? null : amount;
        this.update();
    }

    @on('click .amount')
    selectAmount(event) {
        this.setAmount(+event.target.dataset.value);
    }

    @on('change .amount-input')
    setCustomAmount(event) {
        this.setAmount(+event.target.value);
    }

}
