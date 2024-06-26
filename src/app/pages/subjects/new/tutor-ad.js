import React from 'react';
import useSubjectsContext from './context';
import RawHTML from '~/components/jsx-helpers/raw-html';
import useOptimizedImage from '~/helpers/use-optimized-image';
import './tutor-ad.scss';

export function TutorAdThatTakesData({heading, image, html, ctaLink, ctaText}) {
    const optimizedImage = useOptimizedImage(image?.file, 400);

    return (
        <section className="tutor-ad">
            <div className="content">
                <h2>{heading}</h2>
                <img role="presentation" src={optimizedImage} />
                <RawHTML html={html} />
                <a data-analytics-link className="btn primary" href={ctaLink}>{ctaText}</a>
            </div>
        </section>
    );
}

export default function TutorAd() {
    const {tutorAd} = useSubjectsContext();
    const {image, heading, adHtml: html, linkHref: ctaLink, linkText: ctaText} = tutorAd[0].value;

    return (
        <TutorAdThatTakesData {...{heading, image, html, ctaLink, ctaText}} />
    );
}
