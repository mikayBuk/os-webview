import React from 'react';
import useDocumentHead, {useCanonicalLink, useNoIndex} from '~/helpers/use-document-head';
import RawHTML from '~/components/jsx-helpers/raw-html';
import {useTextFromSlug} from '~/helpers/page-data-utils';
import useRouterContext from '~/components/shell/router-context';
import {useLocation} from 'react-router-dom';
import './general.scss';

function GeneralPage({html}) {
    const parser = new window.DOMParser();
    const newDoc = parser.parseFromString(html, 'text/html');
    const strips = parser
        .parseFromString(
            '<img class="strips" src="/dist/images/components/strips.svg" height="10" alt="">',
            'text/html'
        )
        .querySelector('img');
    const innerHTML = Array.from(newDoc.body.children).reduce((arr, el) => {
        if (el.classList.contains('block-heading')) {
            el.innerHTML = `<h1>${el.innerHTML.trim()}</h1>`;
            el.appendChild(strips);
        }
        arr.push(el.outerHTML);
        return arr;
    }, []).join('\n');

    return (
        <RawHTML className="general page" html={innerHTML} embed />
    );
}

function isCanonical(slug) {
    return slug.includes('kinetic') || slug.endsWith('partner-program');
}

export function GeneralPageFromSlug({slug, fallback}) {
    const {head, text: html} = useTextFromSlug(slug);
    const {fail} = useRouterContext();
    const canonicalPath = slug.replace(/.*\//, '/');
    const putCanonicalLinkInPage = isCanonical(slug);

    if (html instanceof Error) {
        fallback ? fallback() : fail(`Could not load general page from ${slug}`);
    }

    useDocumentHead({
        title: head?.title || 'OpenStax',
        description: head?.description,
        noindex: true
    });

    useCanonicalLink(putCanonicalLinkInPage, canonicalPath);
    useNoIndex(!putCanonicalLinkInPage);

    return (
        <main>
            {html ? <GeneralPage html={html} /> : <h1>Loading...</h1>}
        </main>
    );
}

export default function GeneralPageLoader() {
    const {pathname} = useLocation();
    const slug = pathname.substr(1).replace('general', 'spike');

    return (
        <GeneralPageFromSlug slug={slug} />
    );
}
