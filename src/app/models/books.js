import cmsFetch from '~/helpers/cms-fetch';

const fetchBooks = cmsFetch('books?format=json')
    .then((r) => r.books.filter((b) => b.book_state !== 'retired'));

export default fetchBooks;

const statesToInclude = ['live', 'new_edition_available', 'coming_soon'];

export function salesforceTitles(books) {
    const seenTitles = {};

    return Object.keys(books)
        .map((key) => books[key])
        .filter((book) => {
            const abbrev = book.salesforce_abbreviation;
            const seen = abbrev in seenTitles;

            if (statesToInclude.includes(book.book_state)) {
                seenTitles[abbrev] = true;
            }
            return abbrev && !seen && statesToInclude.includes(book.book_state);
        })
        .map((book) => ({
            text: book.salesforce_name,
            value: book.salesforce_abbreviation,
            comingSoon: book.book_state === 'coming_soon',
            subjects: book.subjects,
            coverUrl: book.cover_url
        }))
        .sort((a, b) => a.text < b.text ? -1 : 1);
}

export function subjects(sfTitles) {
    return sfTitles.reduce((a, b) => a.concat(b.subjects), [])
        .reduce((a, b) => a.includes(b) ? a : a.concat(b), []);
}

export function afterFormSubmit(navigate, preselectedTitle, selectedBooks) {
    fetchBooks.then((b) => {
        const liveBooks = b.filter((entry) => statesToInclude.includes(entry.book_state));
        const backTo = liveBooks.find((entry) => entry.salesforce_abbreviation === preselectedTitle);

        /* Send to Tech Scout with books pre-selected */
        const scoutBooks = selectedBooks.map((sfBook) => sfBook.value);

        navigate('/partners', {
            state: {
                confirmation: true,
                book: scoutBooks,
                slug: backTo?.slug
            }
        });
    });
}
