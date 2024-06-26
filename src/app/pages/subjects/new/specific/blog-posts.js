import React from 'react';
import CarouselSection from './components/carousel-section';
import useSpecificSubjectContext from './context';
import {useDataFromSlug} from '~/helpers/page-data-utils';
import useOptimizedImage from '~/helpers/use-optimized-image';
import useEnglishSubject from './use-english-subject';
import {useIntl} from 'react-intl';
import './blog-posts.scss';

function Card({article_image: image, title: linkText, slug}) {
    const link = `/blog/${slug}`;
    const optimizedImage = useOptimizedImage(image, 400);

    return (
        <div className="card">
            <img src={optimizedImage} role="presentation" />
            <a href={link}>{linkText}</a>
        </div>
    );
}

function BlogPosts() {
    const {
        blogHeader: {content: {heading, blogDescription, linkText, linkHref}}
    } = useSpecificSubjectContext();
    const cms = useEnglishSubject();
    const blurbs = useDataFromSlug(`search/?subjects=${cms}`) || [];
    const intl = useIntl();

    return (
        blurbs.length ?
            <CarouselSection
                id="blog-posts" className="blog-posts"
                heading={heading}
                description={blogDescription}
                linkUrl={linkHref} linkText={linkText}
                thing='blog entries'
                minWidth={260}
            >
                {blurbs.map((blurb) => <Card {...blurb} key={blurb.link} />)}
            </CarouselSection> :
            <h2>{intl.formatMessage({id: 'subject.noBlog'})}</h2>
    );
}

export default function MaybeBlogPosts() {
    const ctx = useSpecificSubjectContext();

    if (!ctx?.blogHeader) {
        return null;
    }

    return (
        <BlogPosts />
    );
}
