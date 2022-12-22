import React, {useState, useEffect, useRef} from 'react';
import usePartnerContext, {PartnerContextProvider} from './partner-context';
import Synopsis from './synopsis/synopsis';
import Carousel from './carousel/carousel';
// import Reviews from './reviews/reviews';
import RawHTML from '~/components/jsx-helpers/raw-html';
import TabGroup from '~/components/tab-group/tab-group';
import ContentGroup from '~/components/content-group/content-group';
import booksPromise from '~/models/books';
import analyticsEvents from '../analytics-events';
import InfoRequestForm from './info-request-form/info-request-form';
import './partner-details.scss';

function useRealTitles(books) {
    const [titles, setTitles] = useState(books);

    function getTitlesFromAbbreviations(abbreviations, bookInfo) {
        return abbreviations
            .map((abbrev) => bookInfo.find((b) => b.salesforce_abbreviation === abbrev) || abbrev)
            .filter((b) => {
                const found = typeof b === 'object';

                if (!found) {
                    console.warn('Book not found:', b);
                }
                return found;
            })
            .map((b) => b.salesforce_name);
    }

    useEffect(
        () =>
            booksPromise.then((results) => setTitles(getTitlesFromAbbreviations(books, results))),
        [books]
    );

    return titles;
}

// -- RESTORE this to use the new form
function RequestInfoButton({infoText='Request info', partnerName}) {
    const {toggleForm, books} = usePartnerContext();
    const validTitle = books.find((b) => b.length > 0); // Quirk: no books is an array of one empty string

    function gotoForm() {
        analyticsEvents.requestInfo(partnerName);
        toggleForm();
    }

    if (!validTitle) {
        return null;
    }

    return (
        <section>
            <button
                type="button" className="primary"
                onClick={gotoForm}
            >{infoText}</button>
        </section>
    );
}

// -- This uses the old form
/*
function RequestInfoButton({infoUrl, infoText='Request info', partnerName}) {
    const {books} = usePartnerContext();
    const validTitle = books.find((b) => b.length > 0); // Quirk: no books is an array of one empty string

    function trackInfoRequest() {
        analyticsEvents.requestInfo(partnerName);
    }

    // NOTE: click is not propagating up to router. For external form, target is _blank
    // For custom local form, remove that.
    return (
        infoUrl && validTitle && (
            <section>
                <a
                    className="btn primary" href={infoUrl} onClick={trackInfoRequest}
                    target="_blank" rel="noreferrer"
                >
                    {infoText}
                </a>
            </section>
        )
    );
}
*/

function Overview({model, icon}) {
    const {
        richDescription: description,
        infoUrl, infoLinkText: infoText,
        books, images, videos, title: partnerName
    } = model;
    const titles = useRealTitles(books);
    const {toggleForm} = usePartnerContext();

    if (!toggleForm) {
        return null;
    }

    // For TESTING
    // if (images.length < 6) {
    //     images.push(...([1,2,3,4,'last'].map(
    //         (i) => `https://via.placeholder.com/150x150?text=[image ${i}]`
    //     )));
    // }
    // console.info('Images', images);
    // TESTING
    return (
        <React.Fragment>
            <section className="carousel">
                <Carousel {...{icon, images, videos}} />
            </section>
            <RequestInfoButton {...{infoUrl, infoText, partnerName}} />
            <hr />
            <section className="overview">
                <h2>Overview</h2>
                <RawHTML className="main-text" html={description} />
                <h2>Related Books</h2>
                <div className="titles">
                    {
                        titles.map((title) =>
                            <span className="title" key={title}>{title}</span>
                        )
                    }
                </div>
            </section>
        </React.Fragment>
    );
}

function logScrollingInRegion(detailsEl, name) {
    if (!detailsEl) {
        return null;
    }
    const scrollingRegion = detailsEl.closest('.main-region');
    const removeScrollListener = (callback) => scrollingRegion.removeEventListener('scroll', callback);
    const scrollCallback = () => {
        analyticsEvents.lightboxScroll(name);
        removeScrollListener(scrollCallback);
    };

    scrollingRegion.addEventListener('scroll', scrollCallback);

    return () => removeScrollListener(scrollCallback);
}

function PartnerDetails({model}) {
    const {
        website, partnerWebsite, websiteLinkText: partnerLinkText,
        logoUrl
    } = model;
    const icon = logoUrl || 'https://via.placeholder.com/150x150?text=[no%20logo]';
    const partnerLinkProps = {partnerUrl: website || partnerWebsite, partnerLinkText};
    // ** Restore the Reviews tab when using Reviews again
    // const labels = ['Overview', 'Reviews'];
    const labels = ['Overview'];
    const [selectedLabel, setSelectedLabel] = useState(labels[0]);
    const ref = useRef();

    useEffect(() => logScrollingInRegion(ref.current, model.title), [model.title]);

    useEffect(() => {
        if (selectedLabel === 'Reviews') {
            analyticsEvents.viewReviews(model.title);
        }
    }, [selectedLabel, model.title]);

    return (
        <div
            className="partner-details" onClick={(e) => e.stopPropagation()}
            ref={ref}
        >
            <div className="sticky-region">
                <Synopsis {...{model, icon, partnerLinkProps}} />
                <TabGroup {...{labels, selectedLabel, setSelectedLabel}} />
            </div>
            <div className="scrolling-region boxed" onClick={(e) => e.stopPropagation()}>
                <div className="tab-content">
                    <ContentGroup activeIndex={labels.indexOf(selectedLabel)}>
                        <Overview model={model} icon={icon} />
                        {
                            // ** Restore when using Reviews again
                            // <Reviews partnerId={model.id} />
                        }
                    </ContentGroup>
                </div>
            </div>
        </div>
    );
}

function PartnerDetailsOrInfoRequestForm({model}) {
    const {showInfoRequestForm} = usePartnerContext();

    return showInfoRequestForm ? (
        <InfoRequestForm />
    ) : (
        <PartnerDetails model={model} />
    );
}

export default function PartnerDetailsWrapper({detailData: {id, ...model}}) {
    return (
        <PartnerContextProvider contextValueParameters={{id, model}}>
            <PartnerDetailsOrInfoRequestForm model={model} />
        </PartnerContextProvider>
    );
}
