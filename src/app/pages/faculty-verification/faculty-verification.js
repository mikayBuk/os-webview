import {Controller} from 'superb';
import $ from '~/helpers/$';
import {on} from '~/helpers/controller/decorators';
import selectHandler from '~/handlers/select';
import bookTitles from '~/models/book-titles';
import userModel from '~/models/usermodel';
import salesforceModel from '~/models/salesforce';
import {description as template} from './faculty-verification.html';

export default class FacultyVerificationForm extends Controller {

    testInstitutionalEmail() {
        const institutionalEmailInput = this.el.querySelector('[name="00NU0000005oVQV"]');
        const isValid = $.testInstitutionalEmail(institutionalEmailInput);

        institutionalEmailInput.setCustomValidity(isValid ? '' : 'We cannot verify a generic email address');
        return isValid;
    }

    @on('click [type="submit"]')
    doCustomValidation(event) {
        const invalid = this.el.querySelector('form:invalid');

        this.hasBeenSubmitted = true;
        if (invalid) {
            event.preventDefault();
            this.update();
        }
    }

    @on('focusout input')
    markVisited(event) {
        event.delegateTarget.classList.add('visited');
    }

    @on('change')
    updateOnChange() {
        this.testInstitutionalEmail();
        this.update();
    }

    init() {
        this.template = template;
        this.css = '/app/pages/faculty-verification/faculty-verification.css';
        this.view = {
            classes: ['faculty-verification-form']
        };
        const titles = bookTitles.map((titleData) =>
            titleData.text ? titleData : {
                text: titleData,
                value: titleData
            }
        );

        this.model = {
            titles,
            adoptionOptions: salesforceModel.adoption(['adopted', 'recommended', 'no']),
            validationMessage: (name) => this.hasBeenSubmitted ?
                this.el.querySelector(`[name="${name}"]`).validationMessage :
                ''
        };
    }

    onLoaded() {
        document.title = 'Instructor Verification - OpenStax';
        selectHandler.setup(this);
        userModel.load().then((user) => {
            if (user.username) {
                this.model.firstName = user.first_name;
                this.model.lastName = user.last_name;
                this.model.userId = user.username;
                this.model.accountId = user.accounts_id;
                this.model.pendingVerification = user.pending_verification;

                if (user.accounts_id === null) {
                    this.model.problemMessage = 'Could not load user information';
                } else {
                    this.model.problemMessage = '';
                }

                this.update();
            } else {
                const loginLink = document.querySelector('.nav-menu-item.login > a');

                loginLink.click();
            }
        });
    }

}
