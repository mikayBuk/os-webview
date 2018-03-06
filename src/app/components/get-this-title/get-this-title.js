import {Controller} from 'superb.js';
import {on} from '~/helpers/controller/decorators';
import $ from '~/helpers/$';
import userModel from '~/models/usermodel';
import router from '~/router';
import TocDialog from './toc-dialog/toc-dialog';
import OrderPrintCopy from './order-print-copy/order-print-copy';
import shell from '~/components/shell/shell';
import {highSchoolSlugs} from '~/models/book-titles';
import {description as template} from './get-this-title.html';
import {description as polishTemplate} from './get-this-title-polish.html';

export default class GetThisTitle extends Controller {

    init(data) {
        this.template = data.slug.substr(-6) === 'polska' ? polishTemplate : template;
        this.css = '/app/components/get-this-title/get-this-title.css';
        this.regions = {
            submenu: '.submenu',
            toc: '.toc-region'
        };
        this.view = {
            classes: ['get-this-title']
        };

        const isHighSchool = highSchoolSlugs.includes(data.slug);
        const printLink = [data.amazon_link, data.amazon_coming_soon, data.bookstore_link,
            data.bookstore_coming_soon, isHighSchool].find((x) => x);

        this.model = {
            includeTOC: data.includeTOC,
            tableOfContents: data.table_of_contents,
            ibookLink: data.ibook_link,
            ibookLink2: data.ibook_link_volume_2,
            kindleLink: data.kindle_link,
            webviewLink: data.webview_link,
            comingSoon: data.coming_soon,
            bookshareLink: data.bookshare_link,
            pdfLink: (data.high_resolution_pdf_url || data.low_resolution_pdf_url),
            printLink,
            isHighSchool,
            submenu: '',
            hiRes: data.high_resolution_pdf_url,
            loRes: data.low_resolution_pdf_url,
            amazon: {
                link: data.amazon_link,
                comingSoon: data.amazon_coming_soon,
                price: data.amazon_price.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }),
                blurb: data.amazon_blurb
            },
            bookstore: {
                link: data.bookstore_link,
                comingSoon: data.bookstore_coming_soon,
                blurb: data.bookstore_blurb
            },
            slug: data.slug
        };
    }

    onLoaded() {
        this.printCopyContent = new OrderPrintCopy({
            individualLink: this.model.amazon.link,
            amazonPrice: this.model.amazon.price,
            bookstoreLink: this.model.bookstore.link,
            bulkLink: this.model.isHighSchool ? '/bulk-order?this.model.slug' : null
        });
        if (this.model.tableOfContents) {
            this.tocContent = new TocDialog({
                tableOfContents: this.model.tableOfContents,
                webviewLink: this.model.webviewLink
            });
        }
    }

    @on('click .btn')
    blurAfterClick(event) {
        event.target.blur();
    }

    @on('click .show-pdf-submenu')
    showPdfSubmenu(event) {
        event.preventDefault();
        this.model.submenu = 'pdf';
        this.update();
        // Focus on first link
        this.el.querySelector('.pdf-submenu a').focus();
    }

    @on('click .show-print-submenu')
    showPrintSubmenu(event) {
        event.preventDefault();
        shell.showDialog(() => ({
            title: 'Order print copy',
            content: this.printCopyContent
        }));
    }

    @on('click .submenu .remover')
    hideSubmenu() {
        this.model.submenu = '';
        this.update();
    }

    @on('keydown .submenu .remover')
    operateByKey(event) {
        if ([$.key.space, $.key.enter].includes(event.keyCode)) {
            event.preventDefault();
            this.hideSubmenu();
        }
    }

    @on('click [href*="cnx.org/content"],:not(.show-pdf-submenu)[href$=".pdf"]')
    showGive() {
        userModel.load().then((userInfo) => {
            if (!userInfo.is_superuser && !userInfo.is_staff) {
                router.navigate('/give?student', {path: '/give?student'});
            }
        });
    }

    @on('click .show-toc')
    showToc(event) {
        event.preventDefault();
        shell.showDialog(() => ({
            title: 'Table of contents',
            content: this.tocContent
        }));
    }

}
