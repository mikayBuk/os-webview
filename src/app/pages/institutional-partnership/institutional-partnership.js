import React from 'react';
import LoaderPage from '~/components/jsx-helpers/loader-page';
import LazyLoad from 'react-lazyload';
import {camelCaseKeys} from '~/helpers/page-data-utils';
import Banner from './sections/banner/banner';
import OverlappingQuote from './sections/overlapping-quote/overlapping-quote';
import About from './sections/about/about';
import Promoting from './sections/promoting/promoting';
import BigQuote from './sections/big-quote/big-quote';
import Speaking from './sections/speaking/speaking';
import Results from './sections/results/results';
import Participants from './sections/participants/participants';
import SmallQuote from './sections/small-quote/small-quote';
import SignUp from './sections/sign-up/sign-up';
import './institutional-partnership.scss';

function unprefixKey(newObject, oldKey, prefix, data) {
    const newKey = oldKey.replace(prefix, '');

    newObject[newKey] = data[oldKey];
    return newObject;
}

function sectionData(data, sectionNumber) {
    const sectionPrefix = `section_${sectionNumber}_`;

    return camelCaseKeys(
        Reflect.ownKeys(data)
            .filter((k) => k.startsWith(sectionPrefix))
            .reduce(
                (a, oldKey) => unprefixKey(a, oldKey, sectionPrefix, data), {}
            )
    );
}

function quoteData(data) {
    return Reflect.ownKeys(data)
        .filter((k) => k.startsWith('quote'))
        .reduce(
            (a, oldKey) => unprefixKey(a, oldKey, 'quote_', data), {}
        );
}

function InstitutionalPartnership({data}) {
    return (
        <React.Fragment>
            <Banner {...sectionData(data, 1)} />
            <OverlappingQuote {...quoteData(data)} />
            <About {...sectionData(data, 2)} />
            <LazyLoad>
                <Promoting {...sectionData(data, 3)} />
                <BigQuote
                    {...{
                        backgroundImage: data.section_4_background_image.meta.download_url,
                        ...sectionData(data, '4_quote')
                    }}
                />
            </LazyLoad>
            <LazyLoad>
                <Speaking {...sectionData(data, 5)} />
                <Results {...sectionData(data, 6)} />
            </LazyLoad>
            <LazyLoad>
                <Participants {...sectionData(data, 7)} />
                <SmallQuote {...sectionData(data, '8_quote')} />
            </LazyLoad>
            <LazyLoad>
                <SignUp {...sectionData(data, 9)} />
            </LazyLoad>
        </React.Fragment>
    );
}

const slug = 'pages/institutional-partners';

export default function PageLoader() {
    return (
        <main className="institutional-partnership page">
            <LoaderPage slug={slug} Child={InstitutionalPartnership} doDocumentSetup noCamelCase />
        </main>
    );
}
