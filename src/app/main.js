import $ from './helpers/$';
import router from './router';
import ReactModal from 'react-modal';
import ReactDOM from 'react-dom';
import './sentry';

ReactModal.setAppElement('#main');

if (!$.isSupported()) {
    /* eslint no-alert: 0 */
    alert('Our site is designed to work with recent versions of Chrome,' +
    ' Firefox, Edge and Safari. It may not work in your browser.');
}

ReactDOM.render(router, document.getElementById('main'));
