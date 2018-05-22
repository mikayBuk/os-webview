import VERSION from '~/version';
import SalesforceForm from '~/controllers/salesforce-form';
import salesforce from '~/models/salesforce';
import BookCheckbox from '~/components/book-checkbox/book-checkbox';
import $ from '~/helpers/$';
import {description as template} from './book-selector.html';

export default class BookSelector extends SalesforceForm {

    init(getProps, onChange) {
        super.init();
        this.template = template;
        this.getProps = getProps;
        this.onChange = onChange;
        this.view = {
            classes: ['book-selector']
        };
        this.css = `/app/components/book-selector/book-selector.css?${VERSION}`;
        this.model = () => this.getModel();
        this.subjects = [];
        this.salesforceTitles = [];
        this.booksBySubject = (subject) =>
            this.salesforceTitles
                .filter((b) => b.subject === subject)
        ;
        this.booksSorted = () =>
            this.salesforceTitles.slice().sort((a, b) => {
                const subA = this.subjects.indexOf(a.subject);
                const subB = this.subjects.indexOf(b.subject);
                const indA = this.salesforceTitles.findIndex((t) => t.value === a.value);
                const indB = this.salesforceTitles.findIndex((t) => t.value === b.value);

                if (subA < subB) {
                    return -1;
                }
                if (subA > subB) {
                    return 1;
                }
                if (indA < indB) {
                    return -1;
                }
                return 1; // They won't be equal
            });
        this.bookIsSelected = {};
        this.validated = false;
    }

    getModel() {
        this.props = this.getProps();

        return {
            prompt: this.props.prompt,
            subjects: this.subjects,
            booksBySubject: this.booksBySubject,
            validationMessage: this.validationMessage
        };
    }

    get selectedBooks() {
        return this.booksSorted()
            .filter((b) => Boolean(this.bookIsSelected[b.value]));
    }

    onDataLoaded() {
        super.onDataLoaded();
        this.subjects = Array.from(new Set(this.salesforceTitles.map((book) => book.subject))).sort();
        this.update();

        const Region = this.regions.self.constructor;
        const checkboxSubjectSections = this.el.querySelectorAll('[data-subject]');

        for (const subjectEl of checkboxSubjectSections) {
            const subject = subjectEl.getAttribute('data-subject');
            const containers = Array.from(subjectEl.querySelectorAll('[data-book-checkbox]'));
            const books = this.booksBySubject(subject);

            for (let i=0; i<containers.length; ++i) {
                const cEl = containers[i];
                const book = books[i];
                const onChange = (checked) => {
                    this.bookIsSelected[book.value] = checked;
                    if (this.onChange) {
                        this.onChange(this.selectedBooks);
                    }
                    this.update();
                };
                const checkboxComponent = new BookCheckbox(() => ({
                    name: this.props.name,
                    value: book.value,
                    imageUrl: book.coverUrl,
                    label: book.text
                }), onChange);
                const region = new Region(cEl, this);

                region.attach(checkboxComponent);
            }
        }
    }

    validate() {
        this.validated = true;
        this.update();
        return Boolean(this.validationMessage);
    }

    get validationMessage() {
        if (this.validated && this.props.required && this.selectedBooks.length === 0) {
            return 'Please select at least one book';
        }
        return '';
    }

}
